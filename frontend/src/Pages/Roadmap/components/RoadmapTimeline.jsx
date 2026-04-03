import React, { useMemo } from 'react';
import { CheckCircle2, Circle, Loader2, Link as LinkIcon, Map } from 'lucide-react';

const difficultyStyles = {
  beginner: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  intermediate: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  advanced: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
};

const RoadmapTimeline = ({ roadmapData, isRoadmapLoading, updatingSkill, onMarkCompleted }) => {
  const skills = roadmapData?.skills || [];
  const hasRoadmap = Boolean(skills.length > 0);

  const stats = useMemo(() => {
    const completed = skills.filter((item) => item.status === 'completed').length;
    const pending = skills.filter((item) => item.status !== 'completed').length;
    const progress = skills.length ? Math.round((completed / skills.length) * 100) : 0;
    return { completed, pending, progress };
  }, [skills]);

  const roadmapPath = useMemo(() => skills.map((item) => item?.skill).filter(Boolean), [skills]);

  if (isRoadmapLoading) {
    return (
      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-3xl p-14 text-center">
        <Loader2 size={32} className="mx-auto mb-4 animate-spin text-indigo-400" />
        <p className="text-slate-400 text-sm">Loading your roadmap…</p>
      </div>
    );
  }

  if (!hasRoadmap) {
    return (
      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-3xl p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
          <Map size={28} className="text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No roadmap selected</h2>
        <p className="text-slate-500 text-sm">Select a roadmap from the sidebar or generate a new one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Roadmap path strip */}
      {roadmapPath.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">Learning Path</p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/90 font-medium">
            {roadmapPath.map((skill, index) => (
              <React.Fragment key={`${skill}-${index}`}>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">{skill}</span>
                {index < roadmapPath.length - 1 && (
                  <span className="text-indigo-400 text-xs">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Progress card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4">
        <div className="flex items-center justify-between text-sm text-slate-300 mb-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {stats.completed} Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {stats.pending} Remaining
            </span>
          </div>
          <span className="text-indigo-300 font-bold">{stats.progress}%</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>

      {/* Skills list */}
      <div className="space-y-3">
        {skills.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const difficultyKey = (step.difficulty || 'beginner').toLowerCase();
          const difficultyClass = difficultyStyles[difficultyKey] || difficultyStyles.beginner;

          return (
            <div
              key={`${step.skill}-${index}`}
              className={`rounded-2xl border transition-all duration-300 ${
                isCompleted
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-white/10 bg-white/4 hover:border-indigo-500/30 hover:bg-indigo-500/5'
              } p-5`}
            >
              <div className="flex gap-4">
                {/* Status icon */}
                <div className="pt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : (
                    <Circle size={20} className="text-indigo-400/60" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Step {index + 1}</p>
                      <h3 className={`text-base font-bold truncate ${isCompleted ? 'text-emerald-300 line-through decoration-emerald-500/40' : 'text-white'}`}>
                        {step.skill}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {step.category || 'General'}
                        {step.start_week && step.end_week && (
                          <> · <span className="text-indigo-400/80">Week {step.start_week}–{step.end_week}</span></>
                        )}
                        {step.hours_allocated != null && (
                          <> · {step.hours_allocated} hrs</>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${difficultyClass}`}>
                        {step.difficulty || 'Beginner'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onMarkCompleted(step.skill)}
                        disabled={updatingSkill === step.skill || isCompleted || roadmapData.status !== 'active'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 cursor-default'
                            : updatingSkill === step.skill
                            ? 'bg-slate-700 text-slate-400 cursor-wait'
                            : 'bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-400/60 hover:text-white cursor-pointer'
                        }`}
                      >
                        {updatingSkill === step.skill ? 'Updating…' : isCompleted ? '✓ Done' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>

                  {/* Resources */}
                  {(step.resources || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(step.resources || []).map((resource, idx) => (
                        <a
                          key={`${resource.title || 'resource'}-${idx}`}
                          href={resource.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 hover:bg-white/10 hover:border-white/25 px-3 py-1 text-[11px] text-slate-300 transition-all duration-200"
                        >
                          {resource.title || 'Resource'}
                          <LinkIcon size={10} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapTimeline;
