import React, { useMemo } from 'react';
import { CheckCircle2, Circle, Loader2, Link as LinkIcon } from 'lucide-react';

const difficultyStyles = {
  beginner: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  intermediate: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  advanced: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
};

const RoadmapTimeline = ({
  roadmapData,
  isRoadmapLoading,
  updatingSkill,
  onMarkCompleted,
}) => {
  const skills = roadmapData?.skills || [];
  const hasRoadmap = Boolean(skills.length > 0);

  const stats = useMemo(() => {
    const completed = skills.filter((item) => item.status === 'completed').length;
    const pending = skills.filter((item) => item.status !== 'completed').length;
    const progress = skills.length ? Math.round((completed / skills.length) * 100) : 0;
    return { completed, pending, progress };
  }, [skills]);

  const roadmapPath = useMemo(() => {
    return skills
      .map((item) => item?.skill)
      .filter(Boolean);
  }, [skills]);

  if (isRoadmapLoading) {
    return (
      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-10 text-center text-gray-300">
        <Loader2 size={28} className="mx-auto mb-3 animate-spin text-indigo-300" />
        Loading roadmap...
      </div>
    );
  }

  if (!hasRoadmap) {
    return (
      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-10 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Fill the details and generate your roadmap</h2>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {roadmapPath.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Roadmap Path</p>
          <div className="flex flex-wrap items-center gap-2 text-sm md:text-base text-white/95 font-medium">
            {roadmapPath.map((skill, index) => (
              <React.Fragment key={`${skill}-${index}`}>
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">{skill}</span>
                {index < roadmapPath.length - 1 ? <span className="text-indigo-300">→</span> : null}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span>{stats.completed} Completed • {stats.pending} Pending</span>
          <span>{stats.progress}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-linear-to-r from-indigo-500 to-purple-500" style={{ width: `${stats.progress}%` }} />
        </div>
      </div>

      <div className="space-y-2.5">
        {skills.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const difficultyKey = (step.difficulty || 'beginner').toLowerCase();
          const difficultyClass = difficultyStyles[difficultyKey] || difficultyStyles.beginner;

          return (
            <div
              key={`${step.skill}-${index}`}
              className="rounded-xl border border-white/10 bg-slate-900/60 p-3.5"
            >
              <div className="flex gap-3">
                <div className="pt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-300" />
                  ) : (
                    <Circle size={16} className="text-indigo-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">Step {index + 1}</p>
                      <h3 className="text-base font-semibold text-white truncate mt-0.5">{step.skill}</h3>
                      <p className="text-xs text-gray-300 mt-0.5">{step.category || 'General'} • Week {step.start_week}-{step.end_week} • {step.hours_allocated ?? 0} hrs</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${difficultyClass}`}>
                        {step.difficulty || 'beginner'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onMarkCompleted(step.skill)}
                        disabled={updatingSkill === step.skill || isCompleted || roadmapData.status !== 'active'}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-white transition-colors"
                      >
                        {updatingSkill === step.skill ? 'Updating...' : isCompleted ? 'Completed' : 'Follow the Plan'}
                      </button>
                    </div>
                  </div>

                  {(step.resources || []).length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {(step.resources || []).map((resource, idx) => (
                        <a
                          key={`${resource.title || 'resource'}-${idx}`}
                          href={resource.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-gray-200 hover:bg-white/10"
                        >
                          {resource.title || 'Resource'}
                          <LinkIcon size={11} />
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
