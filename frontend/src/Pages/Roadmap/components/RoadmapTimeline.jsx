import React, { useMemo } from 'react';
import { CheckCircle2, Circle, Loader2, Link as LinkIcon, Map, Clock, Calendar, Zap, BookOpen, ChevronRight } from 'lucide-react';

const DIFFICULTY = {
  beginner:     { cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',  dot: '#34d399' },
  intermediate: { cls: 'bg-amber-500/15  text-amber-300  border-amber-500/30',      dot: '#fbbf24' },
  advanced:     { cls: 'bg-rose-500/15   text-rose-300   border-rose-500/30',        dot: '#fb7185' },
};

/* ─── Loading skeleton ──────────────────────────────────────────── */
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1,2,3].map(i => (
      <div key={i} className="backdrop-blur-xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 p-6 animate-pulse">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-16 bg-white/5 rounded-full" />
            <div className="h-5 w-48 bg-white/8 rounded-lg" />
            <div className="h-3 w-32 bg-white/5 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ─── Main component ────────────────────────────────────────────── */
const RoadmapTimeline = ({ roadmapData, isRoadmapLoading, updatingSkill, onMarkCompleted }) => {
  const skills = roadmapData?.skills || [];
  const hasRoadmap = Boolean(skills.length > 0);

  const stats = useMemo(() => {
    const completed = skills.filter(s => s.status === 'completed').length;
    const pending   = skills.filter(s => s.status !== 'completed').length;
    const progress  = skills.length ? Math.round((completed / skills.length) * 100) : 0;
    return { completed, pending, progress };
  }, [skills]);

  const roadmapPath = useMemo(() => skills.map(s => s?.skill).filter(Boolean), [skills]);

  /* ── Loading ── */
  if (isRoadmapLoading) return <LoadingSkeleton />;

  /* ── Empty ── */
  if (!hasRoadmap) return (
    <div className="backdrop-blur-xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 p-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
        <Map size={28} className="text-indigo-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">No roadmap selected</h2>
      <p className="text-slate-500 text-sm">Select a roadmap from the sidebar or generate a new one.</p>
    </div>
  );

  return (
    <div className="space-y-6">

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .progress-shimmer::after {
          content: '';
          position: absolute; inset-y: 0; left: 0;
          width: 25%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: shimmer 2s ease-in-out infinite;
        }
        .step-card {
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .step-card:hover { transform: translateY(-2px); }
        .step-card.pending:hover {
          border-color: rgba(99,102,241,0.35) !important;
          box-shadow: 0 0 32px -8px rgba(99,102,241,0.2);
        }
        .step-card.done {
          border-color: rgba(52,211,153,0.2) !important;
          box-shadow: 0 0 28px -10px rgba(52,211,153,0.12);
        }
        .resource-pill {
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .resource-pill:hover {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.4);
          color: #a5b4fc;
          transform: translateY(-1px);
        }
        .mark-btn {
          transition: all 0.25s ease;
        }
        .mark-btn:not(:disabled):hover {
          background: rgba(99,102,241,0.3);
          border-color: rgba(99,102,241,0.6);
          color: #fff;
          transform: scale(1.04);
          box-shadow: 0 4px 16px -4px rgba(99,102,241,0.4);
        }
      `}</style>

      {/* ── Professional Learning Path Roadmap ──────────────────── */}
      {roadmapPath.length > 0 && (() => {
        const completedCount = skills.filter(s => s.status === 'completed').length;
        const currentIdx     = completedCount; // first non-completed
        return (
          <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
                  <Map size={13} className="text-indigo-400" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Learning Path</p>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  {completedCount}/{skills.length} done
                </span>
              </div>
            </div>

            {/* Scrollable node strip */}
            <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              <div className="flex items-start" style={{ minWidth: 'max-content', gap: 0 }}>
                {skills.map((step, index) => {
                  const isDone    = step.status === 'completed';
                  const isCurrent = index === currentIdx;
                  const isFuture  = index > currentIdx;
                  const isLast    = index === skills.length - 1;
                  const diffKey   = (step.difficulty || 'beginner').toLowerCase();
                  const diffColor = diffKey === 'advanced' ? '#fb7185' : diffKey === 'intermediate' ? '#fbbf24' : '#34d399';

                  return (
                    <div key={`node-${step.skill}-${index}`} className="flex items-start" style={{ gap: 0 }}>
                      {/* Node + label */}
                      <div className="flex flex-col items-center" style={{ width: 96 }}>

                        {/* Node circle */}
                        <div className="relative flex items-center justify-center" style={{ height: 52 }}>
                          {/* Outer glow ring for current */}
                          {isCurrent && (
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-400/40 animate-ping" style={{ animationDuration: '2s' }} />
                          )}
                          <div className={`relative z-10 flex items-center justify-center rounded-full font-black text-sm border-2 shadow-lg transition-all duration-300 ${
                            isDone
                              ? 'w-12 h-12 bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-500/30'
                              : isCurrent
                              ? 'w-12 h-12 bg-indigo-500/25 border-indigo-400 text-indigo-200 shadow-indigo-500/40'
                              : 'w-10 h-10 bg-white/4 border-white/15 text-slate-500'
                          }`}>
                            {isDone ? (
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <polyline points="3.5,9 7,12.5 14.5,5.5" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <span className={isCurrent ? 'text-indigo-200' : 'text-slate-500'}>{index + 1}</span>
                            )}
                          </div>
                        </div>

                        {/* Difficulty dot + label */}
                        <div className="flex flex-col items-center mt-2 px-1 text-center" style={{ maxWidth: 90 }}>
                          <span
                            className={`text-[11px] font-black leading-tight ${
                              isDone ? 'text-emerald-300' : isCurrent ? 'text-white' : 'text-slate-500'
                            }`}
                            style={{ wordBreak: 'break-word', lineHeight: 1.3 }}
                          >
                            {step.skill}
                          </span>
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isFuture ? '#334155' : diffColor }} />
                            <span className={`text-[9px] uppercase tracking-wider font-bold ${
                              isFuture ? 'text-slate-600' : 'text-slate-400'
                            }`}>{step.difficulty || 'Beginner'}</span>
                          </div>
                          {step.start_week && (
                            <span className={`text-[9px] mt-0.5 ${
                              isDone ? 'text-emerald-600' : isCurrent ? 'text-indigo-400' : 'text-slate-700'
                            }`}>Wk {step.start_week}–{step.end_week}</span>
                          )}
                        </div>
                      </div>

                      {/* Connector between nodes */}
                      {!isLast && (
                        <div className="flex items-center" style={{ height: 52, paddingTop: 0 }}>
                          <div className="relative flex items-center" style={{ width: 32 }}>
                            {/* Track */}
                            <div className="w-full h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                            {/* Fill */}
                            {isDone && (
                              <div className="absolute inset-y-0 left-0 w-full rounded-full" style={{
                                background: 'linear-gradient(90deg, #34d399, #6366f1)',
                              }} />
                            )}
                            {/* Arrow head */}
                            <svg className="absolute -right-1 shrink-0" width="8" height="8" viewBox="0 0 8 8">
                              <polyline
                                points="1,1 7,4 1,7"
                                fill="none"
                                stroke={isDone ? '#6366f1' : 'rgba(255,255,255,0.12)'}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-400" />
                <span className="text-[10px] text-slate-500 font-medium">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-500/30 border border-indigo-400" />
                <span className="text-[10px] text-slate-500 font-medium">Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/5 border border-white/15" />
                <span className="text-[10px] text-slate-500 font-medium">Upcoming</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[10px] text-slate-600">Scroll to see all steps →</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Progress Card ────────────────────────────────────────── */}
      <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-slate-300 font-medium">{stats.completed} <span className="text-slate-500">Completed</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              <span className="text-slate-300 font-medium">{stats.pending} <span className="text-slate-500">Remaining</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white tracking-tight">{stats.progress}<span className="text-sm text-slate-400 font-medium">%</span></span>
          </div>
        </div>

        {/* Bar */}
        <div className="h-3 bg-white/5 rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full relative overflow-hidden progress-shimmer"
            style={{
              width: `${stats.progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #38bdf8)',
              transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        </div>

        {/* Step labels */}
        <div className="flex justify-between mt-2 px-0.5">
          <span className="text-[10px] text-slate-600">Start</span>
          <span className="text-[10px] text-slate-600">{skills.length} Steps Total</span>
        </div>
      </div>

      {/* ── Vertical Timeline ────────────────────────────────────── */}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-violet-500/20 to-transparent" />

        <div className="space-y-4">
          {skills.map((step, index) => {
            const isCompleted   = step.status === 'completed';
            const isUpdating    = updatingSkill === step.skill;
            const diffKey       = (step.difficulty || 'beginner').toLowerCase();
            const diff          = DIFFICULTY[diffKey] || DIFFICULTY.beginner;
            const isActive      = roadmapData.status === 'active';

            return (
              <div key={`${step.skill}-${index}`} className="relative flex gap-4 pl-0">

                {/* Step circle indicator */}
                <div className="relative z-10 shrink-0" style={{ width: 56 }}>
                  <div className={`w-[54px] h-[54px] rounded-full flex flex-col items-center justify-center border-2 shadow-lg text-xs font-black transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-emerald-500/20'
                      : 'bg-[#0c0f1e] border-indigo-500/30 text-indigo-300 shadow-indigo-500/10'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 size={22} className="text-emerald-400" />
                    ) : (
                      <>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none">Step</span>
                        <span className="text-base leading-tight">{index + 1}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card */}
                <div className={`step-card flex-1 backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border shadow-2xl p-5 ${
                  isCompleted ? 'done border-emerald-500/15' : 'pending border-white/5'
                }`}>

                  {/* Top row */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

                    {/* Left: title + meta */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-1">Step {index + 1}</p>

                      <h3 className={`text-lg font-black tracking-tight leading-tight mb-2 ${
                        isCompleted ? 'text-emerald-300 line-through decoration-emerald-500/40' : 'text-white'
                      }`}>
                        {step.skill}
                      </h3>

                      {/* Meta chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        {step.category && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-[11px] text-slate-400 font-medium">
                            <BookOpen size={10} className="text-indigo-400" />
                            {step.category}
                          </span>
                        )}
                        {step.start_week && step.end_week && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-400 font-medium">
                            <Calendar size={10} />
                            Week {step.start_week}–{step.end_week}
                          </span>
                        )}
                        {step.hours_allocated != null && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-400 font-medium">
                            <Clock size={10} />
                            {step.hours_allocated} hrs
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: difficulty + action */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border ${diff.cls}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: diff.dot }} />
                        {step.difficulty || 'Beginner'}
                      </span>

                      <button
                        type="button"
                        onClick={() => onMarkCompleted(step.skill)}
                        disabled={isUpdating || isCompleted || !isActive}
                        className={`mark-btn px-4 py-1.5 rounded-xl text-xs font-black border transition-all duration-200 ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 cursor-default'
                            : isUpdating
                            ? 'bg-slate-800 text-slate-500 border-white/5 cursor-wait'
                            : !isActive
                            ? 'bg-white/5 text-slate-600 border-white/5 cursor-not-allowed'
                            : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 cursor-pointer'
                        }`}
                      >
                        {isUpdating ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 size={11} className="animate-spin" /> Saving…
                          </span>
                        ) : isCompleted ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={11} /> Done
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Zap size={11} /> Mark Complete
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Resources */}
                  {(step.resources || []).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-2">Resources</p>
                      <div className="flex flex-wrap gap-2">
                        {(step.resources || []).map((resource, idx) => (
                          <a
                            key={`${resource.title || 'r'}-${idx}`}
                            href={resource.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="resource-pill inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-slate-400 font-medium"
                          >
                            <LinkIcon size={10} className="text-indigo-400 shrink-0" />
                            {resource.title || 'Resource'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default RoadmapTimeline;
