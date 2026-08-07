/**
 * Which plans a learner may delete, and what deleting one costs them.
 *
 * History fills up fast — regenerating is one click and every regeneration
 * keeps the old plan — so being able to clear it out is reasonable. The part
 * worth being careful about is that a superseded plan is not empty: it holds
 * every task ticked and every skill marked done while it was the live one,
 * and that record is the only trace of work someone actually did.
 *
 * So deletion is allowed, and the amount being destroyed is stated first
 * rather than discovered afterwards.
 */

/** The plan currently driving the product: active, and for the current track. */
export const isCurrentPlan = (roadmap, targetRole) => {
    if (!roadmap) return false;
    if (roadmap.status !== 'active') return false;
    // No track set means nothing is being driven by a role, so no plan is
    // protected on those grounds.
    if (!targetRole) return false;
    return String(roadmap.target_role || '') === String(targetRole);
};

/**
 * Whether this plan can be deleted, and why not when it cannot.
 *
 * The one plan that is refused is the one the learner is working from. It is
 * reachable from every screen and deleting it would empty the roadmap page
 * with no way back — and unlike the others it is not clutter, it is the
 * product's current state. Generating a new plan supersedes it, at which
 * point it becomes deletable like the rest.
 */
export const canDeleteRoadmap = (roadmap, targetRole) => {
    if (!roadmap) {
        return { allowed: false, reason: 'That roadmap no longer exists.' };
    }
    if (isCurrentPlan(roadmap, targetRole)) {
        return {
            allowed: false,
            reason:
                'This is the plan you are working from. Generate a new one, or change track, and this becomes deletable.',
        };
    }
    return { allowed: true, reason: null };
};

/**
 * How much finished work a plan holds.
 *
 * Counted rather than estimated, because it is shown to someone deciding
 * whether to destroy it. A plan reporting "no progress" that in fact holds a
 * month of ticks is worse than showing nothing at all.
 */
export const progressHeldBy = (roadmap) => {
    const weeks = roadmap?.weekly_plans || [];
    const skills = roadmap?.skills || [];

    const ticks = weeks.reduce(
        (sum, week) => sum + (week?.completed_tasks || []).length,
        0
    );
    const skillsDone = skills.filter((s) => s?.status === 'completed').length;

    return { ticks, skillsDone, isEmpty: ticks === 0 && skillsDone === 0 };
};

/**
 * A plan replaced by a newer one for the same track.
 *
 * Only 'regenerated'. A 'completed' plan is a track someone finished, which
 * is an achievement rather than clutter, and an 'active' plan for a track
 * they have stepped away from is waiting for them if they return — neither
 * belongs in a sweep whose whole appeal is not having to read the list.
 */
export const isSuperseded = (roadmap) => roadmap?.status === 'regenerated';

/** Just the superseded ones, in the order given. */
export const supersededPlans = (roadmaps = []) => (roadmaps || []).filter(isSuperseded);

/**
 * What a whole set of plans holds between them.
 *
 * Summed rather than counted per plan, because the question being answered
 * is "how much am I about to lose in one click".
 */
export const totalProgressHeldBy = (roadmaps = []) => {
    const totals = (roadmaps || []).reduce(
        (sum, roadmap) => {
            const held = progressHeldBy(roadmap);
            return { ticks: sum.ticks + held.ticks, skillsDone: sum.skillsDone + held.skillsDone };
        },
        { ticks: 0, skillsDone: 0 }
    );
    return { ...totals, isEmpty: totals.ticks === 0 && totals.skillsDone === 0 };
};

/**
 * The same counts as a sentence, or null when there is nothing to warn about.
 *
 * Takes counts rather than a plan so one wording serves a single plan and a
 * whole sweep — two phrasings of the same warning would drift.
 */
export const summarise = ({ ticks = 0, skillsDone = 0 } = {}) => {
    if (!ticks && !skillsDone) return null;

    const parts = [];
    if (ticks) parts.push(`${ticks} ${ticks === 1 ? 'task' : 'tasks'} ticked`);
    if (skillsDone) parts.push(`${skillsDone} ${skillsDone === 1 ? 'skill' : 'skills'} done`);
    return parts.join(' and ');
};

/** Convenience for one plan. */
export const progressSummary = (roadmap) => summarise(progressHeldBy(roadmap));

export default canDeleteRoadmap;
