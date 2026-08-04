import React, { useMemo, useState } from 'react';
import {
  Card, CardHeader, CardFooterNote, Input, Badge, MicroLabel, Loading, Empty,
} from '../../../design';

/**
 * Saved roadmaps, as a table-style list.
 *
 * §7 has no history screen, so this follows the Table pattern from §5: a search
 * field in the header strip, rows separated by line-soft, a mono date on the
 * right, and a footer count line.
 */
const HistorySidebar = ({ history = [], selectedRoadmapId, onSelectRoadmap, isLoading }) => {
  const [query, setQuery] = useState('');

  const filteredHistory = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return history;
    return history.filter((item) =>
      String(item.target_role || '').toLowerCase().includes(term)
      || String(item.roadmap_id || '').toLowerCase().includes(term)
    );
  }, [history, query]);

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
          const isActive = selectedRoadmapId === item.roadmap_id;
          return (
            <div
              key={item.roadmap_id || i}
              onClick={() => onSelectRoadmap?.(item.roadmap_id)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 16,
                alignItems: 'center',
                padding: '15px 20px',
                borderBottom: i === filteredHistory.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
                background: isActive ? 'var(--color-surface-active)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 120ms ease',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: isActive ? 600 : 400, color: 'var(--color-ink)' }}>
                {item.target_role || 'Roadmap'}
              </span>

              {isActive ? <Badge tone="green">ACTIVE</Badge> : <span />}

              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-text-4)', textAlign: 'right' }}>
                {item.metadata?.generated_at || item.createdAt
                  ? new Date(item.metadata?.generated_at || item.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })
                  : '—'}
              </span>
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
