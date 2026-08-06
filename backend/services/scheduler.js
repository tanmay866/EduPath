import cron from "node-cron";
import { runWeeklyEmailJob } from "./weeklyEmailJob.js";

/**
 * Scheduled work, registered once at boot.
 *
 * In-process rather than an external scheduler because the API is a
 * long-running node process, so there is nothing to add to the deployment. It
 * does mean the job only runs while the server is up: on a host that sleeps
 * idle instances, a Monday morning with no traffic would miss the window. The
 * job is safe to trigger by hand for exactly that reason — it records what it
 * sent and will not send twice in a day.
 *
 * Set WEEKLY_EMAIL_ENABLED=false to keep the schedule from registering at all,
 * which is what a staging copy of the database wants: it has real addresses in
 * it and nobody expects mail from staging.
 */
export const startScheduler = () => {
    if (process.env.WEEKLY_EMAIL_ENABLED === "false") {
        console.log("📭 Weekly email disabled (WEEKLY_EMAIL_ENABLED=false)");
        return null;
    }

    // 08:00 Monday, in the timezone the learners are actually in. Without the
    // timezone this would follow the server's clock, which on most hosts is
    // UTC — 08:00 there is half past one in the afternoon in India.
    const task = cron.schedule(
        "0 8 * * 1",
        async () => {
            try {
                const report = await runWeeklyEmailJob();
                console.log(
                    `📬 Weekly email: sent ${report.sent} of ${report.considered} considered`,
                    JSON.stringify(report.skipped)
                );
                if (report.failed.length) {
                    console.error(`❌ Weekly email failures (${report.failed.length}):`, report.failed);
                }
            } catch (err) {
                console.error("❌ Weekly email job threw:", err.message);
            }
        },
        { timezone: "Asia/Kolkata" }
    );

    console.log("📅 Weekly email scheduled: Mondays 08:00 Asia/Kolkata");
    return task;
};

export default startScheduler;
