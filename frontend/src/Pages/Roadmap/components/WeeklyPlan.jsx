import React, { useState } from 'react';
import { Card, CardHeader, CardFooterNote, MicroLabel, StatusBox, InlineMessage } from '../../../design';
import { updateTaskStatus } from '../../Services/roadmapService';

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
  // Ticks are applied here and sent in the background: waiting on a round trip
  // to fill a checkbox makes the page feel broken. A failed save rolls back.
  const [ticks, setTicks] = useState({});
  const [saveError, setSaveError] = useState('');

  const ticksFor = (week) => ticks[week.week_number] ?? new Set((week.completed_tasks || []).map(Number));

  const toggleTask = async (week, index) => {
    const current = ticksFor(week);
    const next = new Set(current);
    const done = !next.has(index);
    if (done) next.add(index);
    else next.delete(index);

    setTicks((prev) => ({ ...prev, [week.week_number]: next }));
    setSaveError('');

    try {
      await updateTaskStatus(week.week_number, index, done);
    } catch (err) {
      setTicks((prev) => ({ ...prev, [week.week_number]: current }));
      // The service throws the server's payload when there is one and the raw
      // axios error when there is not — and that one's message is the literal
      // string "Network Error", which tells a learner nothing.
      const fromServer = err && err.success === false && err.message;
      setSaveError(fromServer || 'That did not save. Check your connection and try again.');
    }
  };

  // Roadmaps generated before this was surfaced may have no weekly plan.
  if (!weeks.length) return null;

  const doneSkills = new Set(
    skills.filter((s) => s.status === 'completed').map((s) => s.skill)
  );

  const allTasksTicked = (week) =>
    (week.tasks || []).length > 0 && ticksFor(week).size >= week.tasks.length;

  const allSkillsDone = (week) =>
    (week.skills || []).length > 0 && week.skills.every((s) => doneSkills.has(s));

  const isWeekDone = (week) => allTasksTicked(week) || allSkillsDone(week);

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
                {tasks.map((task, t) => {
                  const ticked = weekTicks.has(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTask(week, t)}
                      aria-pressed={ticked}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '10px 1fr',
                        gap: 12,
                        marginTop: t ? 9 : 4,
                        alignItems: 'start',
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        font: 'inherit',
                      }}
                    >
                      {/* Fills rather than gaining a tick: §5 has no
                          checkmarks, and this is the same square the password
                          rules use to mean satisfied. */}
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          marginTop: 6,
                          display: 'block',
                          background: ticked ? 'var(--color-green)' : 'transparent',
                          border: ticked ? 'none' : '1px solid var(--color-line-btn)',
                          transition: 'background-color 120ms ease',
                        }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          lineHeight: 1.5,
                          color: ticked ? 'var(--color-text-4)' : 'var(--color-text-2)',
                          textDecoration: ticked ? 'line-through' : 'none',
                        }}
                      >
                        {task}
                      </span>
                    </button>
                  );
                })}

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
