import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Roadmap from "../models/Roadmap.js";
import User from "../models/userModel.js";
import SkillGap from "../models/SkillGap.js";

const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || "http://localhost:8000";

const normalizeExperienceLevel = (value) => {
    if (!value) {
        return "";
    }

    const normalized = String(value).trim().toLowerCase();
    const validLevels = ["beginner", "intermediate", "advanced"];

    return validLevels.includes(normalized) ? normalized : "";
};

const resolveRoadmapProfile = (user) => {
    const targetRole = user.target_role || user.profile?.targetRole || "";
    const experienceLevel = normalizeExperienceLevel(
        user.experience_level || user.profile?.occupation?.experienceLevel
    );
    const hoursPerWeek =
        user.hours_per_week || user.profile?.availableLearningTime || 10;
    const learningStyle = user.learning_style || user.profile?.learningStyle || "mixed";

    return {
        targetRole,
        experienceLevel,
        hoursPerWeek,
        learningStyle,
    };
};

const normalizeCurrentSkillsForAI = (currentSkills) => {
    if (!Array.isArray(currentSkills)) {
        return [];
    }

    return currentSkills
        .map((item) => {
            if (!item) {
                return null;
            }

            if (typeof item === 'string') {
                const skill = item.trim();
                return skill ? { skill, level: 'basic' } : null;
            }

            if (typeof item === 'object') {
                const skill = String(item.skill || item.name || '').trim();
                if (!skill) {
                    return null;
                }

                const level = String(item.level || 'basic').trim().toLowerCase() || 'basic';
                return { skill, level };
            }

            const skill = String(item).trim();
            return skill ? { skill, level: 'basic' } : null;
        })
        .filter(Boolean);
};

// ─────────────────────────────────────────────
// POST /api/roadmap/generate
// ─────────────────────────────────────────────
export const generateRoadmap = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Fetch user profile
        const user = await User.findById(userId);
        const roadmapProfile = resolveRoadmapProfile(user || {});
        const profileIsComplete = Boolean(
            user &&
            (user.profile_complete ||
                (roadmapProfile.targetRole &&
                    roadmapProfile.experienceLevel &&
                    roadmapProfile.hoursPerWeek))
        );

        if (!user || !profileIsComplete) {
            return res.status(400).json({
                success: false,
                message: "Complete your profile before generating a roadmap.",
            });
        }

        if (!user.profile_complete) {
            user.profile_complete = true;
            user.target_role = roadmapProfile.targetRole;
            user.experience_level = roadmapProfile.experienceLevel;
            user.hours_per_week = roadmapProfile.hoursPerWeek;
            user.learning_style = roadmapProfile.learningStyle;
            await user.save({ validateBeforeSave: false });
        }

        // 2. Fetch latest skill gap analysis
        const skillGap = await SkillGap.findOne({ user_id: userId }).sort({
            createdAt: -1,
        });

        if (!skillGap) {
            console.info(
                `No skill gap analysis found for user='${userId}'. Generating full roadmap from profile only.`
            );
        }

        // 3. Mark old roadmaps as regenerated
        await Roadmap.updateMany(
            { user_id: userId, status: "active" },
            { status: "regenerated" }
        );

        // 4. Call Python AI service
        const aiPayload = {
            user_id: userId.toString(),
            target_role: roadmapProfile.targetRole,
            experience_level: roadmapProfile.experienceLevel,
            hours_per_week: roadmapProfile.hoursPerWeek,
            learning_style: roadmapProfile.learningStyle,
            skill_gaps: skillGap?.skill_gaps || [],
            skill_scores: skillGap?.skill_scores
                ? Object.fromEntries(skillGap.skill_scores)
                : {},
            current_skills: normalizeCurrentSkillsForAI(user.current_skills),
        };

        let aiResult;
        try {
            const response = await axios.post(
                `${AI_SERVICE_URL}/api/roadmap/generate`,
                aiPayload,
                { timeout: 30000 }
            );
            aiResult = response.data;
        } catch (aiError) {
            console.error("AI service error:", aiError.message);
            return res.status(502).json({
                success: false,
                message: "AI service unavailable. Please try again later.",
                error: aiError.message,
            });
        }

        // 5. Save roadmap to MongoDB
        const roadmap = await Roadmap.create({
            roadmap_id: uuidv4(),
            user_id: userId,
            target_role: roadmapProfile.targetRole,
            experience_level: roadmapProfile.experienceLevel,
            total_duration_weeks: aiResult.total_duration_weeks,
            hours_per_week: roadmapProfile.hoursPerWeek,
            skills: aiResult.skills,
            weekly_plans: aiResult.weekly_plans,
            version: 1,
            status: "active",
            metadata: {
                generated_at: new Date(),
                generation_method: "hybrid",
                ai_model_used:
                    aiResult.model_used || "gpt-4o-mini",
            },
        });

        await User.findByIdAndUpdate(userId, {
            activeRoadmap: roadmap._id,
        });

        res.status(201).json({
            success: true,
            data: {
                roadmap_id: roadmap.roadmap_id,
                duration: roadmap.total_duration_weeks,
                skills: roadmap.skills,
                weekly_plans: roadmap.weekly_plans,
                status: roadmap.status,
            },
        });
    } catch (err) {
        console.error("generateRoadmap error:", err);
        res.status(500).json({
            success: false,
            message: "Server error.",
            error: err.message,
        });
    }
};

// ─────────────────────────────────────────────
// GET /api/roadmap
// ─────────────────────────────────────────────
export const getRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({
            user_id: req.user._id,
            status: "active",
        }).sort({ createdAt: -1 });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "No active roadmap found. Generate one first.",
            });
        }

        res.status(200).json({ success: true, data: roadmap });
    } catch (err) {
        console.error("getRoadmap error:", err);
        res.status(500).json({
            success: false,
            message: "Server error.",
            error: err.message,
        });
    }
};

// ─────────────────────────────────────────────
// GET /api/roadmap/:roadmap_id
// ─────────────────────────────────────────────
export const getRoadmapById = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({
            roadmap_id: req.params.roadmap_id,
            user_id: req.user._id,
        });

        if (!roadmap) {
            return res
                .status(404)
                .json({ success: false, message: "Roadmap not found." });
        }

        res.status(200).json({ success: true, data: roadmap });
    } catch (err) {
        console.error("getRoadmapById error:", err);
        res.status(500).json({
            success: false,
            message: "Server error.",
            error: err.message,
        });
    }
};

// ─────────────────────────────────────────────
// GET /api/roadmap/history
// ─────────────────────────────────────────────
export const getRoadmapHistory = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({
            user_id: req.user._id,
        })
            .sort({ createdAt: -1 })
            .select(
                "roadmap_id target_role total_duration_weeks status version metadata.generated_at"
            );

        res.status(200).json({ success: true, data: roadmaps });
    } catch (err) {
        console.error("getRoadmapHistory error:", err);
        res.status(500).json({
            success: false,
            message: "Server error.",
            error: err.message,
        });
    }
};

// ─────────────────────────────────────────────
// PATCH /api/roadmap/skill-status
// ─────────────────────────────────────────────
export const updateSkillStatus = async (req, res) => {
    try {
        const body = req.body || {};
        const skill = body.skill || body.skill_name;
        const status = body.status;

        if (!skill) {
            return res.status(400).json({
                success: false,
                message: 'Skill is required.',
            });
        }

        if (
            !["pending", "in_progress", "completed", "skipped"].includes(
                status
            )
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid status value." });
        }

        const roadmap = await Roadmap.findOne({
            user_id: req.user._id,
            status: "active",
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "Active roadmap not found.",
            });
        }

        const skillNode = roadmap.skills.find(
            (s) => s.skill === skill
        );
        if (!skillNode) {
            return res.status(404).json({
                success: false,
                message: `Skill "${skill}" not found in roadmap.`,
            });
        }

        skillNode.status = status;
        await roadmap.save();

        res.status(200).json({
            success: true,
            message: "Skill status updated.",
            data: { skill, status },
        });
    } catch (err) {
        console.error("updateSkillStatus error:", err);
        res.status(500).json({
            success: false,
            message: "Server error.",
            error: err.message,
        });
    }
};