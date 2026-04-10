import { useState, useEffect, useMemo, useRef } from 'react';
import { postsAPI, commentsAPI } from '../services/api';

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderContentWithMentions(content, mentionUserIds, idToName) {
  if (!content) return null;
  const names = (mentionUserIds || [])
    .map((id) => idToName.get(String(id)))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (!names.length) return content;
  const pattern = new RegExp(`(${names.map((n) => `@${escapeRegExp(n)}`).join('|')})`, 'g');
  const parts = content.split(pattern);
  return parts.map((part, i) => {
    const hit = names.some((n) => part === `@${n}`);
    if (hit) {
      return (
        <span key={i} className="bg-indigo-50 text-indigo-600 font-bold rounded px-1">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function CommentThread({
  comment,
  depth,
  currentUserId,
  replyingTo,
  setReplyingTo,
  onDelete,
  idToName,
}) {
  const indent = Math.min(depth, 3) * 14;

  return (
    <div
      className="mt-6 border-l-2 border-slate-100 pl-6"
      style={{ marginLeft: depth === 0 ? 0 : indent }}
    >
      <div className="bg-white p-6 rounded-[2rem] border border-slate-50 flex flex-col sm:flex-row sm:justify-between gap-6 group shadow-sm transition-all hover:shadow-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-white flex items-center justify-center text-indigo-600 font-black text-xs shrink-0 shadow-inner">
              {comment.isAnonymous ? '👻' : (comment.author?.name?.[0] || 'A').toUpperCase()}
            </div>
            <span className="font-black text-slate-900 text-sm tracking-tight text-lg">
              {comment.isAnonymous ? comment.authorAlias : comment.author?.name || 'Member'}
            </span>
            <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
              • {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-slate-600 text-[15px] leading-relaxed pl-1 sm:pl-11 sm:-mt-1 font-medium">
            {renderContentWithMentions(comment.content, comment.mentions, idToName)}
          </p>
          <div className="pl-1 sm:pl-11 flex gap-4">
            <button
                type="button"
                onClick={() =>
                setReplyingTo({
                    commentId: comment._id,
                    authorName: comment.isAnonymous ? comment.authorAlias : comment.author?.name || 'Member',
                })
                }
                className="mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-600 transition-colors"
            >
                Reply
            </button>
            {String(comment.authorId || comment.author?._id || comment.author) === String(currentUserId) && (
              <button
                type="button"
                onClick={() => onDelete(comment._id)}
                className="mt-4 text-[10px] font-black uppercase tracking-widest text-rose-300 hover:text-rose-500 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onDelete={onDelete}
              idToName={idToName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', isAnonymous: false });
  const [newComment, setNewComment] = useState({ content: '', isAnonymous: false });
  const [replyingTo, setReplyingTo] = useState(null);
  const [pendingMentions, setPendingMentions] = useState([]);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const textareaRef = useRef(null);

  const userRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
  const me = userRaw ? JSON.parse(userRaw) : null;
  const currentUserId = me?._id || me?.id || null;

  const idToName = useMemo(() => {
    const m = new Map();
    mentionCandidates.forEach((c) => m.set(String(c.userId), c.displayName));
    return m;
  }, [mentionCandidates]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAll();
      setPosts(response.posts ?? []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetails = async (postId) => {
    try {
      const [detail, candRes] = await Promise.all([
        postsAPI.getById(postId),
        postsAPI.getMentionCandidates(postId).catch(() => ({ candidates: [] })),
      ]);
      setSelectedPost(detail);
      setMentionCandidates(candRes.candidates ?? []);
    } catch (error) {
      console.error('Failed to fetch post details:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await postsAPI.create(newPost);
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', isAnonymous: false });
      fetchPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!selectedPost?.post?._id || !newComment.content.trim()) return;
    const postId = selectedPost.post._id;
    const body = {
      content: newComment.content.trim(),
      isAnonymous: newComment.isAnonymous,
      mentions: [...new Set(pendingMentions)],
      parentCommentId: replyingTo?.commentId || undefined,
    };
    try {
      if (replyingTo?.commentId) {
        await commentsAPI.reply(postId, replyingTo.commentId, body);
      } else {
        await commentsAPI.create(postId, body);
      }
      setNewComment({ content: '', isAnonymous: false });
      setReplyingTo(null);
      setPendingMentions([]);
      setMentionOpen(false);
      fetchPostDetails(postId);
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleCommentChange = (e) => {
    const v = e.target.value;
    setNewComment({ ...newComment, content: v });
    const pos = e.target.selectionStart ?? v.length;
    const before = v.slice(0, pos);
    const at = before.lastIndexOf('@');
    if (at === -1) {
      setMentionOpen(false);
      return;
    }
    const chunk = before.slice(at);
    if (chunk.includes('\n')) {
      setMentionOpen(false);
      return;
    }
    const afterAt = before.slice(at + 1);
    if (afterAt.includes(' ')) {
      setMentionOpen(false);
      return;
    }
    setMentionFilter(afterAt.toLowerCase());
    setMentionOpen(true);
  };

  const insertMention = (candidate) => {
    const ta = textareaRef.current;
    const v = newComment.content;
    const pos = ta?.selectionStart ?? v.length;
    const before = v.slice(0, pos);
    const after = v.slice(pos);
    const at = before.lastIndexOf('@');
    if (at === -1) return;
    const next = `${v.slice(0, at)}@${candidate.displayName} ${after}`;
    setNewComment({ ...newComment, content: next });
    setPendingMentions((p) => [...new Set([...p, String(candidate.userId)])]);
    setMentionOpen(false);
    requestAnimationFrame(() => {
      if (ta) {
        ta.focus();
        const newPos = at + candidate.displayName.length + 2;
        ta.setSelectionRange(newPos, newPos);
      }
    });
  };

  const filteredCandidates = mentionCandidates.filter((c) =>
    c.displayName.toLowerCase().includes(mentionFilter)
  );

  const handleLike = async (postId) => {
    try {
      await postsAPI.toggleLike(postId);
      fetchPosts();
      if (selectedPost && selectedPost.post._id === postId) {
        fetchPostDetails(postId);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleReport = async (postId) => {
    const reason = prompt('Please provide a reason for the reporting action:');
    if (reason) {
      try {
        await postsAPI.report(postId, reason);
        alert('Record flagged for review.');
      } catch (error) {
        console.error('Failed to report post:', error);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsAPI.delete(commentId);
      fetchPostDetails(selectedPost.post._id);
    } catch {
      console.error('Failed to delete comment');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Community Interface</p>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-1">
              Social <br />
              <span className="italic font-normal">Spectrum.</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn-serene-primary !px-10 !py-5 shadow-2xl shadow-indigo-100 flex items-center gap-4 text-lg"
          >
            <span>✨</span> Write Passage
          </button>
        </div>

        {loading ? (
          <div className="text-center py-40">
             <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
             <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Filtering Community Streams...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {posts.length === 0 ? (
              <div className="glass-panel !rounded-[4rem] p-32 text-center border-none shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32" />
                <div className="text-6xl block mb-10 italic font-serif text-slate-200">ø</div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4">Quiet Atmosphere</h3>
                <p className="text-slate-400 font-medium text-lg italic">Be the first to initiate a clinical passage.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="glass-card !p-12 hover:shadow-2xl hover:ring-8 ring-indigo-50/50 transition-all duration-700 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-50" />
                    
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-white shadow-inner flex items-center justify-center text-indigo-700 font-black shadow-md text-2xl">
                          {post.isAnonymous ? '👤' : (post.author?.name?.[0] || 'A').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-2xl tracking-tighter leading-none">
                            {post.isAnonymous ? post.authorAlias : post.author?.name || 'Anonymous Member'}
                          </p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">
                             Event Log: {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-none">{post.title}</h3>
                    <p className="text-slate-600 mb-10 text-lg leading-relaxed whitespace-pre-wrap font-medium max-w-4xl">{post.content}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-8 border-t border-slate-50">
                      <button
                        type="button"
                        onClick={() => handleLike(post._id)}
                        className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl transition-all border border-slate-100 hover:border-rose-100 hover:text-rose-500 shadow-sm"
                      >
                        <span className="text-xl">❤️</span> <span className="font-black text-[10px] uppercase tracking-widest">{post.likes?.length || 0}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (selectedPost?.post._id === post._id) {
                            setSelectedPost(null);
                            setReplyingTo(null);
                            setMentionCandidates([]);
                          } else {
                            fetchPostDetails(post._id);
                          }
                        }}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border shadow-sm ${
                           selectedPost?.post._id === post._id 
                           ? 'bg-indigo-600 border-indigo-600 text-white' 
                           : 'bg-white border-slate-100 hover:border-indigo-100 hover:text-indigo-600'
                        }`}
                      >
                        <span className="text-xl">💬</span>{' '}
                        <span className="font-black text-[10px] uppercase tracking-widest">
                           {selectedPost?.post._id === post._id ? 'Close' : 'Insights'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReport(post._id)}
                        className="flex items-center gap-3 bg-slate-50/50 px-6 py-3 rounded-2xl ml-auto transition-all text-slate-300 hover:text-rose-400 border border-transparent hover:border-rose-100"
                      >
                        <span className="text-lg">🚩</span> <span className="font-black text-[10px] uppercase tracking-widest">Flag</span>
                      </button>
                    </div>

                    {selectedPost?.post._id === post._id && (
                      <div className="mt-12 pt-12 border-t-2 border-slate-50 space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
                        <form onSubmit={handleAddComment} className="flex flex-col gap-6 relative max-w-4xl">
                          {replyingTo && (
                            <div className="flex items-center justify-between bg-indigo-50/50 rounded-2xl px-6 py-3 border border-indigo-100">
                              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                Synchronizing reply to <strong>{replyingTo.authorName}</strong>
                              </span>
                              <button
                                type="button"
                                className="text-indigo-600 font-black text-[10px] uppercase underline"
                                onClick={() => setReplyingTo(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          <div className="flex flex-col gap-4">
                            <div className="relative">
                              <textarea
                                ref={textareaRef}
                                className="w-full px-8 py-6 bg-slate-50/50 border-none rounded-[2rem] focus:ring-8 ring-indigo-50 transition-all resize-none text-slate-700 font-medium outline-none"
                                placeholder="Record your supportive passage… Use @ to synchronize with other members."
                                rows={3}
                                value={newComment.content}
                                onChange={handleCommentChange}
                                onKeyDown={(e) => {
                                  if (mentionOpen && e.key === 'Escape') setMentionOpen(false);
                                }}
                                required
                              />
                              {mentionOpen && filteredCandidates.length > 0 && (
                                <ul className="absolute z-60 left-4 right-4 bottom-full mb-2 max-h-48 overflow-y-auto rounded-3xl border border-indigo-100 bg-white shadow-2xl p-2">
                                  {filteredCandidates.map((c) => (
                                    <li key={c.userId}>
                                      <button
                                        type="button"
                                        className="w-full text-left px-5 py-3 hover:bg-indigo-50 font-black uppercase tracking-widest text-[10px] text-slate-500 hover:text-indigo-600 rounded-2xl transition-all"
                                        onClick={() => insertMention(c)}
                                      >
                                        @{c.displayName}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                               <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 cursor-pointer select-none">
                                 <input
                                   type="checkbox"
                                   className="w-5 h-5 rounded-lg border-2 border-slate-100 checked:bg-indigo-600 transition-all"
                                   checked={newComment.isAnonymous}
                                   onChange={(e) => setNewComment({ ...newComment, isAnonymous: e.target.checked })}
                                 />
                                 Cloak Identity
                               </label>
                               
                               <button
                                 type="submit"
                                 className="btn-serene-primary !px-12 w-full sm:w-auto"
                               >
                                 Finalize Reply
                               </button>
                            </div>
                          </div>
                        </form>

                        <div className="space-y-4 pt-8">
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-200 mb-8 px-2">Thread Archive</p>
                          {(selectedPost.comments || []).map((comment) => (
                            <CommentThread
                              key={comment._id}
                              comment={comment}
                              depth={0}
                              currentUserId={currentUserId}
                              replyingTo={replyingTo}
                              setReplyingTo={setReplyingTo}
                              onDelete={handleDeleteComment}
                              idToName={idToName}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-500">
            <div className="glass-panel !rounded-[4rem] p-12 lg:p-20 max-w-3xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32" />
              
              <div className="flex justify-between items-start mb-12">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2">New Passage Request</p>
                   <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Record.</h2>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors">✕</button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-10">
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Subject Vector</label>
                   <input
                     type="text"
                     className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-8 ring-indigo-50 transition-all outline-none font-black text-2xl tracking-tighter text-slate-900 placeholder:text-slate-200"
                     placeholder="Summary of intention..."
                     value={newPost.title}
                     onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                     required
                   />
                </div>

                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Detailed Content</label>
                   <textarea
                     className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2.5rem] focus:ring-8 ring-indigo-50 transition-all outline-none font-medium text-lg leading-relaxed text-slate-700 placeholder:text-slate-200 resize-none"
                     rows={6}
                     placeholder="Expand on your mental state or community query..."
                     value={newPost.content}
                     onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                     required
                   />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 bg-slate-50/50 p-10 rounded-[3rem] border border-white">
                  <div>
                    <p className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Anonymity Shield</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/50">Mask real identity from public stream.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={newPost.isAnonymous}
                      onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                    />
                    <div className="w-16 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-indigo-100 hover:bg-indigo-500 hover:-translate-y-1 transition-all"
                  >
                    Publish to Spectrum →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <p className="text-center mt-32 text-[10px] font-black uppercase tracking-[0.4em] text-slate-200">
           Community Stream Integrity Protocol • MindSpace Platform
        </p>
      </div>
    </div>
  );
};

export default Community;
