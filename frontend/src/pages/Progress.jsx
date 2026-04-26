import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { assessmentAPI } from '../services/api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl p-4 shadow-2xl text-sm">
        <p className="font-black text-slate-900 mb-2 border-b border-slate-50 pb-2 uppercase tracking-widest text-[10px]">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{p.name}</span>
            <span style={{ color: p.color }} className="font-black text-lg leading-none">
              {p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Progress() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    assessmentAPI.getMyResults()
      .then(data => setResults(Array.isArray(data) ? data.reverse() : []))
      .catch(() => setError('The progress data nodes could not be synchronized.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Purge this record from the system timeline?')) return;
    try {
      await assessmentAPI.deleteResult(id);
      setResults(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete result.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Aggregating Personal History...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6 text-center">
        <div className="glass-panel !rounded-[3rem] p-12 max-w-md w-full shadow-2xl">
           <div className="text-4xl mb-6">⚠️</div>
           <h3 className="text-2xl font-black text-slate-900 mb-2">Sync Error</h3>
           <p className="text-slate-400 font-medium mb-10">{error}</p>
           <button className="btn-serene-primary w-full" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
           </button>
        </div>
      </div>
    );
  }

  const flowResults = results.filter(r => r.questionnaireType === 'wellbeing-flow');
  const chartData = flowResults.map(r => ({
    date: formatDate(r.createdAt),
    'Mood Intensity': r.phq9Score ?? r.totalScore,
    'Stress Response': r.gad7Score ?? 0,
    'Environmental Strain': r.pssScore ?? 0,
  }));

  return (
    <div className="min-h-screen bg-[#fcfdfe] py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4 font-sans">Trajectory Analysis</p>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-1">
              Personal <br />
              <span className="italic font-normal">Evolution.</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-lg max-w-sm leading-relaxed">
             Visualize your mental landscape through high-fidelity data nodes and chronological mapping.
          </p>
        </div>

        {flowResults.length === 0 ? (
          <div className="glass-panel !rounded-[4rem] p-32 text-center border-none shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 opacity-40" />
             <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-10 text-5xl italic font-serif text-slate-200">
                🌱
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">A story waiting to be told.</h2>
             <p className="text-slate-400 font-medium mb-12 max-w-xs mx-auto leading-relaxed">
                Start your first emotional pulse check to begin generating your clinical trajectory.
             </p>
             <Link to="/check-in" className="btn-serene-primary inline-block">
                Initiate Baseline Check-In
             </Link>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Check-In Units', value: flowResults.length, color: 'text-indigo-600' },
                { label: 'Latest Mood', value: flowResults[flowResults.length - 1]?.phq9Score ?? '—', color: 'text-rose-500' },
                { label: 'Latest Stress', value: flowResults[flowResults.length - 1]?.gad7Score ?? '—', color: 'text-amber-500' },
                { label: 'Vitality Index', value: flowResults[flowResults.length - 1]?.pssScore ?? '—', color: 'text-emerald-500' },
              ].map(stat => (
                <div key={stat.label} className="glass-card flex flex-col items-center justify-center text-center p-8 bg-white shadow-sm ring-offset-2 hover:ring-8 ring-indigo-50/50">
                  <p className={`text-4xl font-black leading-none mb-2 ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Main Spectrum Visualization */}
            <div className="glass-panel !rounded-[3rem] p-10 lg:p-16 shadow-2xl border-none">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Mood Spectrum</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Cross-Reference: PHQ-9 & GAD-7 Intensity</p>
                 </div>
                 <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-indigo-600" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mood</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-rose-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anxiety</span>
                    </div>
                 </div>
              </div>
              
              <div className="h-[400px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradAnxiety" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="date" 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 900 }} 
                       dy={20}
                    />
                    <YAxis 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 900 }} 
                       dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                       type="monotone" 
                       dataKey="Mood Intensity" 
                       stroke="#4f46e5" 
                       strokeWidth={4} 
                       fill="url(#gradMood)" 
                       dot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }} 
                       activeDot={{ r: 8, strokeWidth: 0 }} 
                    />
                    <Area 
                       type="monotone" 
                       dataKey="Stress Response" 
                       stroke="#fb7185" 
                       strokeWidth={4} 
                       fill="url(#gradAnxiety)" 
                       dot={{ r: 6, fill: '#fb7185', strokeWidth: 0 }} 
                       activeDot={{ r: 8, strokeWidth: 0 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Environmental Strain Chart */}
            <div className="glass-panel !rounded-[3rem] p-10 lg:p-16 shadow-2xl border-none">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Stress Vitality</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Stress Levels Correlation (PSS)</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-xl shadow-amber-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Environmental Score</span>
                 </div>
              </div>

              <div className="h-[250px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="date" 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 900 }} 
                       dy={20}
                    />
                    <YAxis 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 900 }} 
                       dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                       type="monotone" 
                       dataKey="Environmental Strain" 
                       stroke="#fbbf24" 
                       strokeWidth={4} 
                       fill="url(#gradStress)" 
                       dot={{ r: 6, fill: '#fbbf24', strokeWidth: 0 }} 
                       activeDot={{ r: 8, strokeWidth: 0 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* History Ledger */}
        {results.length > 0 && (
          <div className="mt-24 space-y-6">
            <div className="flex items-center gap-4 mb-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Chronological Archive</h3>
               <div className="flex-1 h-px bg-slate-100" />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               {[...results].reverse().map(r => (
                 <div key={r._id} className="glass-card hover:bg-white !p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ring-offset-0 hover:ring-8 ring-indigo-50/30">
                   <div className="flex items-center gap-6 text-center md:text-left">
                     <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-white shadow-inner flex items-center justify-center text-2xl">
                       {r.questionnaireType === 'wellbeing-flow' ? '🩺' : '📑'}
                     </div>
                     <div>
                       <h4 className="font-black text-slate-900 tracking-tight leading-none mb-1">
                         {r.questionnaireType === 'wellbeing-flow' ? 'Wellbeing Pulse' : r.questionnaireType.toUpperCase()}
                       </h4>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Record finalized on {formatDate(r.createdAt)}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-12">
                      <div className="text-center">
                         <p className="text-2xl font-black text-slate-900 leading-none mb-1">{r.totalScore}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Index</p>
                      </div>
                      {r.severityTag && (
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                          r.severityTag.includes('Severe') ? 'bg-rose-500 text-white border-rose-600' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {r.severityTag}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-rose-500 hover:bg-rose-50 hover:border-rose-100 hover:scale-110 transition-all flex items-center justify-center text-xs shadow-sm"
                      >
                        ✕
                      </button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col items-center">
           <Link to="/check-in" className="btn-serene-primary !px-12 !py-5 bg-slate-900 hover:bg-black shadow-2xl shadow-indigo-200">
             Register New Event Node
           </Link>
           <p className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-200">
              MindSpace • Path Tracking Protocol v4.0
           </p>
        </div>
      </div>
    </div>
  );
}
