import { useNavigate } from 'react-router-dom';

const assessments = [
  {
    type: 'phq9',
    label: 'PHQ-9',
    name: 'Depression Screening',
    description:
      'The Patient Health Questionnaire measures the severity of depressive symptoms over the past two weeks. Used widely by clinicians worldwide.',
    questions: 9,
    minutes: 3,
    scaleLabel: 'Minimal → Severe',
    accentClass: 'bg-indigo-600',
    textClass: 'text-indigo-600',
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    hoverBorder: 'hover:border-indigo-300',
  },
  {
    type: 'gad7',
    label: 'GAD-7',
    name: 'Anxiety Screening',
    description:
      'The Generalised Anxiety Disorder scale measures anxiety symptoms over the past two weeks. A validated tool for identifying anxiety disorders.',
    questions: 7,
    minutes: 2,
    scaleLabel: 'Minimal → Severe',
    accentClass: 'bg-emerald-600',
    textClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    hoverBorder: 'hover:border-emerald-300',
  },
];

export default function AssessmentHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10 max-w-2xl">
        <span className="inline-block bg-white/60 backdrop-blur-md border border-indigo-200 text-indigo-700 rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
          Mental Health Screening
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-4">
          Choose an Assessment
        </h1>
        <p className="text-lg text-gray-600 font-medium leading-relaxed">
          These validated clinical tools help you understand your mental wellbeing. Each takes just a few minutes and results are securely saved to your history.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {assessments.map((a) => (
          <div
            key={a.type}
            onClick={() => navigate(`/assessment/${a.type}`)}
            className={`group bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 cursor-pointer transition-all duration-500 shadow-lg hover:shadow-2xl hover:-translate-y-2 ${a.hoverBorder} flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold tracking-widest uppercase border px-3 py-1 rounded-full ${a.badgeClass}`}>
                {a.label}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 m-0 group-hover:text-indigo-700 transition-colors">
              {a.name}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed flex-grow m-0">
              {a.description}
            </p>

            <div className="flex gap-6 border-t border-gray-200/60 pt-4 mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold text-gray-900">{a.questions}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Questions</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold text-gray-900">~{a.minutes} min</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Duration</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold text-gray-900 text-sm flex items-center h-full">{a.scaleLabel}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Scale</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/assessment/${a.type}`);
              }}
              className={`mt-2 py-3 rounded-xl w-full text-white font-bold transition-all shadow-md group-hover:shadow-lg ${a.accentClass} hover:opacity-90`}
            >
              Start {a.label} →
            </button>
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm text-gray-500 text-center max-w-lg font-medium leading-relaxed">
        These screenings are not a clinical diagnosis. If you are struggling, please reach out to a counsellor or mental health professional.
      </p>
    </div>
  );
}