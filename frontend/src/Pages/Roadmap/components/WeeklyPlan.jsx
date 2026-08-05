import React, { useState } from 'react';
import { Card, CardHeader, CardFooterNote, MicroLabel, StatusBox } from '../../../design';

/**
 * The week-by-week schedule the AI service produces alongside the skill list.
 *
 * It was generated and stored on every roadmap from the start but never read —
 * the page showed the skills and threw the schedule away, so the tasks, hours
 * and mini projects the model had already worked out were invisible.
 *
 * A week's state is derived from whether its skills are actually complete
 * rather than from the stored `status` field: nothing maintains that field, so
 * trusting it would show every week as pending forever.
 */
const WeeklyPlan = ({ weeks = [], skills = [] }) => {
  const [open, setOpen] = useState(null);

  // Roadmaps generated before this was surfaced may have no weekly plan.
  if (!weeks.length) return null;

  const doneSkills = new Set(
    skills.filter((s) => s.status === 'completed').map((s) => s.skill)
  );

  const isWeekDone = (week) =>
    (week.skills || []).length > 0 && week.skills.every((s) => doneSkills.has(s));

  const currentWeek = weeks.find((w) => !isWeekDone(w))?.week_number ?? null;
  const doneCount = weeks.filter(isWeekDone).length;

  return (
    <Card>
      <CardHeader
        label="Plan by week"
        right={
          <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
            {`${doneCount} / ${weeks.length} WEEKS DONE`}
          </MicroLabel>
        }
      />

      {weeks.map((week, i) => {
        const done = isWeekDone(week);
        const current = week.week_number === currentWeek;
        const statusKey = done ? 'done' : current ? 'current' : 'future';
        const isOpen = open === week.week_number;
        const tasks = week.tasks || [];
        const covers = (week.skills || []).join(', ');

        return (
          <div
            key={week.week_number ?? i}
            style={{
              borderLeft: `3px solid ${done ? 'var(--color-green)' : current ? 'var(--color-amber)' : 'var(--color-line)'}`,
              borderBottom: i === weeks.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
            }}
          >
            <div
              onClick={() => setOpen(isOpen ? null : week.week_number)}
              style={{
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: current ? 'var(--color-surface-current)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 120ms ease',
              }}
            >
              <StatusBox status={statusKey} />

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  color: 'var(--color-text-4)',
                  width: 30,
                  flexShrink: 0,
                }}
              >
                {`W${week.week_number}`}
              </span>

              <span
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: current ? 600 : 400,
                  color: done ? 'var(--color-text-2)' : 'var(--color-ink)',
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {covers || 'No skill scheduled'}
              </span>

              {week.estimated_hours ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-text-4)', flexShrink: 0 }}>
                  {`${week.estimated_hours}h`}
                </span>
              ) : null}

              <MicroLabel size={10} tracking="0.1em" color="var(--color-text-4)" style={{ flexShrink: 0 }}>
                {isOpen ? 'Hide' : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}
              </MicroLabel>
            </div>

            {isOpen && (
              <div style={{ padding: '4px 20px 20px 52px', background: current ? 'var(--color-surface-current)' : 'transparent' }}>
                {tasks.map((task, t) => (
                  <div
                    key={t}
                    style={{ display: 'grid', gridTemplateColumns: '10px 1fr', gap: 12, marginTop: t ? 9 : 4, alignItems: 'start' }}
                  >
                    <span style={{ width: 6, height: 6, marginTop: 7, background: 'var(--color-line)', display: 'block' }} />
                    <span style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.5 }}>{task}</span>
                  </div>
                ))}

                {week.mini_project?.title && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-line-soft)' }}>
                    <MicroLabel size={10} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 6 }}>
                      Mini project
                    </MicroLabel>
                    <div style={{ fontSize: 14.5, color: 'var(--color-ink)' }}>{week.mini_project.title}</div>
                    {week.mini_project.description && (
                      <p style={{ fontSize: 13.5, color: 'var(--color-text-3)', lineHeight: 1.5, margin: '5px 0 0' }}>
                        {week.mini_project.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <CardFooterNote>
        A week is marked done once every skill it covers is complete.
      </CardFooterNote>
    </Card>
  );
};

export default WeeklyPlan;
