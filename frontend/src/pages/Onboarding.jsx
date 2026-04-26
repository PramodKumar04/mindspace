import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [step, setStep] = useState('welcome'); // 'welcome' | index | 'submitting' | 'done'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const question = onboardingFlow[currentIndex];
  const total = onboardingFlow.length;
  const pct = step === 'welcome' ? 0 : ((currentIndex) / total) * 100;

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
        const res = await assessmentAPI.submitFlow(newAnswers, true);
        setResult(res);
        if (res.user) {
          setUser(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        setStep('done');
      } catch (err) {
        console.error('Onboarding submit failed:', err);
        setStep('done');
      }
    }
  }

  // ── Welcome screen ──
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6 text-center">
        <div className="glass-panel !rounded-[4rem] p-12 sm:p-20 max-w-2xl w-full shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 via-emerald-400 to-pink-400" />
           
           <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-4xl mx-auto mb-10 shadow-2xl shadow-indigo-100 italic font-serif text-white">
             🌿
           </div>
           
           <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
             The journey <br />
             <span className="italic font-normal">begins here.</span>
           </h1>
           <p className="text-slate-500 font-medium text-xl leading-relaxed mb-12 max-w-sm mx-auto">
             Let's synchronize your experience. We'll ask a few foundational questions to tailor your clinical support hub.
           </p>
           
           <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                 <span className="text-indigo-600 font-black">15</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Queries</span>
              </div>
              <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                 <span className="text-indigo-600 font-black">~3m</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</span>
              </div>
           </div>

           <button onClick={() => setStep('quiz')} className="btn-serene-primary w-full !py-6 shadow-2xl shadow-indigo-100 text-lg">
             Calibrate Experience
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
            <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Personalizing Clinical Environment...</p>
        </div>
      </div>
    );
  }

  // ── Done screen ──
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6 text-center">
        <div className="glass-panel !rounded-[4rem] p-12 sm:p-20 max-w-2xl w-full shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-indigo-400 to-teal-400" />
           
           <div className="w-20 h-20 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-4xl mx-auto mb-10 shadow-2xl shadow-emerald-100 text-white">
             ✨
           </div>
           
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">Protocol Active.</h1>
           <p className="text-slate-500 font-medium text-lg mb-12">Your baseline is securely saved in the system ledger.</p>

           {result && (
             <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="bg-white/60 p-8 rounded-[2.5rem] border border-white shadow-xl">
                   <p className="text-4xl font-black text-indigo-600 leading-none mb-1">{result.phq9Score ?? 0}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mood Core</p>
                </div>
                <div className="bg-white/60 p-8 rounded-[2.5rem] border border-white shadow-xl">
                   <p className="text-4xl font-black text-rose-500 leading-none mb-1">{result.gad7Score ?? 0}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intensity Arc</p>
                </div>
             </div>
           )}

           <button onClick={() => navigate('/dashboard')} className="btn-serene-primary w-full !py-5">
             Enter Dashboard
           </button>
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
             Step {currentIndex + 1} of {total}
           </span>
        </div>

        <div className="text-center mb-16">
           <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight px-4">
             {question.question}
           </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full max-w-lg mb-16">
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
          {currentIndex + 1 === total ? 'Finalize Protocol' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
