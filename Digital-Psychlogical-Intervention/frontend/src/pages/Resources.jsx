import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { BreathingExercise, GroundingExercise } from '../components/ExerciseWidgets';
import { CRISIS_LINES } from '../constants/crisisLines';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Anxiety', 'Depression', 'Sleep', 'Stress', 'Mindfulness', 'Self-care', 'Crisis'];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'article', label: 'Articles' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'exercise', label: 'Exercises' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'az', label: 'A – Z' },
  { value: 'za', label: 'Z – A' },
];

const TYPE_META = {
  article: { label: 'Article', icon: '📄', color: 'text-emerald-700 bg-emerald-50 border-emerald-100', action: 'Read' },
  video: { label: 'Video', icon: '▶', color: 'text-indigo-700 bg-indigo-50 border-indigo-100', action: 'Watch' },
  audio: { label: 'Audio', icon: '🎧', color: 'text-amber-700 bg-amber-50 border-amber-100', action: 'Listen' },
  exercise: { label: 'Exercise', icon: '✦', color: 'text-rose-700 bg-rose-50 border-rose-100', action: 'Open' },
};

// ─── Resource card ─────────────────────────────────────────────────────────────
function ResourceCard({ resource }) {
  const meta = TYPE_META[resource.type] || TYPE_META.article;
  const isRecommended = resource._score >= 2;

  return (
    <div className="group glass-card !p-0 !rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-700 hover:shadow-2xl hover:ring-8 hover:ring-indigo-50/50">
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-6 right-6 z-10 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xl shadow-indigo-200">
          Recommended
        </div>
      )}

      <div className="h-48 bg-slate-50 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
        {resource.thumbnail ? (
          <>
            <img src={resource.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-40"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-500 opacity-20">{meta.icon}</span>
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col flex-1 relative z-10">
        <div className="flex gap-2 mb-6">
          <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 ${meta.color}`}>
            {meta.label}
          </span>
          <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 border-2 border-slate-50 italic">
            {resource.category}
          </span>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">{resource.title}</h3>
        <p className="text-sm text-slate-500 mb-8 flex-1 line-clamp-3 leading-relaxed font-medium">{resource.description}</p>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-serene-secondary w-full !py-3 flex items-center justify-center gap-2 group/btn !bg-slate-50 !border-transparent hover:!bg-indigo-600 hover:!text-white"
        >
          <span className="font-black uppercase tracking-[0.2em] text-[10px]">{meta.action} Now</span>
          <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
        </a>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState(null);
  const [tipLoading, setTipLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sort, setSort] = useState('recommended');

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ ranked: 'true' });
      if (activeCategory !== 'All') params.append('category', activeCategory);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const res = await api.get(`/resources?${params}`);
      const raw = res.data ?? [];
      setResources(Array.isArray(raw) ? raw : []);
    } catch {
      setError('Coordination Failed. Please re-synchronize the hub.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, typeFilter]);

  const fetchTip = useCallback(async () => {
    try {
      setTipLoading(true);
      const res = await api.get('/resources/tip');
      setTip(res.tip ?? null);
    } catch {
      setTip(null);
    } finally {
      setTipLoading(false);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);
  useEffect(() => { fetchTip(); }, [fetchTip]);

  const displayed = resources
    .filter(r => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === 'recommended') return (b._score || 0) - (a._score || 0);
      if (sort === 'az') return a.title.localeCompare(b.title);
      if (sort === 'za') return b.title.localeCompare(a.title);
      return 0;
    });

  const crisisResources = displayed.filter(r => r.category === 'Crisis');
  const mainResources = displayed.filter(r => r.category !== 'Crisis');
  const showBreathing = ['All', 'Anxiety', 'Stress', 'Mindfulness'].includes(activeCategory);

  return (
    <div className="min-h-screen bg-[#fcfdfe] py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Scientific Support Hub</p>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
              Content <br />
              <span className="italic font-normal">Library.</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-white/50 border border-slate-100 px-6 py-4 rounded-[1.5rem] shadow-sm">
             <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                {resources.length}
             </div>
             <p className="font-black uppercase tracking-widest text-[10px] text-slate-400 leading-none">Units Available</p>
          </div>
        </div>

        {/* AI Tip Banner */}
        {(tip || tipLoading) && (
          <div className="mb-12 p-8 lg:p-12 glass-panel !rounded-[4rem] !border-none bg-white relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 opacity-20 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-100 opacity-20 rounded-full blur-3xl -ml-32 -mb-32" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-3xl shadow-2xl shadow-indigo-100 shrink-0 transform group-hover:rotate-12 transition-transform duration-500">
                <span className="text-white">✨</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center justify-center md:justify-start gap-3">
                  Clinical Insight
                  {tipLoading && <div className="flex gap-1 animate-pulse"><div className="w-1 h-1 bg-indigo-400 rounded-full" /><div className="w-1 h-1 bg-indigo-400 rounded-full" /><div className="w-1 h-1 bg-indigo-400 rounded-full" /></div>}
                </h3>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight max-w-4xl italic">
                  {tipLoading ? 'Deciphering emotional data patterns...' : tip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-6 rounded-[2rem] mb-12 font-black text-sm text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        {/* Global Filter Station */}
        <div className="glass-panel !rounded-[3rem] p-8 lg:p-12 mb-16 shadow-xl border-none">
          <div className="flex flex-col xl:flex-row gap-8 mb-10">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                 🔍
              </div>
              <input
                type="text"
                placeholder="Search resources, knowledge, interventions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] text-slate-900 font-black tracking-tight placeholder-slate-300 focus:ring-8 ring-indigo-50 transition-all outline-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="py-5 px-8 bg-white border-2 border-slate-50 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] text-slate-500 focus:border-indigo-200 outline-none shadow-sm transition-all"
              >
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="py-5 px-8 bg-white border-2 border-slate-50 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] text-slate-500 focus:border-indigo-200 outline-none shadow-sm transition-all"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-sm border-2 ${activeCategory === cat
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 -translate-y-1'
                    : 'bg-white border-slate-50 text-slate-400 hover:border-indigo-100 hover:text-indigo-600'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Section */}
        {showBreathing && (
          <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <BreathingExercise collapsible defaultExpanded={false} />
            <GroundingExercise collapsible defaultExpanded={false} />
          </div>
        )}

        {/* Market Grid */}
        <div className="space-y-16">
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[450px] bg-slate-50 rounded-[3rem] animate-pulse"></div>
                ))}
             </div>
          ) : mainResources.length === 0 ? (
            <div className="glass-panel !rounded-[4rem] p-32 text-center border-none shadow-sm">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-8 text-5xl italic font-serif text-slate-200">
                ø
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Library is quiet</h3>
              <p className="text-slate-400 mt-4 max-w-sm mx-auto font-medium leading-relaxed italic">
                 Your search criteria did not match any available <br /> clinical knowledge units.
              </p>
              <button
                onClick={() => { setActiveCategory('All'); setTypeFilter('all'); setSearch(''); }}
                className="btn-serene-secondary mt-12 !px-10 border-slate-100 text-slate-400"
              >
                Clear Search Parameters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {mainResources.map(r => <ResourceCard key={r._id} resource={r} />)}
            </div>
          )}

          {/* Crisis DB Resources */}
          {crisisResources.length > 0 && (
            <div className="pt-24 border-t border-slate-100">
              <div className="flex items-center gap-4 mb-12">
                 <h2 className="text-sm font-black uppercase tracking-[0.4em] text-rose-500">Critical Support Units</h2>
                 <div className="flex-1 h-px bg-rose-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {crisisResources.map(r => <ResourceCard key={r._id} resource={r} />)}
              </div>
            </div>
          )}

          {/* Immediate Helplines */}
          {(activeCategory === 'All' || activeCategory === 'Crisis') && (
            <div className="glass-panel !rounded-[4rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden bg-white border-none mt-32">
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-60" />
              <div>
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-none text-center lg:text-left">Immediate <br /><span className="text-rose-600">Lifelines.</span></h2>
                 <p className="text-slate-400 font-medium mb-16 text-center lg:text-left max-w-sm leading-relaxed uppercase tracking-[0.1em] text-[10px] font-black">Professional human interaction is available 24/7 through these verified network nodes.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {CRISIS_LINES.map(line => (
                  <a
                    key={line.name}
                    href={line.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/40 p-10 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:border-rose-100 transition-all group flex flex-col items-center text-center"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-6 group-hover:text-rose-400 transition-colors">{line.name}</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{line.number}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-32 text-[10px] font-black uppercase tracking-[0.4em] text-slate-200">
           Digital Clinical Archive • MindSpace Hub
        </p>
      </div>
    </div>
  );
}
