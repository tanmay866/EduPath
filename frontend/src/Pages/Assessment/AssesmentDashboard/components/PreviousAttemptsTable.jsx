import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, XCircle, Calendar, Target } from 'lucide-react';

const PreviousAttemptsTable = ({ attempts }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
          <Target size={12} className="text-indigo-400" />
        </div>
        <h2 className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Previous Attempts</h2>
      </div>

      <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Attempt Date', 'Score', 'Percentage', 'Status', 'Action'].map(col => (
                  <th key={col} className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt, idx) => {
                const isPass = attempt.status === 'Pass';
                return (
                  <tr
                    key={attempt.id}
                    className="border-b border-white/5 last:border-0 transition-colors duration-200"
                    style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                  >
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar size={12} className="text-slate-600 shrink-0" />
                        {attempt.date}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-black text-white">
                        {attempt.score}
                        <span className="text-slate-600 font-normal">/{attempt.totalQuestions}</span>
                      </span>
                    </td>

                    {/* Percentage bar */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${attempt.percentage}%`,
                              background: isPass
                                ? 'linear-gradient(90deg,#34d399,#059669)'
                                : 'linear-gradient(90deg,#fb7185,#e11d48)',
                            }}
                          />
                        </div>
                        <span className={`text-sm font-black ${isPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {attempt.percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${
                        isPass
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                      }`}>
                        {isPass
                          ? <CheckCircle2 size={10} />
                          : <XCircle size={10} />}
                        {attempt.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/assessment/result/${attempt.resultId || attempt.id}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors duration-200 group"
                      >
                        View Result
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {attempts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <Target size={20} className="text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm font-semibold">No previous attempts found</p>
            <p className="text-slate-700 text-xs mt-1">Start your first assessment to see results here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousAttemptsTable;
