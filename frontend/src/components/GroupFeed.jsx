import GroupPostCard from './GroupPostCard';

const GroupFeed = ({ posts, currentUserId, loading }) => {
  if (loading && posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Group Feed...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="glass-panel !rounded-[3rem] p-24 text-center border-none shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl opacity-30 -mr-24 -mt-24" />
        <div className="text-5xl block mb-8 italic font-serif text-slate-200">ø</div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">No Passages Yet</h3>
        <p className="text-slate-400 font-medium italic">Be the first to share something with this community.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <GroupPostCard 
          key={post._id} 
          post={post} 
          currentUserId={currentUserId} 
        />
      ))}
    </div>
  );
};

export default GroupFeed;
