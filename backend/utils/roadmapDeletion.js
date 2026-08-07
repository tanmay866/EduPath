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

/** The same counts as a sentence, or null when the plan holds nothing. */
export const progressSummary = (roadmap) => {
    const { ticks, skillsDone, isEmpty } = progressHeldBy(roadmap);
    if (isEmpty) return null;

    const parts = [];
    if (ticks) parts.push(`${ticks} ${ticks === 1 ? 'task' : 'tasks'} ticked`);
    if (skillsDone) parts.push(`${skillsDone} ${skillsDone === 1 ? 'skill' : 'skills'} done`);
    return parts.join(' and ');
};

export default canDeleteRoadmap;
