import React, { useMemo, useState } from 'react';
import {
  Card, CardHeader, CardFooterNote, Input, Badge, MicroLabel, Loading, Empty, Button,
} from '../../../design';

/**
 * Saved roadmaps, as a table-style list.
 *
 * §7 has no history screen, so this follows the Table pattern from §5: a search
 * field in the header strip, rows separated by line-soft, a mono date on the
 * right, and a footer count line.
 *
 * Regenerating keeps the old plan every time, so this list fills with
 * near-identical entries — thirteen rows reading "AI/ML Engineer" and a date
 * is not a list anyone can act on, least of all to decide which to throw away.
 * Each row therefore says how long the plan was and how much of it was
 * finished, and deletion states what is about to be lost before it happens.
 */
const progressLine = (progress) => {
  if (!progress || progress.isEmpty) return 'nothing ticked';
  const parts = [];
  if (progress.ticks) parts.push(`${progress.ticks} ${progress.ticks === 1 ? 'task' : 'tasks'}`);
  if (progress.skillsDone) parts.push(`${progress.skillsDone} ${progress.skillsDone === 1 ? 'skill' : 'skills'}`);
  return `${parts.join(', ')} done`;
};

const HistorySidebar = ({
  history = [],
  selectedRoadmapId,
  onSelectRoadmap,
  onDeleteRoadmap,
  isLoading,
}) => {
  const [query, setQuery] = useState('');
  // Which row is asking to be confirmed. Deleting is permanent, so it takes a
  // second deliberate click — and inline, because a plan's worth of progress
  // is too much to describe in a browser dialog.
  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const filteredHistory = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return history;
    return history.filter((item) =>
      String(item.target_role || '').toLowerCase().includes(term)
      || String(item.roadmap_id || '').toLowerCase().includes(term)
    );
  }, [history, query]);

  const remove = async (item) => {
    setDeletingId(item.roadmap_id);
    try {
      await onDeleteRoadmap?.(item);
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  };

  return (
    <Card>
      <CardHeader
        label="Roadmap history"
        right={
          <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
            {`${history.length} SAVED`}
          </MicroLabel>
        }
      />

      <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--color-line)' }}>
        <Input
          admin
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search roadmaps"
          style={{ padding: '9px 12px', fontSize: 14 }}
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : history.length === 0 ? (
        <Empty>Roadmaps you generate will be listed here.</Empty>
      ) : filteredHistory.length === 0 ? (
        <Empty>No roadmap matches that search.</Empty>
      ) : (
        filteredHistory.map((item, i) => {
          const isOpen = selectedRoadmapId === item.roadmap_id;
          // The badge used to follow whichever row was open, so it said ACTIVE
          // about a superseded plan the moment one was clicked. It now means
          // what it says: the plan the product is working from.
          const isCurrent = Boolean(item.is_current);
          const confirming = confirmingId === item.roadmap_id;
          const busy = deletingId === item.roadmap_id;

          return (
            <div
              key={item.roadmap_id || i}
              style={{
                padding: '14px 20px',
                borderBottom: i === filteredHistory.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
                background: isOpen ? 'var(--color-surface-active)' : 'transparent',
                transition: 'background-color 120ms ease',
              }}
            >
              <div
                onClick={() => onSelectRoadmap?.(item.roadmap_id)}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: isOpen ? 600 : 400, color: 'var(--color-ink)' }}>
                    {item.target_role || 'Roadmap'}
                  </span>
                  {isCurrent && <Badge tone="green">current</Badge>}
                </div>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-text-4)' }}>
                  {item.metadata?.generated_at || item.createdAt
                    ? new Date(item.metadata?.generated_at || item.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })
                    : '—'}
                </span>
              </div>

              {/* What tells two same-day plans for the same track apart. */}
              <div style={{ fontSize: 13.5, color: 'var(--color-text-3)', marginTop: 3 }}>
                {[
                  item.week_count ? `${item.week_count} weeks` : null,
                  item.skill_count ? `${item.skill_count} skills` : null,
                  progressLine(item.progress),
                ].filter(Boolean).join(' · ')}
              </div>

              {confirming ? (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 13.5, color: 'var(--color-clay)', margin: '0 0 8px', lineHeight: 1.5 }}>
                    {item.progress && !item.progress.isEmpty
                      ? `Deleting this also deletes ${progressLine(item.progress)}. This cannot be undone.`
                      : 'Delete this roadmap? This cannot be undone.'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Button
                      variant="destructive"
                      style={{ padding: '7px 14px', fontSize: 13.5 }}
                      disabled={busy}
                      onClick={() => remove(item)}
                    >
                      {busy ? 'Deleting…' : 'Delete permanently'}
                    </Button>
                    <Button
                      variant="quiet"
                      onClick={() => setConfirmingId(null)}
                      disabled={busy}
                    >
                      Keep it
                    </Button>
                  </div>
                </div>
              ) : item.can_delete ? (
                <Button
                  variant="quiet"
                  style={{ marginTop: 8 }}
                  onClick={() => setConfirmingId(item.roadmap_id)}
                >
                  Delete
                </Button>
              ) : (
                // Not offered rather than offered and refused: the reason it
                // cannot go is also the way to make it deletable.
                <div style={{ fontSize: 13, color: 'var(--color-text-4)', marginTop: 8 }}>
                  The plan you are working from. Generate a new one to retire it.
                </div>
              )}
            </div>
          );
        })
      )}

      {history.length > 0 && (
        <CardFooterNote>
          {query.trim()
            ? `Showing ${filteredHistory.length} of ${history.length}.`
            : `${history.length} roadmap${history.length === 1 ? '' : 's'} saved. Click one to open it.`}
        </CardFooterNote>
      )}
    </Card>
  );
};

export default HistorySidebar;
