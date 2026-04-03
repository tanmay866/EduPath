import React, { useMemo, useState } from 'react';
import { Search, Clock } from 'lucide-react';

const HistorySkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3, 4].map((item) => (
      <div key={item} className="rounded-xl border border-white/8 bg-white/4 p-4">
        <div className="h-3 bg-white/10 rounded w-2/3 mb-2.5" />
        <div className="h-3 bg-white/8 rounded w-1/2" />
      </div>
    ))}
  </div>
);

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatRoadmapName = (item, index) => {
  const role = String(item?.target_role || '').trim();
  return role ? `${role} Roadmap` : `Roadmap ${index + 1}`;
};

const HistorySidebar = ({ history, selectedRoadmapId, onSelectRoadmap, isLoading }) => {
  const [query, setQuery] = useState('');

  const filteredHistory = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return history;
    return history.filter((item) =>
      String(item.roadmap_id || '').toLowerCase().includes(term) ||
      String(item.target_role || '').toLowerCase().includes(term)
    );
  }, [history, query]);

  return (
    <aside className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-3xl p-5 h-fit lg:sticky lg:top-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-400/25 flex items-center justify-center">
            <Clock size={12} className="text-indigo-400" />
          </div>
          <h3 className="text-white text-sm font-bold">Roadmap History</h3>
        </div>
        <span className="text-xs text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
          {history.length}
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search roadmaps…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all duration-200"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <HistorySkeleton />
      ) : history.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">No saved roadmaps yet.</p>
          <p className="text-slate-600 text-xs mt-1">Generate one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[26rem] overflow-y-auto pr-1 custom-scrollbar">
          {filteredHistory.map((item, index) => {
            const isActive = selectedRoadmapId === item.roadmap_id;
            return (
              <button
                key={item.roadmap_id}
                onClick={() => onSelectRoadmap(item.roadmap_id)}
                className={`w-full text-left rounded-xl px-4 py-3 border transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/15 border-indigo-400/40 shadow-sm shadow-indigo-500/10'
                    : 'bg-white/4 border-white/8 hover:bg-white/8 hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-white truncate leading-snug">
                    {formatRoadmapName(item, index)}
                  </p>
                  {isActive && (
                    <span className="shrink-0 text-[10px] font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-400/30 px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {formatDate(item.metadata?.generated_at || item.createdAt)}
                </p>
              </button>
            );
          })}

          {filteredHistory.length === 0 && (
            <p className="text-xs text-slate-500 px-2 py-4 text-center">No matching roadmap found.</p>
          )}
        </div>
      )}
    </aside>
  );
};

export default HistorySidebar;
