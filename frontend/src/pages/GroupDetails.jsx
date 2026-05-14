import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { groupsAPI } from '../services/api';
import GroupFeed from '../components/GroupFeed';
import GroupPostComposer from '../components/GroupPostComposer';

const GroupDetails = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const userRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
  const me = userRaw ? JSON.parse(userRaw) : null;
  const currentUserId = me?._id || me?.id || null;

  useEffect(() => {
    fetchGroupDetails();
    fetchGroupPosts();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const res = await groupsAPI.getById(id);
      setGroup(res.group);
      setIsMember(res.group.members.includes(currentUserId));
    } catch (error) {
      console.error('Failed to fetch group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await groupsAPI.getPosts(id);
      setPosts(res.posts || []);
    } catch (error) {
      console.error('Failed to fetch group posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    try {
      if (isMember) {
        await groupsAPI.leave(group._id);
        setIsMember(false);
        setGroup(prev => ({ ...prev, memberCount: prev.memberCount - 1 }));
      } else {
        await groupsAPI.join(group._id);
        setIsMember(true);
        setGroup(prev => ({ ...prev, memberCount: prev.memberCount + 1 }));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handlePostSubmit = async (data) => {
    setSubmitting(true);
    try {
      await groupsAPI.createPost(group._id, data);
      fetchGroupPosts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe]">
        <div className="text-center glass-panel p-20 !rounded-[3rem]">
          <h1 className="text-4xl font-black text-slate-900 mb-6">Group Not Found</h1>
          <Link to="/groups" className="btn-serene-primary">Back to Groups</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-32">
      {/* Banner & Hero */}
      <div className="h-[40vh] relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 to-slate-900/80 z-10" />
        {group.banner ? (
          <img src={group.banner} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-indigo-950 opacity-50" />
        )}
        
        <div className="absolute bottom-0 left-0 w-full p-8 lg:p-16 z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-10">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-white p-2 shadow-2xl shrink-0 -mb-12 md:-mb-24 relative z-30">
              <div className="w-full h-full rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-6xl shadow-inner border border-slate-100">
                {group.avatar ? <img src={group.avatar} className="w-full h-full object-cover rounded-[2.5rem]" /> : group.name[0].toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1 text-white pb-4">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-indigo-500/30 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-400/30">
                  {group.category}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  {group.privacy}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">{group.name}</h1>
              <p className="text-lg opacity-80 max-w-2xl font-medium leading-relaxed">{group.description}</p>
            </div>

            <div className="pb-4 shrink-0">
              <button 
                onClick={handleJoinLeave}
                className={`!px-12 !py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-2xl ${
                  isMember 
                  ? 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-rose-500 hover:border-rose-400' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                }`}
              >
                {isMember ? 'Leave Group' : 'Join Group'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 pt-24 md:pt-40 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Sidebar Info */}
        <div className="space-y-12">
          <div className="glass-card !p-10 !rounded-[2.5rem] border-none shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-8">Group Info</h3>
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Members</span>
                <span className="text-sm font-black text-slate-900">{group.memberCount} Members</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Created</span>
                <span className="text-sm font-black text-slate-900">{new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Created by</span>
                <span className="text-sm font-black text-slate-900">{group.creatorId?.name || 'Anonymous'}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-10 rounded-[2.5rem] border border-indigo-100/50">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Group Rules</h3>
            <ul className="space-y-4 text-sm font-medium text-slate-600 list-disc pl-4">
              <li>Maintain kindness and empathy.</li>
              <li>Respect anonymity.</li>
              <li>Zero tolerance for toxicity.</li>
            </ul>
          </div>
        </div>

        {/* Feed Section */}
        <div className="lg:col-span-2">
          {isMember && (
            <GroupPostComposer onSubmit={handlePostSubmit} isSubmitting={submitting} />
          )}
          
          <div className="mb-10 flex items-center justify-between">
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Latest Posts</h2>
             <div className="h-px bg-slate-100 flex-1 mx-8 hidden sm:block" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Recent Activity</span>
          </div>

          <GroupFeed posts={posts} currentUserId={currentUserId} loading={postsLoading} />
        </div>

      </div>
    </div>
  );
};

export default GroupDetails;
