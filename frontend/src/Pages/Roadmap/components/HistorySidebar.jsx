import React, { useMemo, useState } from 'react';

const HistorySkeleton = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatRoadmapName = (item, index) => {
  const role = String(item?.target_role || '').trim();
  if (role) {
    return `${role} Roadmap`;
  }

  return `Roadmap ${index + 1}`;
};

const HistorySidebar = ({
  history,
  selectedRoadmapId,
  onSelectRoadmap,
  isLoading,
}) => {
  const [query, setQuery] = useState('');

  const filteredHistory = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return history;
    return history.filter((item) =>
      String(item.roadmap_id || '').toLowerCase().includes(term)
    );
  }, [history, query]);

  return (
    <aside className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-3.5 h-fit lg:sticky lg:top-28">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-white text-base font-semibold">Roadmap History</h3>
        <span className="text-[11px] text-gray-400">{history.length}</span>
      </div>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search roadmap"
        className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {isLoading ? (
        <HistorySkeleton />
      ) : history.length === 0 ? (
        <p className="text-sm text-gray-400">No history available.</p>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {filteredHistory.map((item, index) => {
            const isActive = selectedRoadmapId === item.roadmap_id;
            return (
              <button
                key={item.roadmap_id}
                onClick={() => onSelectRoadmap(item.roadmap_id)}
                className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors ${isActive ? 'bg-indigo-500/20 border-indigo-400/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <p className="text-xs font-semibold text-white truncate">{formatRoadmapName(item, index)}</p>
                <p className="text-[11px] text-gray-400 mt-1">{formatDate(item.metadata?.generated_at || item.createdAt)}</p>
              </button>
            );
          })}

          {filteredHistory.length === 0 && (
            <p className="text-xs text-gray-400 px-1 py-2">No matching roadmap found.</p>
          )}
        </div>
      )}
    </aside>
  );
};

export default HistorySidebar;
