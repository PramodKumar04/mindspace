import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const MAX_SCORE = { phq9: 27, gad7: 21 };

function getMaxScore(type) {
  return MAX_SCORE[type] ?? 27;
}

function getSeverityStyle(score, type) {
  if (type === 'gad7') {
    if (score <= 4) return { label: 'Minimal anxiety', color: 'emerald' };
    if (score <= 9) return { label: 'Mild anxiety', color: 'blue' };
    if (score <= 14) return { label: 'Moderate anxiety', color: 'amber' };
    return { label: 'Severe anxiety', color: 'red' };
  }
  // Default: PHQ-9
  if (score <= 4) return { label: 'Minimal depression', color: 'emerald' };
  if (score <= 9) return { label: 'Mild depression', color: 'blue' };
  if (score <= 14) return { label: 'Moderate depression', color: 'amber' };
  if (score <= 19) return { label: 'Moderately severe depression', color: 'orange' };
  return { label: 'Severe depression', color: 'red' };
}

function getSeverityClasses(color) {
  const map = {
    emerald: 'text-emerald-700 bg-emerald-100 border-emerald-300 from-emerald-400 to-emerald-500',
    blue: 'text-blue-700 bg-blue-100 border-blue-300 from-blue-400 to-blue-500',
    amber: 'text-amber-800 bg-amber-100 border-amber-300 from-amber-400 to-amber-500',
    orange: 'text-orange-800 bg-orange-100 border-orange-300 from-orange-400 to-orange-500',
    red: 'text-red-800 bg-red-100 border-red-300 from-red-400 to-red-500',
  };
  return map[color] || map.blue;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function typeLabel(type) {
  if (type === 'gad7') return 'GAD-7 Anxiety';
  if (type === 'phq9') return 'PHQ-9 Depression';
  return type.toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultsHistory() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    assessmentAPI
      .getMyResults()
      .then((data) => setResults(data))
      .catch(() => setError('Could not load your results. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;
    try {
      await assessmentAPI.deleteResult(id);
      setResults(prev => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      alert(`Failed to delete result: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <p className="text-indigo-600 font-medium animate-pulse text-lg">Loading your results…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <p className="text-red-500 font-medium text-lg">{error}</p>
      </div>
    );
  }

  // Metrics
  const total = results.length;
  const avgScore = total > 0 ? Math.round(results.reduce((sum, r) => sum + r.totalScore, 0) / total) : 0;
  const bestScore = total > 0 ? Math.min(...results.map((r) => r.totalScore)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <span className="inline-block bg-white/60 backdrop-blur-md border border-indigo-200 text-indigo-700 rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
            Mental Health History
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-4">
            Assessment History
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed">
            All your completed mental health screenings over time.
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-10 w-full">
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 text-center shadow-lg hover:-translate-y-1 transition-transform">
            <span className="block text-4xl sm:text-5xl font-black text-indigo-600 mb-1">{total}</span>
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">Total Attempts</span>
          </div>
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 text-center shadow-lg hover:-translate-y-1 transition-transform">
            <span className="block text-4xl sm:text-5xl font-black text-purple-600 mb-1">{total > 0 ? avgScore : '—'}</span>
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">Average Score</span>
          </div>
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 text-center shadow-lg hover:-translate-y-1 transition-transform">
            <span className="block text-4xl sm:text-5xl font-black text-pink-600 mb-1">{total > 0 ? bestScore : '—'}</span>
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">Lowest Score</span>
          </div>
        </div>

        {/* Results list */}
        {total === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center shadow-lg">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-2xl font-bold text-gray-900 mb-2">No assessments yet</p>
            <p className="text-gray-500 mb-8 font-medium">Take your first screening to see your results here.</p>
            <button
              className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              onClick={() => navigate('/assessment')}
            >
              Take an assessment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const { label, color } = getSeverityStyle(result.totalScore, result.questionnaireType);
              const classes = getSeverityClasses(color);
              const max = getMaxScore(result.questionnaireType);
              const pct = Math.round((result.totalScore / max) * 100);

              // extract just the bg string manually for the badge
              const twClasses = classes.split(' ');
              const badgeClasses = twClasses.slice(0, 3).join(' '); // text-x bg-x border-x
              const gradientClasses = twClasses.slice(3).join(' '); // from-x to-x

              return (
                <div key={result._id} className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-md hover:shadow-lg transition-shadow rounded-3xl p-6 sm:p-8 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border self-start ${badgeClasses}`}>
                        {typeLabel(result.questionnaireType)}
                      </span>
                      <button 
                        onClick={() => handleDelete(result._id)}
                        className="text-xs text-red-500 hover:text-red-700 self-start font-semibold transition-colors hover:bg-red-50 px-2 py-1 rounded-md"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-extrabold text-gray-900 leading-none">{result.totalScore}</span>
                      <span className="text-lg font-bold text-gray-400"> / {max}</span>
                    </div>
                  </div>

                  <span className={`inline-block self-start px-4 py-1.5 rounded-full text-sm font-bold border mb-4 ${badgeClasses}`}>
                    {label}
                  </span>

                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-6 shadow-inner">
                    <div className={`h-full bg-gradient-to-r ${gradientClasses} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                  </div>

                  <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                    {formatDate(result.createdAt)} · {formatTime(result.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <button
          className="mt-8 w-full block text-center py-4 rounded-xl border-2 border-indigo-100 bg-white/40 text-indigo-700 font-bold hover:bg-white hover:border-indigo-200 transition-all shadow-sm"
          onClick={() => navigate('/assessment')}
        >
          ← Take another assessment
        </button>
      </div>
    </div>
  );
}