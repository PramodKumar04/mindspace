import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    alias: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password synchronization failure.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Security key must be at least 6 parameters.');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      const { role, hasCompletedOnboarding } = result.user;
      if (role === 'admin') navigate('/admin');
      else if (role === 'student' && !hasCompletedOnboarding) navigate('/onboarding');
      else navigate('/dashboard');
    } else {
      setError(result.message || 'Registration sequence interrupted.');
    }

    setLoading(false);
  };

  const inputCls = 'w-full p-4 rounded-2xl bg-slate-50 border-none text-slate-900 font-black tracking-tight placeholder:text-slate-200 focus:ring-8 ring-indigo-50 transition-all outline-none';
  const labelCls = 'block text-[10px] font-black uppercase tracking-widest text-slate-300 mb-3';

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6 selection:bg-indigo-100 py-20">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
         <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-[100px] -ml-48 -mt-48" />
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-100 rounded-full blur-[100px] -mr-48 -mb-48" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Brand */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-2xl mx-auto mb-6 shadow-2xl shadow-indigo-100 -rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-white">🌱</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">MindSpace</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">New Member Registration</p>
        </div>

        {/* Auth Panel */}
        <div className="glass-panel !rounded-[4rem] p-10 lg:p-16 shadow-2xl border-none">
          <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight text-center">Join our community.</h2>
          
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center mb-10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className={labelCls}>Full Identity</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Clinical Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="email" className={labelCls}>Email Node</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="role" className={labelCls}>Access Level</label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="student">Student Member</option>
                  <option value="counselor">Clinical Partner</option>
                </select>
              </div>

              <div>
                <label htmlFor="alias" className={labelCls}>
                  Alias <span className="text-slate-200 font-normal tracking-normal">(Anonymous Shield)</span>
                </label>
                <input
                  id="alias"
                  name="alias"
                  type="text"
                  placeholder="Community Name"
                  value={formData.alias}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className={labelCls}>Security Key</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelCls}>Confirm Key</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Sync Verification"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 ${
                loading
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-500 hover:-translate-y-1'
              }`}
            >
              {loading ? 'Initializing...' : 'Register Account →'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] text-slate-200 font-black uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <p className="text-center font-black text-[10px] uppercase tracking-widest text-slate-400">
            Existing credentials?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-400 border-b-2 border-indigo-50 transition-all pb-0.5">
              Enter Hub here
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-200 mt-16 leading-relaxed">
           Confidential Registration Protocol <br /> Personal Data is Locally Orchestrated
        </p>
      </div>
    </div>
  );
};

export default Register;
