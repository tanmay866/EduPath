import test from 'node:test';
import assert from 'node:assert/strict';

import {
    weeksElapsed,
    weekDateRange,
    scheduledWeek,
    paceFor,
    paceLabel,
    isPlanFinished,
    completionUpdateFor,
} from '../utils/planSchedule.js';

/**
 * The plan had no dates at all, so "behind" was not a state it could reach.
 * The failures worth guarding are the ones that would make it lie in a
 * plausible way: calling someone late a day after they started, calling them
 * behind on a plan they have finished, or quietly deciding they are ahead
 * because a date was missing.
 */
const START = new Date('2026-01-01T00:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const after = (days) => new Date(START.getTime() + days * DAY);

test('a week has to pass in full before it counts', () => {
    assert.equal(weeksElapsed(START, START), 0);
    assert.equal(weeksElapsed(START, after(6)), 0, 'day six is still week one');
    assert.equal(weeksElapsed(START, after(7)), 1);
    assert.equal(weeksElapsed(START, after(13)), 1);
    assert.equal(weeksElapsed(START, after(14)), 2);
});

test('a plan dated in the future is not already underway', () => {
    // Otherwise a negative elapsed count reads as being weeks ahead.
    assert.equal(weeksElapsed(START, after(-30)), 0);
    assert.equal(scheduledWeek(START, after(-30)), 1);
});

test('a missing or unreadable date gives nothing rather than a guess', () => {
    for (const bad of [null, undefined, '', 'not a date']) {
        assert.equal(weeksElapsed(bad, START), null);
        assert.equal(scheduledWeek(bad, START), null);
        assert.equal(weekDateRange(bad, 1), null);
        assert.equal(paceFor({ startedAt: bad, totalWeeks: 10 }), null);
    }
});

test('week one starts the day the plan did', () => {
    const first = weekDateRange(START, 1);
    assert.equal(first.from.toISOString(), START.toISOString());
    // The last day of the week, not the first of the next.
    assert.equal(first.to.toISOString(), after(6).toISOString());

    const third = weekDateRange(START, 3);
    assert.equal(third.from.toISOString(), after(14).toISOString());
    assert.equal(third.to.toISOString(), after(20).toISOString());
});

test('a week number below one has no range', () => {
    assert.equal(weekDateRange(START, 0), null);
    assert.equal(weekDateRange(START, -2), null);
});

test('keeping up week for week is on schedule', () => {
    const pace = paceFor({ startedAt: START, totalWeeks: 10, weeksDone: 2, now: after(14) });
    assert.equal(pace.state, 'on-track');
    assert.equal(pace.delta, 0);
    assert.equal(pace.scheduledWeek, 3);
});

test('a day into the plan is not behind', () => {
    // The nag that would teach people to ignore this: zero weeks done on day
    // one is exactly what is expected.
    const pace = paceFor({ startedAt: START, totalWeeks: 36, weeksDone: 0, now: after(1) });
    assert.equal(pace.state, 'on-track');
    assert.equal(paceLabel(pace), 'On schedule');
});

test('a full week with nothing finished is behind, and says by how much', () => {
    const pace = paceFor({ startedAt: START, totalWeeks: 36, weeksDone: 0, now: after(21) });
    assert.equal(pace.state, 'behind');
    assert.equal(pace.delta, -3);
    assert.equal(paceLabel(pace), '3 weeks behind');
});

test('finishing faster than the calendar is ahead', () => {
    const pace = paceFor({ startedAt: START, totalWeeks: 36, weeksDone: 5, now: after(14) });
    assert.equal(pace.state, 'ahead');
    assert.equal(pace.delta, 3);
    assert.equal(paceLabel(pace), '3 weeks ahead');
});

test('one week reads as a week, not as weeks', () => {
    assert.equal(paceLabel(paceFor({ startedAt: START, totalWeeks: 10, weeksDone: 0, now: after(7) })), '1 week behind');
    assert.equal(paceLabel(paceFor({ startedAt: START, totalWeeks: 10, weeksDone: 2, now: after(7) })), '1 week ahead');
});

test('a finished plan is done, not behind, however long ago it was', () => {
    // Being told you are twenty weeks late on something you completed is the
    // kind of wrongness that discredits the whole figure.
    const pace = paceFor({ startedAt: START, totalWeeks: 10, weeksDone: 10, now: after(365) });
    assert.equal(pace.state, 'done');
    assert.equal(pace.delta, 0);
    assert.equal(pace.weeksRemaining, 0);
    assert.equal(paceLabel(pace), 'Plan complete');
});

test('running past the end is behind by the plan, not by the calendar', () => {
    // A year late on a ten week plan is "behind by what is left", not -42.
    const pace = paceFor({ startedAt: START, totalWeeks: 10, weeksDone: 3, now: after(365) });
    assert.equal(pace.state, 'behind');
    assert.equal(pace.delta, -7, 'cannot owe more weeks than the plan has');
    assert.equal(pace.scheduledWeek, 10, 'the week shown never exceeds the plan');
});

test('more weeks done than the plan holds is not counted twice', () => {
    const pace = paceFor({ startedAt: START, totalWeeks: 5, weeksDone: 99, now: after(7) });
    assert.equal(pace.state, 'done');
    assert.equal(pace.weeksDone, 5);
});

test('a plan with no length has no pace', () => {
    for (const bad of [0, -3, null, undefined, 'ten']) {
        assert.equal(paceFor({ startedAt: START, totalWeeks: bad, weeksDone: 1 }), null);
    }
});

test('no pace produces no label rather than an empty sentence', () => {
    assert.equal(paceLabel(null), null);
    assert.equal(paceLabel(undefined), null);
});

/**
 * Finishing a track was never recorded. 'completed' sat in the status enum
 * with nothing to set it, so the plan stayed active — and since the plan
 * being worked from cannot be deleted, finishing one meant being stuck with
 * it. The failures that matter here are marking a plan done when it is not,
 * and refusing to un-mark it when work reappears.
 */
const finishedPlan = (status = 'active') => ({
    status,
    weekly_plans: [
        { week_number: 1, tasks: ['a', 'b'], completed_tasks: [0, 1] },
        { week_number: 2, tasks: ['c'], completed_tasks: [0] },
    ],
    skills: [],
});

const unfinishedPlan = (status = 'active') => ({
    status,
    weekly_plans: [
        { week_number: 1, tasks: ['a', 'b'], completed_tasks: [0, 1] },
        { week_number: 2, tasks: ['c'], completed_tasks: [] },
    ],
    skills: [],
});

test('a plan with every week ticked is finished', () => {
    assert.equal(isPlanFinished(finishedPlan()), true);
    assert.equal(isPlanFinished(unfinishedPlan()), false);
});

test('a plan with no weeks at all is not finished', () => {
    // Nothing to do is not everything done — otherwise a generation that
    // produced no weeks would be congratulated.
    assert.equal(isPlanFinished({ status: 'active', weekly_plans: [], skills: [] }), false);
    assert.equal(isPlanFinished({}), false);
    assert.equal(isPlanFinished(null), false);
});

test('finishing the last week completes the plan and dates it', () => {
    const at = new Date('2026-08-07T10:00:00Z');
    const update = completionUpdateFor(finishedPlan('active'), at);
    assert.equal(update.status, 'completed');
    assert.equal(update.completed_at.toISOString(), at.toISOString());
});

test('unticking after finishing puts the plan back to active', () => {
    // A plan with work left in it is not complete, whatever it was called a
    // moment ago.
    const update = completionUpdateFor(unfinishedPlan('completed'));
    assert.equal(update.status, 'active');
    assert.equal(update.completed_at, null);
});

test('nothing to change is reported as nothing rather than a rewrite', () => {
    assert.equal(completionUpdateFor(unfinishedPlan('active')), null);
    assert.equal(completionUpdateFor(finishedPlan('completed')), null);
    assert.equal(completionUpdateFor(null), null);
});

test('a superseded plan is left alone whatever its ticks say', () => {
    // Only the live plan changes state. Rewriting history would resurrect
    // old plans as active every time one was inspected.
    assert.equal(completionUpdateFor(finishedPlan('regenerated')), null);
    assert.equal(completionUpdateFor(unfinishedPlan('regenerated')), null);
});
