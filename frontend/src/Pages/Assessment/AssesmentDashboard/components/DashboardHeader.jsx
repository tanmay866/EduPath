import { Brain, CheckCircle, Zap } from 'lucide-react';

const DashboardHeader = ({ totalAttempts }) => {
  return (
    <div className="mb-10 pb-8 border-b border-white/5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Brain size={10} /> Skill Assessment
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1.5">
            Skill Assessment
          </h1>
          <p className="text-slate-500 text-sm">Test your skills and track your performance</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black">
            <CheckCircle size={11} /> Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black">
            <Zap size={11} /> {totalAttempts} Completed
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
