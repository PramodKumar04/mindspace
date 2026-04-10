import { useState, useEffect } from 'react';
import { resourcesAPI } from '../services/api';

const TYPE_META = {
  article: { label: 'Article', icon: '📄', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' },
  video: { label: 'Video', icon: '▶', color: 'text-indigo-700 bg-indigo-100 border-indigo-300' },
  audio: { label: 'Audio', icon: '🎧', color: 'text-amber-700 bg-amber-100 border-amber-300' },
  exercise: { label: 'Exercise', icon: '✦', color: 'text-rose-700 bg-rose-100 border-rose-300' },
};

export default function ManageResources({ onUpdate }) {
  const [resources, setResources] = useState([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'article',
    category: '',
    url: '',
    thumbnail: ''
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getAll({});
      // BUG FIX: The backend returns { data: resources }, interceptor returns response.data
      // So it's response.data, not response.resources
      setResources(response.data ?? []);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await resourcesAPI.create(newResource);
      setShowResourceForm(false);
      setNewResource({ title: '', description: '', type: 'article', category: '', url: '', thumbnail: '' });
      loadResources();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to create resource:', error);
      alert(error.response?.data?.message || 'Failed to create resource');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Remove this resource? It will be hidden from students.')) return;
    try {
      await resourcesAPI.delete(id);
      loadResources();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert(error.response?.data?.message || 'Failed to delete resource');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-md gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Resource Library</h2>
          <p className="text-gray-500 text-sm mt-1">Manage all reading & viewing materials available to students.</p>
        </div>
        <button
          onClick={() => setShowResourceForm(!showResourceForm)}
          className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md whitespace-nowrap"
        >
          {showResourceForm ? 'Cancel Upload' : 'Upload New Resource +'}
        </button>
      </div>

      {/* Upload Form */}
      {showResourceForm && (
        <form onSubmit={handleCreateResource} className="bg-white/80 backdrop-blur-xl border border-indigo-100 rounded-3xl shadow-xl p-8 space-y-6 slide-in-top">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="text-xl font-bold text-gray-800">Add a new resource</h3>
            <p className="text-sm text-gray-500 mt-1">This will instantly appear in the Smart Resource Hub for all authenticated students.</p>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Resource Title *</label>
            <input
              type="text"
              required
              placeholder="E.g., 5-Minute Meditation for Anxiety"
              className="w-full px-4 py-3 border-2 border-transparent bg-gray-50 focus:bg-white focus:border-indigo-400 rounded-xl transition-all outline-none"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Short Description</label>
            <textarea
              className="w-full px-4 py-3 border-2 border-transparent bg-gray-50 focus:bg-white focus:border-indigo-400 rounded-xl transition-all outline-none"
              rows={3}
              placeholder="Give students an idea of what this resource covers..."
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Media Type *</label>
              <select
                required
                className="w-full px-4 py-3 border-2 border-transparent bg-gray-50 focus:bg-white focus:border-indigo-400 rounded-xl transition-all outline-none"
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
              >
                <option value="article">Article 📄</option>
                <option value="video">Video ▶️</option>
                <option value="audio">Audio 🎧</option>
                <option value="exercise">Exercise ✦</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Category *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-transparent bg-gray-50 focus:bg-white focus:border-indigo-400 rounded-xl transition-all outline-none"
                placeholder="E.g., Anxiety, Sleep, Depression"
                value={newResource.category}
                onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Destination URL *</label>
              <input
                type="url"
                required
                className="w-full px-4 py-3 border-2 border-transparent bg-gray-50 focus:bg-white focus:border-indigo-400 rounded-xl transition-all outline-none text-indigo-600"
                placeholder="https://..."
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Thumbnail URL (Optional)</label>
              <input
                type="url"
                className="w-full px-4 py-3 border-2 border-transparent bg-gray-50 focus:bg-white focus:border-indigo-400 rounded-xl transition-all outline-none"
                placeholder="https://images.unsplash.com/..."
                value={newResource.thumbnail}
                onChange={(e) => setNewResource({ ...newResource, thumbnail: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-md">
              Publish Resource 🚀
            </button>
          </div>
        </form>
      )}

      {/* Grid view of resources */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-white/40 rounded-3xl animate-pulse border border-white/50"></div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center shadow-sm">
           <span className="text-4xl mb-4 block">📚</span>
           <h3 className="text-xl font-bold text-gray-800 mb-2">No resources uploaded yet</h3>
           <p className="text-gray-500 mb-6 font-medium">Resources you upload will be accessible to all students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => {
            const meta = TYPE_META[r.type] || TYPE_META.article;
            return (
              <div key={r._id} className="group bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl">
                <div className="h-32 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {r.thumbnail ? (
                    <>
                      <img src={r.thumbnail} alt="" className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200">
                      <span className="text-4xl opacity-50">{meta.icon}</span>
                    </div>
                  )}
                  {/* Category Pill */}
                  <span className="absolute top-3 right-3 inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 text-gray-800 shadow-sm backdrop-blur-sm">
                    {r.category}
                  </span>
                </div>
                
                <div className="p-5 flex flex-col flex-1 relative z-10 bg-white/40">
                  <div className="mb-2">
                    <span className={`inline-block text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{r.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">{r.description || 'No description provided.'}</p>
                  
                  <div className="flex gap-2">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm transition-all hover:bg-indigo-100 border border-indigo-100"
                    >
                      View Link
                    </a>
                    <button
                      onClick={() => handleDeleteResource(r._id)}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-sm transition-all hover:bg-rose-100 border border-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
