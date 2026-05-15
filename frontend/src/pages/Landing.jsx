import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  {
    icon: '🧘',
    step: 'Step 01',
    title: 'Check-In',
    desc: 'Start with simple check-ins to see how you\'re feeling and track your mood over time.',
  },
  {
    icon: '🌿',
    step: 'Step 02',
    title: 'Personalized Support',
    desc: 'Get a curated selection of resources, exercises, and tips tailored just for you.',
  },
  {
    icon: '🤝',
    step: 'Step 03',
    title: 'Connect with Help',
    desc: 'Easily book a session with a counselor or chat with our 24/7 AI assistant whenever you need it.',
  },
];

const FEATURES = [
  {
    icon: '🧠',
    title: 'Wellness Check-Ins',
    desc: 'Simple tools to track your mental wellbeing over time with complete privacy.',
    theme: 'bg-rose-50 text-rose-600 border-rose-100'
  },
  {
    icon: '✨',
    title: 'Supportive AI',
    desc: 'A constant companion available 24/7 for immediate support and guidance.',
    theme: 'bg-blue-50 text-blue-600 border-blue-100'
  },
  {
    icon: '🎭',
    title: 'Daily Insights',
    desc: 'Get resources and articles recommended for you based on your check-ins.',
    theme: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  },
  {
    icon: '🏛️',
    title: 'Campus Community',
    desc: 'Connect with your college support systems and a safe peer community.',
    theme: 'bg-purple-50 text-purple-600 border-purple-100'
  },
  {
    icon: '📱',
    title: 'Easy Appointments',
    desc: 'A simple way to book sessions with professional counselors when you need them.',
    theme: 'bg-amber-50 text-amber-600 border-amber-100'
  },
  {
    icon: '🛡️',
    title: 'Total Privacy',
    desc: 'Your data is encrypted and kept private. You are in control of your journey.',
    theme: 'bg-slate-50 text-slate-600 border-slate-100'
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen selection:bg-indigo-100 selection:text-indigo-900">

      {/* ── BACKGROUND LAYER ── */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-[2px]" />
        <img
          src="/images/jei-lee-0lL6Sox7n1Y-unsplash.jpg"
          alt="Serene Background"
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">

        {/* ── HERO SECTION ── */}
        <section className="pt-32 pb-24 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 mb-8 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-900/60 leading-none">
              A Healing Space for Students
            </p>
          </div>

          <h1 className="text-6xl sm:text-8xl font-black font-serif text-slate-900 leading-[0.9] tracking-tight mb-8">
            Peace of mind is <br />
            <span className="italic font-normal">within reach.</span>
          </h1>

          <p className="max-w-xl mx-auto text-lg sm:text-xl text-slate-600 font-medium leading-relaxed mb-12">
            MindSpace provides a safe, compassionate environment for students to track their mental wellbeing and find professional support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn-serene-primary w-full sm:w-auto text-center py-5 px-12 text-lg">
                  Start Your Journey
                </Link>
                <Link to="/login" className="btn-serene-secondary w-full sm:w-auto text-center py-5 px-12 text-lg">
                  Sign In
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-serene-primary w-full sm:w-auto text-center py-5 px-12 text-lg rounded-3xl">
                View Your Dashboard &rarr;
              </Link>
            )}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 border-t border-slate-200/40">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">How it works</h2>
            <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.step} className="glass-card group hover:-translate-y-2">
                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  {s.icon}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">{s.step}</p>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Supportive Tools</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Everything you need in one place</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white/40 border border-white/50 backdrop-blur-md rounded-[2.5rem] p-8 hover:bg-white/60 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm border ${f.theme}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        {!isAuthenticated && (
          <section className="py-32">
            <div className="glass-panel rounded-[3rem] p-16 text-center shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl -ml-32 -mb-32" />

              <div className="relative z-10">
                <h2 className="text-5xl font-black text-slate-900 mb-6">Your wellness journey starts today.</h2>
                <p className="max-w-lg mx-auto text-slate-500 font-medium mb-12">
                  Join a supportive community designed for your wellbeing.
                  Take the first step towards a calmer, more focused campus life.
                </p>
                <Link to="/register" className="btn-serene-primary inline-block">
                  Join for Free
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer className="py-12 border-t border-slate-200/40 text-center">
          <p className="text-slate-400 text-xs font-bold font-['Plus_Jakarta_Sans'] uppercase tracking-[0.2em] leading-loose">
            MindSpace • Your Digital Mental Health Companion <br />
            <span className="font-normal normal-case italic text-slate-300">Supported by your college health department</span>
          </p>
        </footer>

      </div>

      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 30s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
