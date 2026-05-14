import { useState } from 'react';

const GroupPostComposer = ({ onSubmit, isSubmitting }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ content: content.trim(), isAnonymous });
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card !p-10 mb-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32" />
      
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6">Create Group Passage</p>
      
      <div className="flex flex-col gap-6 relative">
        <textarea
          className="w-full px-8 py-6 bg-slate-50/50 border-none rounded-[2rem] focus:ring-8 ring-indigo-50 transition-all resize-none text-slate-700 font-medium outline-none min-h-[120px]"
          placeholder="Share your thoughts with the group..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={isSubmitting}
        />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-5 h-5 rounded-lg border-2 border-slate-100 checked:bg-indigo-600 transition-all"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={isSubmitting}
            />
            Post Anonymously
          </label>
          
          <button
            type="submit"
            className="btn-serene-primary !px-10 !py-4 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Post →'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default GroupPostComposer;
