import { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CrisisInterventionBanner from '../components/CrisisInterventionBanner';

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessage = ({ msg }) => {
  const isUser = msg.role === 'user';
  const emotions = msg.metadata?.emotionTags || [];

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`relative p-5 rounded-[2rem] shadow-sm border transition-all duration-300 ${
            isUser 
              ? 'bg-indigo-600 text-white border-indigo-500 rounded-br-sm shadow-xl shadow-indigo-100' 
              : 'bg-white text-slate-700 border-slate-100 rounded-bl-sm shadow-md'
          }`}
        >
          <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          
          {!isUser && emotions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-50">
              {emotions.map((tag, i) => (
                <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-400 px-3 py-1 rounded-full border border-indigo-100/50">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 px-2">
          <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
            {formatTime(msg.createdAt)}
          </span>
          {isUser && (
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Chatbot() {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await chatAPI.getSession();
      setSession(res.session);
      if (res.messages) {
        setMessages(res.messages.map(m => ({
          ...m,
          createdAt: new Date(m.createdAt)
        })));
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const content = input.trim();
    if (!content || isTyping) return;

    const optimisticId = Date.now().toString();
    const userMsg = {
      _id: optimisticId,
      role: 'user',
      content,
      createdAt: new Date()
    };

    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await chatAPI.sendMessage(content);
      if (res.success) {
        setSession(prev => ({ ...prev, ...res.session }));
        const aiMsg = {
          ...res.message,
          createdAt: new Date(res.message.createdAt)
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please re-synchronize the session.",
        createdAt: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCloseSession = async () => {
    if (!session?._id) return;
    if (!window.confirm("Archive current session and generate clinical summary?")) return;

    try {
      setLoading(true);
      await chatAPI.closeSession(session._id);
      setMessages([]);
      await loadSession();
    } catch (error) {
      console.error('Failed to close session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Establishing Secure Uplink...</p>
        </div>
      </div>
    );
  }

  const riskLevel = session?.riskLevel || 'low';
  const showCrisis = riskLevel === 'high' || session?.flaggedForReview;

  return (
    <div className="h-screen bg-[#fcfdfe] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* Header */}
      <header className="z-20 bg-white/70 backdrop-blur-2xl border-b border-slate-100 py-5 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform">
               <span className="text-white">✨</span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${isTyping ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">
              Aura
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Clinical AI Guide</span>
              <div className="w-1 h-1 rounded-full bg-slate-200"></div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${riskLevel === 'low' ? 'text-emerald-500' : riskLevel === 'moderate' ? 'text-amber-500' : 'text-rose-500'}`}>
                Intensity: {riskLevel}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleCloseSession}
          className="px-6 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95"
        >
          Archive Session
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-6 py-12 sm:px-12 lg:px-64 xl:px-96 custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
        {showCrisis && (
          <div className="mb-12">
            <CrisisInterventionBanner />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-5xl mb-10 shadow-sm font-serif italic text-indigo-300">
               ?
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Initial Contact</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4">Honesty begins here.</h2>
            <p className="max-w-md text-slate-500 font-medium leading-relaxed mb-12">
              Aura is your private clinical shadow. Talk freely about stress, patterns, or daily weight. Our conversation is filtered through empathy and data.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              {[
                'I feel a weight on my chest lately', 
                'Academic burnout is reaching a peak', 
                'Help me find a grounding pattern', 
                'Just need a private space to vent'
              ].map(txt => (
                <button 
                  key={txt}
                  onClick={() => setInput(txt)}
                  className="p-6 rounded-[2rem] bg-white/60 border border-white backdrop-blur-md text-sm font-bold text-slate-600 text-left hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  "{txt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg._id} msg={msg} />
            ))}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-500">
                <div className="bg-white border border-slate-100 rounded-[1.5rem] rounded-bl-sm px-5 py-4 flex gap-2 items-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="shrink-0 p-8 lg:px-64 xl:px-96 bg-gradient-to-t from-white via-white to-transparent">
        <form 
          onSubmit={handleSend}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-2xl shadow-indigo-100/40 focus-within:border-indigo-600/30 transition-all p-2 flex items-end gap-3 translate-y-0 hover:-translate-y-1">
            <textarea
              ref={inputRef}
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Record your thoughts..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 font-black tracking-tight placeholder:text-slate-300 py-4 pl-6 pr-2 resize-none max-h-48 custom-scrollbar"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${
                input.trim() && !isTyping 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-100' 
                  : 'bg-slate-50 text-slate-200 scale-90'
              }`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
          <p className="mt-4 text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] px-4">
            Security: Clinical Data Managed Locally • End-to-End Encryption Enabled
          </p>
        </form>
      </footer>
    </div>
  );
}
