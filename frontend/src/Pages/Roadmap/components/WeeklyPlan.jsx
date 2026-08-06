import React, { useState } from 'react';
import { Card, CardHeader, CardFooterNote, MicroLabel, StatusBox, InlineMessage } from '../../../design';
import TaskRow from './TaskRow';
import { completedSkillNames, isWeekDone as weekIsDone, doneWeekCount } from '../weekProgress';
import { useWeekTicks } from '../useWeekTicks';

/**
 * The week-by-week schedule the AI service produces alongside the skill list.
 *
 * It was generated and stored on every roadmap from the start but never read —
 * the page showed the skills and threw the schedule away, so the tasks, hours
 * and mini projects the model had already worked out were invisible.
 *
 * Tasks can be ticked off individually. The smallest thing that could be
 * marked before this was a whole skill — on the MERN track that is three and a
 * half weeks between one tick and the next, which is a long time to work
 * without the plan acknowledging any of it.
 *
 * A week counts as done when its tasks are all ticked, or when every skill it
 * covers is complete. Two conditions rather than one because roadmaps
 * generated before ticking existed have no ticks, and reading those as
 * untouched would have quietly un-completed work already finished.
 */
const WeeklyPlan = ({ weeks = [], skills = [] }) => {
  const [open, setOpen] = useState(null);
  const { ticksByWeek, ticksOf, toggle, error: saveError } = useWeekTicks();

  // Roadmaps generated before this was surfaced may have no weekly plan.
  if (!weeks.length) return null;

  const doneSkills = completedSkillNames(skills);
  const ticksFor = ticksOf;
  const isWeekDone = (week) => weekIsDone(week, doneSkills, ticksByWeek);
  const toggleTask = toggle;

  const currentWeek = weeks.find((w) => !isWeekDone(w))?.week_number ?? null;
  const doneCount = doneWeekCount(weeks, skills, ticksByWeek);

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
        const weekTicks = ticksFor(week);
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
                {isOpen
                  ? 'Hide'
                  : weekTicks.size
                    ? `${weekTicks.size} / ${tasks.length} DONE`
                    : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}
              </MicroLabel>
            </div>

            {isOpen && (
              <div style={{ padding: '4px 20px 20px 52px', background: current ? 'var(--color-surface-current)' : 'transparent' }}>
                {tasks.map((task, t) => (
                  <TaskRow
                    key={t}
                    task={task}
                    first={t === 0}
                    ticked={weekTicks.has(t)}
                    onToggle={() => toggleTask(week, t)}
                  />
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

      {saveError && (


        <InlineMessage tone="error" style={{ margin: '0 20px 16px' }}>{saveError}</InlineMessage>


      )}


      <CardFooterNote>
        A week is marked done once every skill it covers is complete.
      </CardFooterNote>
    </Card>
  );
};

export default WeeklyPlan;
