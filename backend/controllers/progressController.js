import ProgressLog from "../models/ProgressLog.js";
import Roadmap from "../models/Roadmap.js";

// ─────────────────────────────────────────────
// POST /api/progress/event
// Log any user learning event
// ─────────────────────────────────────────────
export const logEvent = async (req, res) => {
    try {
        const { event_type, roadmap_id, metadata } = req.body;

        const log = await ProgressLog.create({
            user_id: req.user._id,
            event_type,
            roadmap_id,
            metadata,
        });

        // If skill is marked completed, update roadmap skill status
        if (event_type === "skill_completed" && metadata?.skill && roadmap_id) {
            await Roadmap.updateOne(
                { roadmap_id, user_id: req.user._id, "skills.skill": metadata.skill },
                { $set: { "skills.$.status": "completed" } }
            );
        }

        res.status(201).json({ success: true, data: log });
    } catch (err) {
        console.error("logEvent error:", err);
        res.status(500).json({
            success: false,
            message: "Server error.",
            error: err.message,
        });
    }
};

// ─────────────────────────────────────────────
// GET /api/progress/analytics
// ─────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        const [logs, roadmap] = await Promise.all([
            ProgressLog.find({ user_id: userId })
                .sort({ timestamp: -1 })
                .limit(200),
            Roadmap.findOne({ user_id: userId, status: "active" }),
        ]);

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "No active roadmap found.",
            });
        }

        const totalSkills = roadmap.skills.length;
        const completedSkills = roadmap.skills.filter(
            (s) => s.status === "completed"
        ).length;
        const inProgressSkills = roadmap.skills.filter(
            (s) => s.status === "in_progress"
        ).length;

        const quizLogs = logs.filter(
            (l) =>
                l.event_type === "quiz_attempted" &&
                l.metadata?.score != null
        );

        const avgQuizScore =
            quizLogs.length > 0
                ? Math.round(
                    quizLogs.reduce(
                        (acc, l) => acc + l.metadata.score,
                        0
                    ) / quizLogs.length
                )
                : 0;

        const totalMinutes = logs
            .filter((l) => l.metadata?.time_spent_minutes)
            .reduce(
                (acc, l) => acc + l.metadata.time_spent_minutes,
                0
            );

        const readinessScore =
            totalSkills > 0
                ? Math.round((completedSkills / totalSkills) * 100)
                : 0;

        // Weekly activity breakdown (last 8 weeks)
        const weeklyActivity = _buildWeeklyActivity(logs);

        res.status(200).json({
            success: true,
            data: {
                roadmap_id: roadmap.roadmap_id,
                target_role: roadmap.target_role,
                total_duration_weeks: roadmap.total_duration_weeks,
                skills_summary: {
                    total: totalSkills,
                    completed: completedSkills,
                    in_progress: inProgressSkills,
                    pending:
                        totalSkills -
                        completedSkills -
                        inProgressSkills,
                },
                readiness_score: readinessScore,
                avg_quiz_score: avgQuizScore,
                total_learning_hours: Math.round(
                    totalMinutes / 60
                ),
                weekly_activity: weeklyActivity,
                recent_events: logs.slice(0, 10),
            },
        });
    } catch (err) {
        console.error("getAnalytics error:", err);
        res.status(500).json({
            success: false,
            message: "Server error.",
            error: err.message,
        });
    }
};

// ─────────────────────────────────────────────
// Helper: Build last-8-weeks activity array
// ─────────────────────────────────────────────
function _buildWeeklyActivity(logs) {
    const weeks = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekLogs = logs.filter(
            (l) =>
                l.timestamp >= weekStart &&
                l.timestamp <= weekEnd
        );

        const minutes = weekLogs
            .filter((l) => l.metadata?.time_spent_minutes)
            .reduce(
                (acc, l) => acc + l.metadata.time_spent_minutes,
                0
            );

        weeks.push({
            week_label: `${weekStart.toLocaleDateString(
                "en-IN",
                { month: "short", day: "numeric" }
            )}`,
            events: weekLogs.length,
            hours: Math.round(minutes / 60),
        });
    }

    return weeks;
}