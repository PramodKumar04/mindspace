import { useState, useEffect } from 'react';
import { groupsAPI } from '../services/api';
import GroupCard from '../components/GroupCard';

const GroupsExplore = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: 'General' });
  const [creating, setCreating] = useState(false);

  const categories = ['General', 'Anxiety', 'Depression', 'Academic Stress', 'Relationships', 'Personal Growth'];

  useEffect(() => {
    fetchGroups();
  }, [category]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await groupsAPI.getAll({ search, category });
      setGroups(res.groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGroups();
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await groupsAPI.create(newGroup);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', category: 'General' });
      fetchGroups();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Our Community</p>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-1">
              Community <br />
              <span className="italic font-normal text-indigo-600">Groups.</span>
            </h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-serene-primary !px-10 !py-5 shadow-2xl shadow-indigo-100 flex items-center gap-4 text-lg"
          >
            <span>✨</span> Create Group
          </button>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          <form onSubmit={handleSearch} className="lg:col-span-2 relative group">
            <input
              type="text"
              placeholder="Search groups by name..."
              className="w-full px-8 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-8 ring-indigo-50 transition-all outline-none font-medium shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-indigo-600">
              🔍
            </button>
          </form>

          <select
            className="px-8 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-8 ring-indigo-50 transition-all outline-none font-bold text-slate-700 shadow-sm appearance-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="text-center py-40">
            <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading groups...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {groups.length === 0 ? (
              <div className="col-span-full glass-panel !rounded-[4rem] p-32 text-center border-none shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32" />
                <div className="text-6xl block mb-10 italic font-serif text-slate-200">ø</div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4">No Groups Found</h3>
                <p className="text-slate-400 font-medium text-lg italic">Try adjusting your search or category filters.</p>
              </div>
            ) : (
              groups.map(group => <GroupCard key={group._id} group={group} />)
            )}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-500">
            <div className="glass-panel !rounded-[2rem] p-8 lg:p-10 max-w-xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2">Start a new group</p>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Create.</h2>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors">✕</button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Group Name</label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 ring-indigo-50 transition-all outline-none font-bold text-lg tracking-tight text-slate-900 placeholder:text-slate-200"
                    placeholder="Enter group name..."
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Category</label>
                    <select
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 ring-indigo-50 transition-all outline-none font-bold text-slate-700"
                      value={newGroup.category}
                      onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Description</label>
                  <textarea
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 ring-indigo-50 transition-all outline-none font-medium text-base leading-relaxed text-slate-700 placeholder:text-slate-200 resize-none"
                    rows={3}
                    placeholder="Describe the purpose of this group..."
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-indigo-100 hover:bg-indigo-500 hover:-translate-y-1 transition-all"
                >
                  {creating ? 'Creating...' : 'Create Group →'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GroupsExplore;
