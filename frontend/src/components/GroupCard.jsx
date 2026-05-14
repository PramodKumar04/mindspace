import { Link } from 'react-router-dom';

const GroupCard = ({ group }) => {
  return (
    <Link 
      to={`/groups/${group._id}`}
      className="glass-card group flex flex-col h-full !p-8 hover:shadow-2xl hover:ring-8 ring-indigo-50/50 transition-all duration-500 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-50 group-hover:bg-indigo-500 transition-colors duration-500" />
      
      <div className="flex items-center gap-5 mb-6">
        <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-white shadow-inner flex items-center justify-center text-indigo-700 font-black shadow-md text-2xl">
          {group.avatar ? (
            <img src={group.avatar} alt={group.name} className="w-full h-full object-cover rounded-3xl" />
          ) : (
            group.name[0].toUpperCase()
          )}
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-2xl tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">
            {group.name}
          </h3>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">
            {group.category}
          </p>
        </div>
      </div>

      <p className="text-slate-600 mb-8 text-sm leading-relaxed line-clamp-2 font-medium">
        {group.description}
      </p>

      <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400">👥</span>
          <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">
            {group.memberCount} Members
          </span>
        </div>
        <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
          Enter Group →
        </span>
      </div>
    </Link>
  );
};

export default GroupCard;
