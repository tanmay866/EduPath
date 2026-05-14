import React, { useMemo, useState } from 'react';
import { Search, Clock, CheckCircle2, Map } from 'lucide-react';

const HistorySkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-4">
        <div className="h-3 bg-white/8 rounded-full w-2/3 mb-3" />
        <div className="h-2.5 bg-white/5 rounded-full w-1/2" />
      </div>
    ))}
  </div>
);

const formatDate = value => {
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
    return history.filter(item =>
      String(item.roadmap_id || '').toLowerCase().includes(term) ||
      String(item.target_role || '').toLowerCase().includes(term)
    );
  }, [history, query]);

  return (
    <>
      <style>{`
        .history-item {
          transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }
        .history-item:not(.active):hover {
          border-color: rgba(99,102,241,0.25) !important;
          background: rgba(99,102,241,0.05) !important;
          transform: translateX(3px);
        }
        .history-item.active {
          border-color: rgba(99,102,241,0.4) !important;
          background: rgba(99,102,241,0.1) !important;
          box-shadow: 0 0 24px -8px rgba(99,102,241,0.25);
        }
        .search-input:focus {
          border-color: rgba(99,102,241,0.4) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
      `}</style>

      <aside className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-5 lg:sticky lg:top-28">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Clock size={13} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Roadmap History</h3>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-500 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">
            {history.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search roadmaps…"
            className="search-input w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/8 text-white text-xs placeholder-slate-700 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <HistorySkeleton />
        ) : history.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-3">
              <Map size={18} className="text-slate-600" />
            </div>
            <p className="text-slate-500 text-xs font-semibold">No saved roadmaps yet.</p>
            <p className="text-slate-700 text-[11px] mt-1">Generate one to get started.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
            {filteredHistory.map((item, index) => {
              const isActive = selectedRoadmapId === item.roadmap_id;
              return (
                <button
                  key={item.roadmap_id}
                  onClick={() => onSelectRoadmap(item.roadmap_id)}
                  className={`history-item ${isActive ? 'active' : ''} w-full text-left rounded-2xl px-4 py-3.5 border border-white/5 bg-[#0a0a0a]`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-black text-white truncate leading-snug">
                      {formatRoadmapName(item, index)}
                    </p>
                    {isActive && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={8} /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1.5 font-medium">
                    {formatDate(item.metadata?.generated_at || item.createdAt)}
                  </p>
                </button>
              );
            })}

            {filteredHistory.length === 0 && (
              <p className="text-xs text-slate-600 px-2 py-5 text-center">No matching roadmap found.</p>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default HistorySidebar;
