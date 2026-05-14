import { useState } from 'react';
import { groupsAPI } from '../services/api';

const GroupPostCard = ({ post, currentUserId }) => {
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUserId));
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await groupsAPI.toggleLike(post._id);
      setLikes(res.likeCount);
      setIsLiked(res.isLiked);
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="glass-card !p-10 hover:shadow-xl transition-all duration-500 overflow-hidden relative border-none">
      <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-50" />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-white shadow-inner flex items-center justify-center text-indigo-700 font-black shadow-md text-xl">
            {post.isAnonymous ? '👤' : (post.authorId?.name?.[0] || 'A').toUpperCase()}
          </div>
          <div>
            <p className="font-black text-slate-900 text-lg tracking-tighter leading-none">
              {post.isAnonymous ? post.authorAlias : post.authorId?.name || 'Unknown Member'}
            </p>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1.5">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <p className="text-slate-600 mb-8 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
        {post.content}
      </p>

      <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
        <button
          type="button"
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all border shadow-sm ${
            isLiked 
            ? 'bg-rose-50 border-rose-100 text-rose-500' 
            : 'bg-white border-slate-100 hover:border-rose-100 hover:text-rose-500'
          }`}
        >
          <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span> 
          <span className="font-black text-[10px] uppercase tracking-widest">{likes}</span>
        </button>

        {post.isAnonymous && (
          <span className="ml-auto text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
            Identity Masked
          </span>
        )}
      </div>
    </div>
  );
};

export default GroupPostCard;
