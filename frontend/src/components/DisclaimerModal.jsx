const STORAGE_KEY = 'disclaimerAcknowledged';

export default function DisclaimerModal({ onAcknowledge, onBack }) {
  // Already acknowledged this session — render nothing
  if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
    return null;
  }

  function handleAcknowledge() {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    onAcknowledge();
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div
        className="bg-white/80 backdrop-blur-2xl border border-white rounded-[24px] p-8 sm:p-10 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
      >
        <div className="text-4xl mb-4 text-center">📋</div>
        <h2 id="disclaimer-title" className="text-2xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
          Important Notice
        </h2>

        <p className="text-gray-600 text-sm leading-relaxed mb-4 font-medium">
          These questionnaires are <strong className="text-indigo-600">validated clinical screening tools</strong>,
          but they are <strong className="text-indigo-600">not a substitute for professional diagnosis</strong>
          or medical advice. Results are for personal awareness only and are not used to diagnose any condition.
        </p>

        <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
          Your responses are stored securely and are only visible to you and authorised counsellors at your institution.
        </p>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-8 text-rose-800 text-sm leading-relaxed font-medium shadow-sm">
          🚨 <strong>If you are in crisis or immediate danger</strong>, please stop and contact:
          <ul className="mt-3 space-y-2 opacity-90">
            <li>• National Crisis Line: <strong>988</strong> (call or text, 24/7)</li>
            <li>• Emergency Services: <strong>911</strong></li>
            <li>• Crisis Text Line: text <strong>HOME</strong> to 741741</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            id="disclaimer-continue-btn"
            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-[15px] shadow-md transition-all hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg"
            onClick={handleAcknowledge}
          >
            I Understand — Continue
          </button>
          <button
            id="disclaimer-back-btn"
            className="w-full py-3.5 rounded-xl border-2 border-gray-200 bg-white/50 text-gray-700 font-bold text-[15px] transition-all hover:bg-white hover:border-gray-300"
            onClick={onBack}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
