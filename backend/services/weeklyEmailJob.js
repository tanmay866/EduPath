import User from "../models/userModel.js";
import Roadmap from "../models/Roadmap.js";
import { sendWeeklyPlanEmail } from "../utils/sendEmail.js";
import { currentWeek, doneWeekCount } from "../utils/weekProgress.js";
import { scheduleForPlan } from "../utils/planSchedule.js";
import { unsubscribeUrlFor } from "../utils/unsubscribeToken.js";

/**
 * The Monday email.
 *
 * Sent only to accounts that asked for it and have somewhere to be: an active
 * roadmap with at least one unfinished week. Everyone else is skipped rather
 * than sent a hedged message, because an email that says "you have no plan,
 * why not make one" is the kind that gets a sender marked as spam.
 *
 * Runs as a plain async function so it can be invoked from a cron, from a
 * script, or from a test, and reports what it did rather than logging into the
 * void. `dryRun` builds and counts everything without delivering, which is how
 * this gets checked without mailing anybody.
 */
export const runWeeklyEmailJob = async ({ dryRun = false, limit = 0, onlyEmail = null } = {}) => {
    const startedAt = new Date();
    const report = {
        startedAt,
        dryRun,
        considered: 0,
        sent: 0,
        skipped: { optedOut: 0, unverified: 0, noRoadmap: 0, planFinished: 0, alreadySentToday: 0 },
        failed: [],
        recipients: [],
    };

    const query = { "weeklyEmail.enabled": true };
    if (onlyEmail) query.email = String(onlyEmail).toLowerCase();

    const users = await User.find(query)
        .select("firstName lastName email isEmailVerified target_role weeklyEmail")
        .lean();

    for (const user of users) {
        if (limit && report.sent >= limit) break;
        report.considered += 1;

        // An unverified address has never been proven to belong to anyone.
        if (!user.isEmailVerified) {
            report.skipped.unverified += 1;
            continue;
        }

        // Guards a double send when the job is triggered twice in a window —
        // a restart, a manual run, two instances. Same calendar day is enough
        // given this is weekly.
        const last = user.weeklyEmail?.lastSentAt;
        if (last && new Date(last).toDateString() === startedAt.toDateString()) {
            report.skipped.alreadySentToday += 1;
            continue;
        }

        const roadmapQuery = { user_id: user._id, status: "active" };
        if (user.target_role) roadmapQuery.target_role = user.target_role;
        const roadmap = await Roadmap.findOne(roadmapQuery).sort({ createdAt: -1 }).lean();

        if (!roadmap || !(roadmap.weekly_plans || []).length) {
            report.skipped.noRoadmap += 1;
            continue;
        }

        const week = currentWeek(roadmap.weekly_plans, roadmap.skills);
        if (!week) {
            // Nothing left to nudge towards. Congratulating someone weekly for
            // having finished is its own kind of nagging.
            report.skipped.planFinished += 1;
            continue;
        }

        const schedule = scheduleForPlan(roadmap);
        const meta = {
            targetRole: roadmap.target_role,
            pace: schedule?.label || null,
            weekCount: roadmap.weekly_plans.length,
            doneCount: doneWeekCount(roadmap.weekly_plans, roadmap.skills),
            unsubscribeUrl: unsubscribeUrlFor(user),
        };

        report.recipients.push({
            email: user.email,
            week: week.week_number,
            of: meta.weekCount,
            covers: (week.skills || []).join(", "),
            tasksLeft: (week.tasks || []).length - (week.completed_tasks || []).length,
            pace: schedule?.label || null,
        });

        if (dryRun) continue;

        try {
            await sendWeeklyPlanEmail(user, week, meta);
            await User.updateOne({ _id: user._id }, { $set: { "weeklyEmail.lastSentAt": new Date() } });
            report.sent += 1;
        } catch (err) {
            // One bad address must not stop the run.
            report.failed.push({ email: user.email, error: err.message });
        }
    }

    report.finishedAt = new Date();
    return report;
};

export default runWeeklyEmailJob;
