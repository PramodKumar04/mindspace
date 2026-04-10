import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import DisclaimerModal from '../components/DisclaimerModal';

const PHQ9_SEVERITY = [
  { max: 4, label: 'Optimal Balance', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { max: 9, label: 'Soft Concern', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { max: 14, label: 'Focused Support Needed', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { max: 19, label: 'Clinical Attention Recommended', color: 'text-orange-600 bg-orange-50 border-orange-100' },
  { max: 27, label: 'Urgent Wellbeing Care', color: 'text-rose-600 bg-rose-50 border-rose-100' },
];

const GAD7_SEVERITY = [
  { max: 4, label: 'Serene Baseline', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { max: 9, label: 'Mild Restlessness', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { max: 14, label: 'Significant Strain', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { max: 21, label: 'High Anxiety Alert', color: 'text-rose-600 bg-rose-50 border-rose-100' },
];

const MAX_SCORE = { phq9: 27, gad7: 21 };

function getSeverityScale(type) {
  return type === 'gad7' ? GAD7_SEVERITY : PHQ9_SEVERITY;
}

function getSeverityStyle(score, type) {
  const scale = getSeverityScale(type);
  const entry = scale.find((s) => score <= s.max) ?? scale[scale.length - 1];
  return { label: entry.label, colorClass: entry.color };
}

export default function Assessment() {
  const { type } = useParams();
  const navigate = useNavigate();

  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);

  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [saveWarning, setSaveWarning] = useState(false);

  const maxScore = MAX_SCORE[type] ?? 27;

  const [disclaimerDone, setDisclaimerDone] = useState(
    () => sessionStorage.getItem('disclaimerAcknowledged') === 'true'
  );

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    setQuestionnaire(null);
    setCurrentIndex(0);
    setAnswers([]);
    setSelected(null);
    setShowResults(false);

    assessmentAPI.fetchQuestionnaire(type)
      .then((data) => setQuestionnaire(data))
      .catch(() => setFetchError('The questionnaire could not be synchronized.'))
      .finally(() => setLoading(false));
  }, [type]);

  function handleNext() {
    if (selected === null) return;

    const newAnswers = [...answers, selected];
    const questions = questionnaire.questions;

    if (currentIndex + 1 < questions.length) {
      setAnswers(newAnswers);
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    } else {
      const score = newAnswers.reduce((sum, sc) => sum + sc, 0);
      setTotalScore(score);
      setShowResults(true);

      const { label } = getSeverityStyle(score, type);
      assessmentAPI.submitResult({ questionnaireType: type, totalScore: score, severityTag: label })
        .catch(() => setSaveWarning(true));
    }
  }

  function handleRetake() {
    setCurrentIndex(0);
    setAnswers([]);
    setSelected(null);
    setShowResults(false);
    setSaveWarning(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Pulse Logic...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !questionnaire) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6 text-center">
        <div className="glass-panel !rounded-[3rem] p-12 max-w-md w-full shadow-2xl">
           <div className="text-4xl mb-6">⚠️</div>
           <h3 className="text-2xl font-black text-slate-900 mb-2">Sync Error</h3>
           <p className="text-slate-400 font-medium mb-10">{fetchError}</p>
           <button className="btn-serene-primary w-full" onClick={() => navigate('/assessment')}>
              Back to Catalog
           </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const { label, colorClass } = getSeverityStyle(totalScore, type);
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6">
        <div className="glass-panel !rounded-[4rem] p-12 sm:p-20 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden transition-all duration-700">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-indigo-400 to-rose-400" />
           
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12 leading-none">
              {questionnaire.title} • Outcome
           </p>

           <div className={`mx-auto w-40 h-40 rounded-full border-[6px] flex flex-col items-center justify-center mb-10 shadow-2xl transition-all ${colorClass}`}>
              <span className="text-6xl font-black text-slate-900 leading-none">{totalScore}</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-2">/ {maxScore} Index</span>
           </div>

           <div className="mb-12">
              <span className={`inline-block px-10 py-3 rounded-full border-2 font-black text-xs uppercase tracking-widest shadow-lg ${colorClass}`}>
                 {label}
              </span>
           </div>

           <p className="text-slate-500 font-medium text-lg leading-relaxed mb-12 max-w-sm mx-auto">
              Your results have been securely finalized in your archive. Use this baseline to navigate your next steps.
           </p>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="btn-serene-secondary !text-slate-400 border-slate-100" onClick={handleRetake}>Retake Assessment</button>
              <button className="btn-serene-primary" onClick={() => navigate('/progress')}>View Full Insights</button>
           </div>
           
           <button className="mt-12 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-indigo-400 transition-colors" onClick={() => navigate('/dashboard')}>
              Back to Dashboard Hub
           </button>
        </div>
      </div>
    );
  }

  const questions = questionnaire.questions;
  const question = questions[currentIndex];
  const pct = ((currentIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6">
      {!disclaimerDone && (
        <DisclaimerModal
          onAcknowledge={() => setDisclaimerDone(true)}
          onBack={() => navigate('/assessment')}
        />
      )}

      <div className="glass-panel !rounded-[4rem] p-12 sm:p-20 max-w-3xl w-full shadow-2xl flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1.5 bg-indigo-600 transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
        
        <button 
          className="self-start text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-indigo-400 transition-colors mb-16 flex items-center gap-2"
          onClick={() => navigate('/assessment')}
        >
          <span>←</span> Back to Hub
        </button>

        <div className="text-center mb-16">
           <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">{questionnaire.title}</p>
           <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none px-4">
              {question.text}
           </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-16">
          {question.answers.map((ans) => {
            const isSelected = selected === ans.score;
            return (
              <button
                key={ans.score}
                className={`text-center p-8 rounded-[2rem] border-2 transition-all duration-500 font-black tracking-tight text-lg shadow-sm ${isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xl shadow-indigo-100 ring-8 ring-indigo-50'
                    : 'border-slate-50 bg-slate-50/30 text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-600'
                  }`}
                onClick={() => setSelected(ans.score)}
              >
                {ans.text}
              </button>
            );
          })}
        </div>

        <button
          disabled={selected === null}
          onClick={handleNext}
          className={`w-full max-w-md py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 ${selected === null
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-500 hover:-translate-y-1'
            }`}
        >
          {currentIndex + 1 === questions.length ? 'Submit Final Signal' : 'Next Step →'}
        </button>
        
        <p className="mt-12 text-[10px] font-black uppercase tracking-widest text-slate-200">
           Point {currentIndex + 1} of {questions.length} • Confidential Input
        </p>
      </div>
    </div>
  );
}