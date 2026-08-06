/**
 * Carries progress from a plan onto its replacement.
 *
 * Regenerating has always thrown the old plan away: a new document is written,
 * the previous one is marked superseded, and every skill marked done and every
 * task ticked stays behind in history. So the notice offering to rebuild
 * around newer assessment results was really offering to restart, and the
 * sensible move for anyone mid-plan was to ignore it.
 *
 * Two kinds of progress carry, by different keys, because they survive a
 * re-plan differently.
 *
 * Skills carry by name. A skill someone completed is completed whatever the
 * plan does with its ordering or its week numbers.
 *
 * Ticks carry by the skills their week covers, which occurrence of that run of
 * weeks it is, and the task's own text — never by week number or index.
 * Re-planning renumbers weeks, so an index carried across would tick a
 * different task and a week number would tick a different week.
 *
 * The occurrence matters because a skill usually spans several weeks, and
 * those weeks are identical: same skill, same generated tasks. Keying on the
 * skills and the text alone made one tick in week 1 light up weeks 2 and 3 as
 * well — two ticks became six against a real plan.
 */

const skillsKey = (week) => (week?.skills || []).slice().sort().join("|");

/**
 * Numbers each week within the run of weeks covering the same skills, so the
 * second week of Python Basics matches the second week of Python Basics on the
 * other side rather than the first.
 */
const withOccurrence = (weeks = []) => {
    const seen = new Map();
    return weeks.map((week) => {
        const key = skillsKey(week);
        const n = seen.get(key) || 0;
        seen.set(key, n + 1);
        return { week, key: `${key}#${n}` };
    });
};

/**
 * @param {Object} previous - the plan being replaced
 * @param {Object} next - the freshly generated plan, mutated in place
 * @returns {Object} counts of what carried, for reporting
 */
export const mergeRoadmapProgress = (previous, next) => {
    const report = { skillsCarried: 0, ticksCarried: 0, ticksDropped: 0 };
    if (!previous || !next) return report;

    // ── skills, by name ───────────────────────────────────────────────────
    const previousStatus = new Map(
        (previous.skills || [])
            .filter((s) => s?.skill && s.status && s.status !== "pending")
            .map((s) => [s.skill, s.status])
    );

    for (const skill of next.skills || []) {
        const carried = previousStatus.get(skill.skill);
        if (carried) {
            skill.status = carried;
            report.skillsCarried += 1;
        }
    }

    // ── ticks, by what the task says and what its week covers ─────────────
    const ticked = new Set();
    let previousTickCount = 0;
    for (const { week, key } of withOccurrence(previous.weekly_plans)) {
        for (const index of week.completed_tasks || []) {
            const task = (week.tasks || [])[Number(index)];
            if (task) {
                ticked.add(`${key} ${task}`);
                previousTickCount += 1;
            }
        }
    }

    for (const { week, key } of withOccurrence(next.weekly_plans)) {
        const carried = [];
        (week.tasks || []).forEach((task, index) => {
            if (ticked.has(`${key} ${task}`)) carried.push(index);
        });
        week.completed_tasks = carried;

        // Status is derived from the ticks, exactly as the tick endpoint
        // derives it, so a merged plan cannot disagree with itself.
        const total = (week.tasks || []).length;
        week.status = carried.length === 0
            ? "pending"
            : carried.length >= total ? "completed" : "in_progress";

        report.ticksCarried += carried.length;
    }

    report.ticksDropped = Math.max(0, previousTickCount - report.ticksCarried);
    return report;
};

export default mergeRoadmapProgress;
