import crypto from "crypto";
import express from "express";
import { runWeeklyEmailJob } from "../services/weeklyEmailJob.js";

const router = express.Router();

/**
 * Constant-time secret check.
 *
 * Fails closed: with no secret configured the endpoint refuses everything
 * rather than running for anyone who finds the URL. An unset variable after a
 * deploy is a likely mistake, and the safe reading of it is "off".
 */
const authorised = (req) => {
    const expected = process.env.WEEKLY_EMAIL_TRIGGER_SECRET || "";
    if (!expected) return false;

    const given = req.get("x-trigger-secret") || "";
    const a = Buffer.from(expected);
    const b = Buffer.from(given);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/**
 * POST /api/internal/weekly-email — run the Monday send.
 *
 * The in-process cron in services/scheduler.js only fires while the server is
 * awake, and a free Render instance sleeps after about fifteen minutes idle.
 * At eight on a Monday morning it is asleep, so the schedule alone never runs.
 * An external caller both wakes the service and triggers the job.
 *
 * Safe to call more than once: the job skips anyone already sent to today, so
 * a retry, an overlapping in-process run, or a workflow that fires twice all
 * end up sending nothing extra.
 *
 * `?dryRun=1` reports who would be mailed without mailing them.
 */
router.post("/weekly-email", async (req, res) => {
    if (!authorised(req)) {
        // No detail about which part was wrong, and the same answer whether
        // the secret is missing here or misconfigured on the server.
        return res.status(401).json({ success: false, message: "Not authorised." });
    }

    try {
        const dryRun = req.query.dryRun === "1" || req.query.dryRun === "true";
        const report = await runWeeklyEmailJob({ dryRun });

        console.log(
            `📬 Weekly email (${dryRun ? "dry run" : "triggered"}): sent ${report.sent} of ${report.considered}`,
            JSON.stringify(report.skipped)
        );

        // The report comes back so the workflow log says what happened rather
        // than only that the request returned 200.
        return res.status(200).json({ success: true, data: report });
    } catch (err) {
        console.error("Weekly email trigger failed:", err);
        return res.status(500).json({ success: false, message: "Job failed.", error: err.message });
    }
});

export default router;
