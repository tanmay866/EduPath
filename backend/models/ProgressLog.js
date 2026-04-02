import mongoose from "mongoose";

const ProgressLogSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        roadmap_id: { type: String },
        event_type: {
            type: String,
            enum: [
                "skill_started",
                "skill_completed",
                "quiz_attempted",
                "quiz_passed",
                "project_submitted",
                "week_completed",
                "roadmap_generated",
                "roadmap_adapted",
                "session_started",
                "session_ended",
            ],
            required: true,
        },
        metadata: {
            skill: String,
            week_number: Number,
            score: Number, // quiz score 0-100
            time_spent_minutes: Number,
            project_title: String,
            notes: String,
        },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

// Indexes
ProgressLogSchema.index({ user_id: 1, timestamp: -1 });
ProgressLogSchema.index({ user_id: 1, event_type: 1 });

const ProgressLog = mongoose.model("ProgressLog", ProgressLogSchema);

export default ProgressLog;