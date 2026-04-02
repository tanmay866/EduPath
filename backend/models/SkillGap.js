import mongoose from "mongoose";

const SkillGapSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        target_role: { type: String, required: true },
        skill_scores: {
            type: Map,
            of: Number, // skill_name -> score (0-100)
        },
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

SkillGapSchema.index({ user_id: 1 });

const SkillGap = mongoose.model("SkillGap", SkillGapSchema);

export default SkillGap;