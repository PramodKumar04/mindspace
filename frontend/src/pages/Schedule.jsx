import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectAPI } from '../services/api';

const Schedule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions, setSessions] = useState({ upcoming: [], past: [] });

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (user?.role === 'student') {
        response = await connectAPI.getStudentBookings();
      } else if (user?.role === 'counselor') {
        response = await connectAPI.getCounselorBookings();
      }
      
      const allBookings = response?.bookings ?? [];
      const now = new Date();

      const upcoming = allBookings
        .filter(b => (b.status === 'approved' || b.status === 'pending') && new Date(b.slotStart) > now)
        .sort((a, b) => new Date(a.slotStart) - new Date(b.slotStart));

      const past = allBookings
        .filter(b => b.status === 'completed' || ((b.status === 'approved' || b.status === 'pending') && new Date(b.slotStart) <= now))
        .sort((a, b) => new Date(b.slotStart) - new Date(a.slotStart));

      setSessions({ upcoming, past });
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await connectAPI.updateStatus(bookingId, { status });
      fetchSchedule();
    } catch (error) {
      console.error('Failed to update booking:', error);
      alert(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  const currentSessions = activeTab === 'upcoming' ? sessions.upcoming : sessions.past;

  return (
    <div className="min-h-screen bg-[#fcfdfe] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-16">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Your Schedule</p>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter">My Sessions</h1>
           <p className="text-slate-500 font-medium text-lg mt-4 max-w-xl">
             View your upcoming sessions and previous history in one place.
           </p>
        </div>

        {/* High-End Tab Switcher */}
        <div className="flex gap-2 p-2 bg-slate-100/50 backdrop-blur-md rounded-[2rem] w-fit mb-12 border border-slate-200/40 shadow-inner">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-500 ${
              activeTab === 'upcoming' 
              ? 'bg-white text-indigo-700 shadow-xl' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Upcoming ({sessions.upcoming.length})
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-500 ${
              activeTab === 'past' 
              ? 'bg-white text-indigo-700 shadow-xl' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            History ({sessions.past.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-40">
             <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
             <p className="text-slate-300 font-black text-[10px] tracking-[0.3em] uppercase animate-pulse">Syncing with the hub...</p>
          </div>
        ) : currentSessions.length === 0 ? (
          <div className="glass-panel !rounded-[3rem] p-24 text-center shadow-2xl border-none">
             <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-8 text-5xl italic font-serif text-slate-200">
               {activeTab === 'upcoming' ? '0' : 'ø'}
             </div>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Timeline is clear</h3>
             <p className="text-slate-400 mt-3 max-w-xs mx-auto font-medium">
               {activeTab === 'upcoming' 
                 ? "You have no upcoming sessions scheduled at the moment."
                 : "You haven't had any previous sessions yet."
               }
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {currentSessions.map((session) => (
              <div 
                key={session._id}
                className="glass-card group flex flex-col xl:flex-row xl:items-center justify-between gap-10 hover:!border-indigo-100 ring-offset-4 ring-indigo-50/0 hover:ring-8 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                      session.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      session.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {session.status}
                    </div>
                    {activeTab === 'past' && (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Archive Record</span>
                    )}
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 border border-white shadow-inner flex items-center justify-center text-3xl">
                      {user?.role === 'student' ? '🎓' : '👤'}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">
                         {user?.role === 'student' ? 'Counselor' : 'Student Member'}
                      </p>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">
                        {user?.role === 'student' ? (session.counselorId?.name || 'Counsellor') : (session.studentId?.name || 'Student')}
                      </h3>
                      <div className="flex items-center gap-4 text-slate-500 font-bold text-sm bg-slate-50/50 w-fit px-4 py-2 rounded-xl">
                        <span>🗓️</span> {formatDate(session.slotStart)}
                      </div>
                    </div>
                  </div>

                  {activeTab === 'upcoming' && session.meetingCode && (
                    <div className="mt-8 p-6 bg-indigo-50/20 border border-indigo-100/50 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl -mr-16 -mt-16" />
                       <div className="relative z-10">
                         <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-2">Meeting Code</p>
                         <p className="font-mono text-3xl font-black tracking-[0.2em] text-indigo-700">{session.meetingCode}</p>
                       </div>
                       <button 
                         onClick={() => { navigator.clipboard.writeText(session.meetingCode); alert('Credential Copied!'); }}
                         className="relative z-10 px-6 py-3 rounded-2xl bg-white text-indigo-600 font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-lg transition-all"
                        >
                         Copy Code
                       </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 min-w-[240px]">
                  {activeTab === 'upcoming' ? (
                    session.status === 'approved' && session.meetingCode ? (
                      <button 
                         onClick={() => window.location.assign(`/video/${session.meetingCode}`)}
                         className="btn-serene-primary !py-5 shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 text-lg"
                      >
                         <span>📹</span> Join Session
                      </button>
                    ) : user?.role === 'counselor' && session.status === 'pending' ? (
                      <div className="flex flex-col gap-3">
                        <button onClick={() => handleUpdateStatus(session._id, 'approved')} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-100 hover:bg-emerald-500 transition-all">Approve</button>
                        <button onClick={() => handleUpdateStatus(session._id, 'rejected')} className="w-full py-4 bg-slate-100 text-slate-400 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:text-rose-500 transition-all">Decline</button>
                      </div>
                    ) : (
                      <div className="p-8 bg-amber-50/40 border border-amber-100 rounded-[2.5rem] text-center">
                         <div className="text-2xl mb-2">⏳</div>
                         <p className="text-amber-600 font-black text-[10px] uppercase tracking-widest">Awaiting Approval</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-8 bg-slate-50/50 rounded-[2.5rem] border border-white">
                       <span className="text-2xl mb-4 block">✅</span>
                       <p className="text-slate-300 font-black italic text-xs">Record Finalized</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Helper Footer */}
        <p className="text-center mt-20 text-[10px] font-black uppercase tracking-[0.4em] text-slate-200">
           Your Wellness Timeline • MindSpace Hub
        </p>
      </div>
    </div>
  );
};

export default Schedule;
