import { useState, useEffect } from 'react';
import { adminAPI, postsAPI } from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [flaggedSessions, setFlaggedSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'posts') {
      loadFlaggedPosts();
    } else if (activeTab === 'sessions') {
      loadFlaggedSessions();
    }
  }, [activeTab]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.users ?? []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadFlaggedPosts = async () => {
    try {
      const response = await adminAPI.getFlaggedPosts();
      setFlaggedPosts(response.posts ?? []);
    } catch (error) {
      console.error('Failed to load flagged posts:', error);
    }
  };

  const loadFlaggedSessions = async () => {
    try {
      const response = await adminAPI.getFlaggedChatSessions();
      setFlaggedSessions(response.sessions ?? []);
    } catch (error) {
      console.error('Failed to load flagged sessions:', error);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Permanently erase this record from the stream?")) return;
    try {
      await postsAPI.delete(id);
      loadFlaggedPosts();
      if (activeTab === 'stats') loadDashboardStats();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleDismissPostFlag = async (id) => {
    if (!window.confirm("Clear flag and restore integrity?")) return;
    try {
      await adminAPI.dismissFlaggedPost(id);
      loadFlaggedPosts();
      if (activeTab === 'stats') loadDashboardStats();
    } catch (error) {
      console.error('Failed to dismiss post flag:', error);
    }
  };

  const handleResolveSession = async (id) => {
    if (!window.confirm("Has this intervention been verified and resolved?")) return;
    try {
      await adminAPI.resolveChatSession(id);
      loadFlaggedSessions();
      if (activeTab === 'stats') loadDashboardStats();
    } catch (error) {
      console.error('Failed to resolve session:', error);
    }
  };

  const tabs = [
    { id: 'stats', label: 'Network Pulse', icon: '📊' },
    { id: 'users', label: 'Identity Directory', icon: '👥' },
    { id: 'posts', label: 'Flagged Content', icon: '🚩' },
    { id: 'sessions', label: 'Crisis Intervals', icon: '⚠️' }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Command Core</p>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-1">
              Admin <br />
              <span className="italic font-normal">Governance.</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-lg max-w-sm leading-relaxed">
             Orchestrate platform safety, user synchronization, and operational clinical integrity.
          </p>
        </div>

        {/* High-End Tab Switcher */}
        <div className="flex flex-wrap gap-2 p-2 bg-slate-100/50 backdrop-blur-md rounded-[2rem] w-fit mb-12 border border-slate-100/40">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-xl'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          {loading && activeTab === 'stats' ? (
            <div className="text-center py-40">
               <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
               <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing System Metrics...</p>
            </div>
          ) : (
            <>
              {/* Dashboard Stats */}
              {activeTab === 'stats' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Users Card */}
                  <div className="glass-card flex flex-col items-center justify-center text-center p-10 ring-offset-4 hover:ring-8 ring-indigo-50/50">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">Network Load</p>
                    <p className="text-6xl font-black text-slate-900 leading-none mb-6">{stats.users.total}</p>
                    <div className="w-full h-px bg-slate-50 mb-6" />
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>STU: {stats.users.students}</span>
                      <span>•</span>
                      <span>CLI: {stats.users.counselors}</span>
                    </div>
                  </div>

                  {/* Resources Card */}
                  <div className="glass-card flex flex-col items-center justify-center text-center p-10 ring-offset-4 hover:ring-8 ring-indigo-50/50">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">Knowledge Base</p>
                    <p className="text-6xl font-black text-slate-900 leading-none mb-6">{stats.resources.total}</p>
                    <div className="w-full h-px bg-slate-50 mb-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Resource Nodes Active</span>
                  </div>

                  {/* Community Card */}
                  <div className="glass-card flex flex-col items-center justify-center text-center p-10 ring-offset-4 hover:ring-8 ring-indigo-50/50">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">Spectrum Stream</p>
                    <p className="text-6xl font-black text-slate-900 leading-none mb-6">{stats.community.totalPosts}</p>
                    <div className="w-full h-px bg-slate-50 mb-6" />
                    {stats.community.flaggedPosts > 0 ? (
                      <span className="text-rose-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                         {stats.community.flaggedPosts} Hazards Detected
                      </span>
                    ) : (
                      <span className="text-slate-200 text-[10px] font-black uppercase tracking-widest italic">All Streams Nominal</span>
                    )}
                  </div>

                  {/* Bookings Card */}
                  <div className="glass-card flex flex-col items-center justify-center text-center p-10 ring-offset-4 hover:ring-8 ring-indigo-50/50">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">Interventions</p>
                    <p className="text-6xl font-black text-slate-900 leading-none mb-6">{stats.bookings.total}</p>
                    <div className="w-full h-px bg-slate-50 mb-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{stats.bookings.pending} Awaiting Sync</span>
                  </div>
                </div>
              )}

              {/* Users Directory */}
              {activeTab === 'users' && (
                <div className="glass-panel !p-0 !rounded-[3rem] overflow-hidden shadow-2xl border-none">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-50">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Identity</th>
                          <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Role</th>
                          <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal Status</th>
                          <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Orchestration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {users.length === 0 ? (
                          <tr><td colSpan={4} className="px-10 py-20 text-center text-slate-300 font-black italic">No identity nodes found in registry.</td></tr>
                        ) : users.map((user) => (
                          <tr key={user._id} className="hover:bg-indigo-50/20 transition-colors group">
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 font-black shadow-sm group-hover:scale-110 transition-transform">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">{user.name}</div>
                                  <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-6">
                              <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                                user.role === 'counselor' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                user.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                'bg-indigo-50 text-indigo-600 border-indigo-100'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-10 py-6">
                              <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-emerald-500' : 'text-rose-400 animate-pulse'}`}>
                                <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                {user.isActive ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="px-10 py-6 text-right">
                              <button
                                onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  user.isActive 
                                    ? 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600' 
                                    : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                                }`}
                              >
                                {user.isActive ? 'Suspend' : 'De-Suspend'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Flagged Posts */}
              {activeTab === 'posts' && (
                <div className="grid grid-cols-1 gap-8">
                  {flaggedPosts.length === 0 ? (
                    <div className="glass-panel !rounded-[4rem] p-32 text-center border-none shadow-sm italic text-slate-200 text-4xl font-serif">
                       ✨ Community Integrity Verified
                    </div>
                  ) : (
                    flaggedPosts.map((post) => (
                      <div key={post._id} className="glass-card !p-12 hover:ring-8 ring-rose-50/50 transition-all duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-rose-50" />
                        
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <div className="flex items-center gap-4 mb-4">
                              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{post.title}</h3>
                              <span className="bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-rose-100 shadow-sm">
                                Violation Flagged
                              </span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                              By: {post.author?.name || 'Anonymous Identifier'} • Log: {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-50/50 mb-8 whitespace-pre-wrap text-slate-600 font-medium leading-relaxed italic">
                          "{post.content}"
                        </div>

                        <div className="flex flex-col xl:flex-row justify-between items-center gap-8 pt-8 border-t border-slate-50">
                          <div className="flex items-center gap-3 text-rose-600 text-[10px] font-black uppercase tracking-widest bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100 shadow-sm flex-1">
                            🚨 Signal: {post.flagReason || 'Violation of Behavioral Protocol'}
                          </div>
                          <div className="flex gap-4 w-full xl:w-auto">
                            <button onClick={() => handleDismissPostFlag(post._id)} className="btn-serene-secondary !text-slate-400 border-slate-100 flex-1 xl:flex-none">Dismiss Interval</button>
                            <button onClick={() => handleDeletePost(post._id)} className="btn-serene-primary !bg-rose-600 !hover:bg-rose-500 shadow-rose-100 flex-1 xl:flex-none">Purge Permanently</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Flagged AI Sessions */}
              {activeTab === 'sessions' && (
                <div className="grid grid-cols-1 gap-8">
                  {flaggedSessions.length === 0 ? (
                    <div className="glass-panel !rounded-[4rem] p-32 text-center border-none shadow-sm italic text-slate-200 text-4xl font-serif">
                       ✅ No Crisis Intervals Detected
                    </div>
                  ) : (
                    flaggedSessions.map((session) => (
                      <div key={session._id} className="glass-card !p-12 hover:ring-8 ring-amber-50/50 transition-all duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-amber-50" />
                        
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-10">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Risk Intersection Detected</h3>
                              <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-200 animate-pulse">
                                High Clinical Intensity
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest text-slate-300 mb-8">
                               <p>Subject: <span className="text-slate-900">{session.userId?.name || 'N/A'}</span></p>
                               <p>Contact: <span className="text-slate-900">{session.userId?.email || 'N/A'}</span></p>
                               <p>Observation Start: <span className="text-slate-900">{new Date(session.createdAt).toLocaleString()}</span></p>
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                              <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 shadow-sm">
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block mb-1">Trigger Signal</span>
                                <span className="text-lg font-black text-slate-900 leading-none">{session.flagReason || 'Severe keywords detected'}</span>
                              </div>
                              <div className="bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100 shadow-sm">
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 block mb-1">Index Score</span>
                                <span className="text-lg font-black text-slate-900 leading-none">{session.riskScore}/10 Intensity</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleResolveSession(session._id)}
                            className="btn-serene-primary !py-8 !px-12 !bg-emerald-600 !hover:bg-emerald-500 shadow-emerald-100 lg:h-fit text-lg"
                          >
                            Mark Intervened
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        <p className="text-center mt-32 text-[10px] font-black uppercase tracking-[0.4em] text-slate-200">
           MindSpace Central Governance Protocol • Protected Command Unit
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
