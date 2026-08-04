import React from 'react';
import {
  Card, CardHeader, CardFooterNote, Button, MicroLabel, StatusBox, LabelledBar, Loading, Empty,
} from '../../../design';

/**
 * Spec §7 Roadmap.
 *
 * Left: one row per node — status box, title, mono status tag, mono week label.
 * Done drops the title to text-2 and the tag to text-4; the current node takes
 * surface-current with a 600 title and an amber tag.
 * Right: the current focus card, then a gap report of bars by category.
 *
 * The old skeleton shimmer is gone — §5 asks for card chrome plus a mono
 * LOADING label instead.
 */
const RoadmapTimeline = ({ roadmapData, isRoadmapLoading, updatingSkill, onMarkCompleted }) => {
  const skills = roadmapData?.skills || [];

  if (isRoadmapLoading) {
    return <Card><Loading /></Card>;
  }

  if (skills.length === 0) {
    return (
      <Card>
        <Empty>Generate a roadmap and its skills will appear here, in the order to learn them.</Empty>
      </Card>
    );
  }

  const completed = skills.filter((s) => s.status === 'completed').length;
  const pct = skills.length ? Math.round((completed / skills.length) * 100) : 0;

  // The first node that is not done is "current"; everything after it is future.
  const currentIndex = skills.findIndex((s) => s.status !== 'completed');
  const currentSkill = currentIndex >= 0 ? skills[currentIndex] : null;

  const byCategory = skills.reduce((acc, s) => {
    const key = s.category || 'Other';
    if (!acc[key]) acc[key] = { total: 0, done: 0 };
    acc[key].total += 1;
    if (s.status === 'completed') acc[key].done += 1;
    return acc;
  }, {});

  const gapReport = Object.entries(byCategory).slice(0, 4).map(([label, v]) => ({
    label,
    value: Math.round((v.done / v.total) * 100),
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 22, alignItems: 'start' }}>
      <Card>
        <CardHeader
          label="Learning path"
          right={
            <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
              {`${completed} / ${skills.length} DONE`}
            </MicroLabel>
          }
        />

        {skills.map((step, i) => {
          const isDone = step.status === 'completed';
          const isCurrent = i === currentIndex;
          const busy = updatingSkill === step.skill;

          return (
            <div
              key={step.skill || i}
              onClick={() => !busy && !isDone && onMarkCompleted?.(step.skill)}
              style={{
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                borderBottom: i === skills.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
                background: isCurrent ? 'var(--color-surface-current)' : 'transparent',
                cursor: busy ? 'wait' : isDone ? 'default' : 'pointer',
                transition: 'background-color 120ms ease',
              }}
            >
              <StatusBox status={isDone ? 'done' : isCurrent ? 'current' : 'future'} />

              <span
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: isCurrent ? 600 : 400,
                  color: isDone ? 'var(--color-text-2)' : 'var(--color-ink)',
                }}
              >
                {step.skill}
              </span>

              <MicroLabel
                size={11}
                tracking="0.1em"
                color={isDone ? 'var(--color-text-4)' : isCurrent ? 'var(--color-amber)' : 'var(--color-text-3)'}
              >
                {busy ? 'Saving' : isDone ? 'Done' : isCurrent ? 'In progress' : 'Planned'}
              </MicroLabel>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  color: 'var(--color-text-4)',
                  width: 34,
                  textAlign: 'right',
                }}
              >
                {step.start_week ? `W${step.start_week}` : '—'}
              </span>
            </div>
          );
        })}

        <CardFooterNote>Click a row to mark that skill complete.</CardFooterNote>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Card>
          <CardHeader label="Current focus" />
          <div style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
              {currentSkill ? currentSkill.skill : 'Everything is complete'}
            </div>
            <p style={{ fontSize: 14.5, color: 'var(--color-text-2)', margin: '8px 0 18px', lineHeight: 1.55 }}>
              {currentSkill
                ? currentSkill.mini_project?.title || `Part of ${currentSkill.category || 'your track'}.`
                : 'Every skill on this roadmap is marked done.'}
            </p>

            <div style={{ borderTop: '1px solid var(--color-line-soft)' }}>
              {[
                { label: 'Progress', value: `${pct}%`, amber: false },
                { label: 'Weeks planned', value: roadmapData?.duration || '—', amber: false },
                { label: 'Remaining', value: skills.length - completed, amber: skills.length - completed > 0 },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '11px 0',
                    borderBottom: '1px solid var(--color-line-soft)',
                    fontSize: 14,
                    color: 'var(--color-text-2)',
                  }}
                >
                  <span>{row.label}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      color: row.amber ? 'var(--color-amber)' : 'var(--color-ink)',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {currentSkill && (
              <Button
                fullWidth
                style={{ marginTop: 20 }}
                onClick={() => onMarkCompleted?.(currentSkill.skill)}
                loading={updatingSkill === currentSkill.skill}
                loadingLabel="Saving…"
              >
                Mark done
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader label="Gap report" />
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {gapReport.map((g) => (
              <LabelledBar
                key={g.label}
                label={g.label}
                value={g.value}
                display={`${g.value}%`}
                max={100}
                tone={g.value >= 70 ? 'green' : g.value >= 35 ? 'amber' : 'clay'}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoadmapTimeline;
