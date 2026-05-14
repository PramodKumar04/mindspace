import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import DisclaimerModal from '../components/DisclaimerModal';

const PHQ9_SEVERITY = [
  { max: 4, label: 'Feeling Great', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { max: 9, label: 'Feeling Okay', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { max: 14, label: 'Needs Attention', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { max: 19, label: 'Needs Support', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { max: 27, label: 'Needs Urgent Support', color: 'text-rose-600 bg-rose-50 border-rose-200' },
];

const GAD7_SEVERITY = [
  { max: 4, label: 'Calm', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { max: 9, label: 'Slightly Anxious', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { max: 14, label: 'Very Anxious', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { max: 21, label: 'Highly Anxious', color: 'text-rose-600 bg-rose-50 border-rose-200' },
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
      .catch(() => setFetchError('We couldn\'t load the check-in questions right now.'))
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

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
            Loading check-in...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (fetchError || !questionnaire) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 max-w-md w-full">
          <div className="text-3xl mb-4">⚠️</div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Connection Error</h3>
          <p className="text-slate-400 font-medium text-sm mb-8">{fetchError}</p>
          <button className="btn-serene-primary w-full" onClick={() => navigate('/check-in')}>
            Back to Check-Ins
          </button>
        </div>
      </div>
    );
  }

  // ── Results ──
  if (showResults) {
    const { label, colorClass } = getSeverityStyle(totalScore, type);
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 max-w-lg w-full text-center relative overflow-hidden">
          {/* top accent bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-indigo-400 to-rose-400" />

          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
            {questionnaire.title} • Results
          </p>

          {/* Score circle */}
          <div className={`mx-auto w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center mb-6 ${colorClass}`}>
            <span className="text-4xl font-black text-slate-900 leading-none">{totalScore}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">/ {maxScore}</span>
          </div>

          <div className="mb-6">
            <span className={`inline-block px-6 py-2 rounded-full border font-black text-xs uppercase tracking-widest ${colorClass}`}>
              {label}
            </span>
          </div>

          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            Your results have been saved to your journey history. We're here to help you through your next steps.
          </p>

          {saveWarning && (
            <p className="text-amber-500 text-xs font-black uppercase tracking-widest mb-4">
              Results could not be saved — please check your connection.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="btn-serene-secondary !text-slate-400 border-slate-100 text-sm" onClick={handleRetake}>
              Start Over
            </button>
            <button className="btn-serene-primary text-sm" onClick={() => navigate('/progress')}>
              View My Progress
            </button>
          </div>

          <button
            className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-indigo-400 transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Question ──
  const questions = questionnaire.questions;
  const question = questions[currentIndex];
  const pct = (currentIndex / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6">
      {!disclaimerDone && (
        <DisclaimerModal
          onAcknowledge={() => setDisclaimerDone(true)}
          onBack={() => navigate('/check-in')}
        />
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 max-w-2xl w-full flex flex-col items-center relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-1 bg-indigo-600 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />

        {/* Back link */}
        <button
          className="self-start text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-indigo-400 transition-colors mb-8 flex items-center gap-2"
          onClick={() => navigate('/check-in')}
        >
          ← Back
        </button>

        {/* Question */}
        <div className="text-center mb-8 w-full">
          <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-3">
            {questionnaire.title}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug px-2">
            {question.text}
          </h2>
        </div>

        {/* Answer options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8">
          {question.answers.map((ans) => {
            const isSelected = selected === ans.score;
            return (
              <button
                key={ans.score}
                className={`text-center p-5 rounded-xl border-2 transition-all duration-200 font-black tracking-tight text-sm ${isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-50'
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-600'
                  }`}
                onClick={() => setSelected(ans.score)}
              >
                {ans.text}
              </button>
            );
          })}
        </div>

        {/* Next / Submit */}
        <button
          disabled={selected === null}
          onClick={handleNext}
          className={`w-full max-w-sm py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-200 ${selected === null
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:-translate-y-0.5 shadow-lg shadow-indigo-100'
            }`}
        >
          {currentIndex + 1 === questions.length ? 'Finish Check-In' : 'Next Step →'}
        </button>

        <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-200">
          Question {currentIndex + 1} of {questions.length} • Your privacy is protected
        </p>
      </div>
    </div>
  );
}