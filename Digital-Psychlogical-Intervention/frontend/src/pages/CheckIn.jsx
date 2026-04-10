import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import { onboardingFlow } from '../data/onboardingFlow';

const CATEGORY_ICONS = {
  'Rest & Routine': '🌙',
  'Physical Wellbeing': '💪',
  'Focus & Daily Life': '🎯',
  'Mood & Joy': '🌈',
  'Stress & Nervous System': '🧘',
  'Deep Check-In': '💛',
};

export default function CheckIn() {
  const navigate = useNavigate();

  const [step, setStep] = useState('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const question = onboardingFlow[currentIndex];
  const total = onboardingFlow.length;
  const pct = step === 'intro' ? 0 : ((currentIndex) / total) * 100;

  function handleSelect(weight) {
    setSelected(weight);
  }

  async function handleNext() {
    if (selected === null) return;

    const newAnswers = [...answers, { clinicalMap: question.clinicalMap, weight: selected }];

    if (currentIndex + 1 < total) {
      setAnswers(newAnswers);
      setCurrentIndex(i => i + 1);
      setSelected(null);
    } else {
      setStep('submitting');
      try {
        const res = await assessmentAPI.submitFlow(newAnswers, false);
        setResult(res);
        setStep('done');
      } catch (err) {
        console.error('Check-in submit failed:', err);
        setStep('done');
      }
    }
  }

  // ── Intro screen ──
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6 text-center">
        <div className="glass-panel !rounded-[4rem] p-12 sm:p-20 max-w-xl w-full shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-indigo-400 to-teal-400" />
           
           <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-4xl mx-auto mb-10 shadow-2xl shadow-indigo-100 italic font-serif text-white">
             {CATEGORY_ICONS['Deep Check-In']}
           </div>
           
           <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">
             Emotional Pulse
           </h1>
           <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10 max-w-sm mx-auto">
             A momentary pause to synchronize with your inner state. 
             Honest reflection leads to better care.
           </p>
           
           <div className="p-6 bg-slate-50 rounded-3xl mb-12 flex justify-center gap-8 border border-white">
              <div className="text-center">
                 <p className="text-slate-900 font-black text-lg leading-none">15</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Queries</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center">
                 <p className="text-slate-900 font-black text-lg leading-none">~3m</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Duration</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center">
                 <p className="text-slate-900 font-black text-lg leading-none">🔒</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Private</p>
              </div>
           </div>

           <button onClick={() => setStep('quiz')} className="btn-serene-primary w-full !py-5 shadow-2xl shadow-indigo-100 text-lg">
             Begin Awareness Flow
           </button>
           
           <button onClick={() => navigate('/dashboard')} className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-indigo-400 transition-colors">
             Return to Dashboard
           </button>
        </div>
      </div>
    );
  }

  // ── Submitting ──
  if (step === 'submitting') {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6 text-center">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Running Sentiment Correlation...</p>
        </div>
      </div>
    );
  }

  // ── Results screen ──
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6 text-center">
        <div className="glass-panel !rounded-[4rem] p-12 sm:p-20 max-w-2xl w-full shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-indigo-400 to-rose-400" />
           
           <div className="w-20 h-20 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-4xl mx-auto mb-10 shadow-2xl shadow-emerald-100 text-white">
             ✨
           </div>
           
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">Sync Complete</h1>
           <p className="text-slate-500 font-medium text-lg mb-12">Snapshot of your current emotional landscape.</p>

           {result && (
             <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                   <p className="text-3xl font-black text-indigo-600 leading-none mb-1">{result.phq9Score ?? 0}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mood (PHQ-9)</p>
                </div>
                <div className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                   <p className="text-3xl font-black text-purple-600 leading-none mb-1">{result.gad7Score ?? 0}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anxiety (GAD-7)</p>
                </div>
                <div className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                   <p className="text-3xl font-black text-pink-600 leading-none mb-1">{result.pssScore ?? 0}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stress (PSS)</p>
                </div>
                <div className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                   <p className="text-3xl font-black text-emerald-600 leading-none mb-1">{result.promisScore ?? 0}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vitality</p>
                </div>
             </div>
           )}

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => navigate('/progress')} className="btn-serene-primary">Full Progress</button>
              <button onClick={() => navigate('/dashboard')} className="btn-serene-secondary !text-slate-400 border-slate-100">Dismiss</button>
           </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ──
  const categoryIcon = CATEGORY_ICONS[question.category] || '💬';

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6">
      <div className="glass-panel !rounded-[4rem] p-12 sm:p-20 max-w-3xl w-full shadow-2xl flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1.5 bg-indigo-600 transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
        
        <div className="w-full flex justify-between items-center mb-16">
           <div className="flex items-center gap-3 bg-slate-50 px-5 py-2 rounded-full border border-white">
              <span className="text-xl">{categoryIcon}</span>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-400">
                {question.category}
              </span>
           </div>
           <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">
             Record {currentIndex + 1} of {total}
           </span>
        </div>

        <div className="text-center mb-12">
           <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight px-4">
             {question.question}
           </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full max-w-lg mb-12">
          {question.options.map((opt) => {
            const isSelected = selected === opt.weight;
            return (
              <button
                key={opt.weight}
                className={`text-left px-8 py-5 rounded-[1.5rem] border-2 transition-all duration-500 font-black tracking-tight text-lg ${isSelected
                    ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50 text-indigo-700'
                    : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-600'
                  }`}
                onClick={() => handleSelect(opt.weight)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <button
          disabled={selected === null}
          onClick={handleNext}
          className={`w-full max-w-xs py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 ${selected === null
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-500 hover:-translate-y-1'
            }`}
        >
          {currentIndex + 1 === total ? 'View Outcomes →' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
}
