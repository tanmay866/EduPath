import mongoose from "mongoose";

const SkillNodeSchema = new mongoose.Schema(
    {
        skill: { type: String, required: true },
        category: { type: String },
        difficulty: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },
        start_week: { type: Number, required: true },
        end_week: { type: Number, required: true },
        hours_allocated: { type: Number },
        dependencies: [{ type: String }],
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed", "skipped"],
            default: "pending",
        },
        resources: [
            {
                type: { type: String },
                title: String,
                url: String,
            },
        ],
        mini_project: {
            title: String,
            description: String,
            week: Number,
        },
    },
    { _id: false }
);

const WeeklyPlanSchema = new mongoose.Schema(
    {
        week_number: { type: Number, required: true },
        skills: [{ type: String }],
        tasks: [{ type: String }],
        // Indices into `tasks`, rather than reshaping tasks into objects.
        //
        // Tasks are generated as plain strings and every roadmap already
        // stored is that shape; changing it would have meant migrating them or
        // carrying both forms. Indices are stable within a saved roadmap
        // because regeneration writes a new document rather than editing this
        // one — the old plan is kept in history untouched.
        completed_tasks: [{ type: Number }],
        estimated_hours: { type: Number },
        mini_project: {
            title: String,
            description: String,
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
        },
    },
    { _id: false }
);

const RoadmapSchema = new mongoose.Schema(
    {
        roadmap_id: { type: String, required: true, unique: true },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        target_role: { type: String, required: true },
        experience_level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
        },
        total_duration_weeks: { type: Number },
        hours_per_week: { type: Number },
        /**
         * The day week 1 begins, which is what makes this a schedule.
         *
         * Kept separate from createdAt because they stop agreeing the moment
         * a plan is rebuilt: adapting a roadmap carries progress onto a new
         * document, and the learner did not go back to week one by doing it.
         */
        started_at: { type: Date, default: Date.now },
        skills: [SkillNodeSchema],
        weekly_plans: [WeeklyPlanSchema],
        version: { type: Number, default: 1 },
        status: {
            type: String,
            enum: ["draft", "active", "completed", "regenerated"],
            default: "active",
        },
        metadata: {
            generated_at: { type: Date, default: Date.now },
            last_adapted_at: { type: Date },
            generation_method: { type: String, default: "hybrid" },
            ai_model_used: { type: String },
        },
    },
    { timestamps: true }
);

RoadmapSchema.index({ user_id: 1, status: 1 });
RoadmapSchema.index({ roadmap_id: 1 });

const Roadmap = mongoose.model("Roadmap", RoadmapSchema);

export default Roadmap;