import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardFooterNote, Button, MicroLabel, InlineMessage } from '../../../design';
import TaskRow from './TaskRow';
import { currentWeek, doneWeekCount } from '../weekProgress';
import { useWeekTicks } from '../useWeekTicks';

/**
 * The week the learner is actually on, on the page they land on.
 *
 * A roadmap is up to 49 weeks long and the plan screen shows all of them.
 * That is the right view for deciding whether to commit to a track and the
 * wrong one for a Tuesday evening, when the only question is what to do next.
 * This is that question and nothing else: the current week's tasks, tickable
 * where they are read.
 *
 * It renders nothing when there is no roadmap. An empty prompt to generate one
 * already sits below it on the overview, and two would be nagging.
 */
const ThisWeek = ({ roadmap }) => {
  const navigate = useNavigate();
  const { ticksByWeek, ticksOf, toggle, error } = useWeekTicks();

  const weeks = roadmap?.weekly_plans || [];
  const skills = roadmap?.skills || [];
  if (!weeks.length) return null;

  const week = currentWeek(weeks, skills, ticksByWeek);

  // Every week finished. Saying "week 1" here would be worse than saying so.
  if (!week) {
    return (
      <Card>
        <CardHeader label="This week" />
        <div style={{ padding: '22px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
            Every week in this plan is done.
          </div>
          <p style={{ fontSize: 14.5, color: 'var(--color-text-3)', margin: '6px 0 16px', lineHeight: 1.55 }}>
            {`All ${weeks.length} weeks of ${roadmap.target_role || 'your track'} are complete. Reassess to see what has stuck, or generate a plan for a new role.`}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button onClick={() => navigate('/assessment-hub/skill')}>Reassess</Button>
            <Button variant="secondary" onClick={() => navigate('/roadmap/generate')}>My roadmap</Button>
          </div>
        </div>
      </Card>
    );
  }

  const tasks = week.tasks || [];
  const ticks = ticksOf(week);
  const done = doneWeekCount(weeks, skills, ticksByWeek);
  const covers = (week.skills || []).join(', ');

  return (
    <Card>
      <CardHeader
        label="This week"
        right={
          <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
            {`WEEK ${week.week_number} OF ${weeks.length} · ${done} DONE`}
          </MicroLabel>
        }
      />

      <div style={{ padding: '20px 24px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink)' }}>
            {covers || `Week ${week.week_number}`}
          </div>
          {week.estimated_hours ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-4)' }}>
              {`${week.estimated_hours}h planned`}
            </span>
          ) : null}
        </div>

        <div style={{ marginTop: 14 }}>
          {tasks.map((task, i) => (
            <TaskRow
              key={i}
              task={task}
              first={i === 0}
              ticked={ticks.has(i)}
              onToggle={() => toggle(week, i)}
            />
          ))}
        </div>

        {week.mini_project?.title && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--color-line-soft)' }}>
            <MicroLabel size={10} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 6 }}>
              Mini project
            </MicroLabel>
            <div style={{ fontSize: 14.5, color: 'var(--color-ink)' }}>{week.mini_project.title}</div>
          </div>
        )}
      </div>

      {error && (
        <InlineMessage tone="error" style={{ margin: '4px 24px 12px' }}>{error}</InlineMessage>
      )}

      <div style={{ padding: '10px 24px 18px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="secondary" onClick={() => navigate('/roadmap/generate')}>
          See the whole plan
        </Button>
      </div>

      <CardFooterNote>
        {`${ticks.size} of ${tasks.length} done this week. Ticking the last one moves you to week ${week.week_number + 1}.`}
      </CardFooterNote>
    </Card>
  );
};

export default ThisWeek;
