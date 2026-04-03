import React from 'react';
import { CheckCircle2, Circle, Link as LinkIcon, Clock3, Layers } from 'lucide-react';

const difficultyStyles = {
  beginner: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  intermediate: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  advanced: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
};

const formatDifficulty = (value) => {
  if (!value) return 'Beginner';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const RoadmapCard = ({
  step,
  index,
  isLast,
  onMarkCompleted,
  isUpdating,
  canUpdateStatus,
}) => {
  const isCompleted = step.status === 'completed';
  const difficultyKey = (step.difficulty || 'beginner').toLowerCase();
  const difficultyClass = difficultyStyles[difficultyKey] || difficultyStyles.beginner;
  const videoResources = (step.resources || []).filter((resource) => {
    const url = String(resource?.url || '').toLowerCase();
    return url.includes('youtube.com') || url.includes('youtu.be');
  });

  return (
    <div className="relative pl-10">
      {!isLast && (
        <div className="absolute left-4.5 top-9 bottom-0 w-px bg-white/10" aria-hidden="true" />
      )}

      <div className="absolute left-0 top-1.5 z-10">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isCompleted ? 'bg-emerald-500/20 border-emerald-400/50' : 'bg-white/5 border-white/20'}`}>
          {isCompleted ? (
            <CheckCircle2 size={16} className="text-emerald-300" />
          ) : (
            <Circle size={14} className="text-gray-400" />
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg transition-all hover:-translate-y-0.5 hover:border-indigo-400/30 hover:shadow-indigo-500/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2.5">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Step {index + 1}</p>
            <h3 className="text-lg font-semibold text-white mt-1">{step.skill}</h3>
            <p className="text-xs text-gray-300 mt-1">{step.category || 'General'}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${difficultyClass}`}>
              {formatDifficulty(step.difficulty)}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${isCompleted ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-gray-500/15 text-gray-300 border-gray-500/30'}`}>
              {step.status || 'pending'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
            <p className="text-xs text-gray-400">Duration</p>
            <p className="text-xs text-white mt-1">Week {step.start_week} to {step.end_week}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
            <p className="text-xs text-gray-400">Hours Allocated</p>
            <p className="text-xs text-white mt-1 flex items-center gap-1.5">
              <Clock3 size={14} className="text-indigo-300" />
              {step.hours_allocated ?? 0} hrs
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 sm:col-span-2 lg:col-span-1">
            <p className="text-xs text-gray-400">Dependencies</p>
            <p className="text-xs text-white mt-1 flex items-center gap-1.5">
              <Layers size={14} className="text-indigo-300" />
              {step.dependencies && step.dependencies.length > 0 ? step.dependencies.join(', ') : 'None'}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">Resources</h4>
          {step.resources && step.resources.length > 0 ? (
            <ul className="space-y-1.5">
              {step.resources.map((resource, resourceIndex) => (
                <li key={`${resource.title || 'resource'}-${resourceIndex}`} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 hover:border-indigo-400/30 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{resource.title || 'Untitled resource'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide">{resource.type || 'resource'}</p>
                    </div>
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-300 hover:text-indigo-200 text-xs inline-flex items-center gap-1 shrink-0"
                      >
                        Open <LinkIcon size={14} />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500">No link</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-gray-400">No resources available.</div>
          )}
        </div>

        <div className="mt-3">
          <h4 className="text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">Videos</h4>
          {videoResources.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {videoResources.map((resource, resourceIndex) => (
                <a
                  key={`video-${resource.title || 'resource'}-${resourceIndex}`}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200 hover:border-red-300/60 hover:text-red-100 transition-colors"
                >
                  Watch {resource.title || 'Video'}
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-gray-400">No videos available.</div>
          )}
        </div>

        {step.mini_project?.title && (
          <div className="mt-3 bg-indigo-500/10 border border-indigo-400/20 rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-wide text-indigo-200">Mini Project</p>
            <p className="text-sm text-white font-semibold mt-1">{step.mini_project.title}</p>
            {step.mini_project.description ? (
              <p className="text-xs text-gray-300 mt-1">{step.mini_project.description}</p>
            ) : null}
          </div>
        )}

        <div className="mt-3">
          <button
            type="button"
            onClick={() => onMarkCompleted(step.skill)}
            disabled={isUpdating || isCompleted || !canUpdateStatus}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-white transition-colors"
          >
            {isUpdating ? 'Updating...' : isCompleted ? 'Completed' : 'Follow the Plan'}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default RoadmapCard;
