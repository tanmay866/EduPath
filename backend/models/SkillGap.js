import mongoose from "mongoose";

const SkillGapSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        target_role: { type: String, required: true },
        // Scores live only on skill_gaps below. There used to be a parallel
        // `skill_scores` Map keyed by skill name, but Mongoose maps reject keys
        // containing '.', so "Node.js Basics" and "Express.js" — both real
        // template skills — threw on write and the result was silently dropped.
        skill_gaps: [
            {
                skill: String,
                gap_severity: {
                    type: String,
                    enum: ["low", "medium", "high", "critical"],
                },
                priority_rank: Number,
                current_score: Number,
                required_score: Number,
            },
        ],
        strength_score: { type: Number, default: 0 },
        assessment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assessment",
        },
    },
    { timestamps: true }
);

// Scores are only meaningful next to the role they were measured against —
// "React Basics" means nothing to the AI/ML curriculum — so a user keeps one
// document per target role rather than one overall. Switching roles therefore
// starts clean, and switching back restores what was already assessed.
SkillGapSchema.index({ user_id: 1, target_role: 1 });

const SkillGap = mongoose.model("SkillGap", SkillGapSchema);

export default SkillGap;