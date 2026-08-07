/**
 * Where a learner is in their plan by the calendar, not by the ticks.
 *
 * The roadmap page opens with "A schedule, not a reading list", and until now
 * the plan had no dates in it at all. "Week 1 of 36" meant the first week not
 * yet finished, so someone three months in who had ticked nothing still read
 * Week 1, and nothing in the product could say they had fallen behind — or
 * that they were ahead. A thirty-six week plan that cannot tell you where you
 * are in it is the reading list the headline disowns.
 *
 * Weeks are whole weeks from the day the plan started. Falling behind
 * therefore takes a full week of nothing rather than an afternoon, which is
 * the point: a plan that calls you late on day two is one people stop
 * reading, and the weekly email would be nagging about a rounding error.
 */

import { doneWeekCount } from './weekProgress.js';

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

const asDate = (value) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
};

/**
 * Whole weeks between starting and now, never negative.
 *
 * A plan dated in the future reads as zero rather than as a negative week,
 * which would otherwise put someone "ahead" before they had begun.
 */
export const weeksElapsed = (startedAt, now = new Date()) => {
    const start = asDate(startedAt);
    const at = asDate(now);
    if (!start || !at) return null;
    return Math.max(0, Math.floor((at.getTime() - start.getTime()) / WEEK));
};

/**
 * The dates week N covers. Week 1 begins the day the plan started.
 *
 * `to` is the last day of the week rather than the first of the next, so a
 * range can be printed without the reader having to subtract a day.
 */
export const weekDateRange = (startedAt, weekNumber) => {
    const start = asDate(startedAt);
    if (!start || !Number.isFinite(Number(weekNumber)) || weekNumber < 1) return null;

    const from = new Date(start.getTime() + (weekNumber - 1) * WEEK);
    return { from, to: new Date(from.getTime() + WEEK - DAY) };
};

/**
 * The week the calendar says the learner is in, 1-based.
 *
 * Not capped at the length of the plan: running past the end is a real state
 * and the caller needs to be able to see it rather than be told week 36
 * forever.
 */
export const scheduledWeek = (startedAt, now = new Date()) => {
    const elapsed = weeksElapsed(startedAt, now);
    return elapsed === null ? null : elapsed + 1;
};

/**
 * How the plan is going: where the calendar puts them, how much is actually
 * finished, and the gap between the two.
 *
 * Expected progress is whole weeks elapsed — after one full week, one week of
 * the plan should be done. A plan whose weeks are all finished is done, and
 * stays done however long ago that happened; nobody is behind on a plan they
 * have completed.
 */
export const paceFor = ({ startedAt, totalWeeks, weeksDone = 0, now = new Date() } = {}) => {
    const elapsed = weeksElapsed(startedAt, now);
    const total = Number(totalWeeks);
    if (elapsed === null || !Number.isFinite(total) || total <= 0) return null;

    const done = Math.max(0, Math.min(Number(weeksDone) || 0, total));
    if (done >= total) {
        return {
            state: 'done',
            scheduledWeek: total,
            weeksDone: done,
            totalWeeks: total,
            delta: 0,
            weeksRemaining: 0,
        };
    }

    // Nothing is expected beyond the length of the plan — once the calendar
    // runs past the end, being "twelve weeks behind" stops meaning anything
    // more than "behind".
    const expected = Math.min(elapsed, total);
    const delta = done - expected;

    return {
        state: delta > 0 ? 'ahead' : delta < 0 ? 'behind' : 'on-track',
        scheduledWeek: Math.min(elapsed + 1, total),
        weeksDone: done,
        totalWeeks: total,
        delta,
        weeksRemaining: total - done,
    };
};

/**
 * Whether every week of the plan is finished.
 *
 * An empty plan is not finished. Nothing to do is not the same as everything
 * done, and treating it as complete would mark a plan finished the moment it
 * failed to generate any weeks.
 */
export const isPlanFinished = (roadmap) => {
    const weeks = roadmap?.weekly_plans || [];
    if (!weeks.length) return false;
    return doneWeekCount(weeks, roadmap?.skills || []) >= weeks.length;
};

/**
 * The status change a plan is due, if any.
 *
 * Finishing a track is the most meaningful thing that happens here and it was
 * never written down: 'completed' has been in the status enum from the start
 * with nothing to set it, so a learner who finished every week kept a plan
 * that still called itself active. It also left them stuck with it — the plan
 * being worked from cannot be deleted, and it stayed the plan being worked
 * from forever.
 *
 * Reversible on purpose. Unticking a task after finishing puts the plan back
 * to active, because a plan with work left in it is not complete however it
 * was labelled a moment ago.
 *
 * Returns null when nothing needs to change, so callers can skip the write.
 */
export const completionUpdateFor = (roadmap, now = new Date()) => {
    if (!roadmap) return null;
    const finished = isPlanFinished(roadmap);

    if (finished && roadmap.status === 'active') {
        return { status: 'completed', completed_at: asDate(now) };
    }
    if (!finished && roadmap.status === 'completed') {
        return { status: 'active', completed_at: null };
    }
    return null;
};

/**
 * The whole schedule for one plan, ready to send to a screen.
 *
 * Derived on read rather than stored, so it cannot go stale against the ticks
 * it is counting. One function so the roadmap page, the Overview and the
 * weekly email cannot each arrive at a different answer for the same plan.
 */
export const scheduleForPlan = (roadmap, now = new Date()) => {
    if (!roadmap) return null;

    const weeks = roadmap.weekly_plans || [];
    const totalWeeks = Number(roadmap.total_duration_weeks) || weeks.length;
    const pace = paceFor({
        startedAt: roadmap.started_at,
        totalWeeks,
        weeksDone: doneWeekCount(weeks, roadmap.skills || []),
        now,
    });
    if (!pace) return null;

    const thisWeek = weekDateRange(roadmap.started_at, pace.scheduledWeek);
    return {
        ...pace,
        label: paceLabel(pace),
        startedAt: asDate(roadmap.started_at),
        weekFrom: thisWeek?.from ?? null,
        weekTo: thisWeek?.to ?? null,
    };
};

/** How the gap reads in a sentence. Null when there is nothing worth saying. */
export const paceLabel = (pace) => {
    if (!pace) return null;
    if (pace.state === 'done') return 'Plan complete';
    if (pace.state === 'on-track') return 'On schedule';

    const n = Math.abs(pace.delta);
    const weeks = n === 1 ? '1 week' : `${n} weeks`;
    return pace.state === 'ahead' ? `${weeks} ahead` : `${weeks} behind`;
};

export default paceFor;
