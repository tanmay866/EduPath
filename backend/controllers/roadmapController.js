import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Roadmap from "../models/Roadmap.js";
import User from "../models/userModel.js";
import SkillGap from "../models/SkillGap.js";
import Topic from "../models/Topic.js";
import { topicForSkill } from "../utils/skillTopicMap.js";
import { scheduleForPlan } from "../utils/planSchedule.js";
import {
    canDeleteRoadmap,
    isCurrentPlan,
    progressHeldBy,
} from "../utils/roadmapDeletion.js";
import Settings from "../models/Settings.js";
import { mergeRoadmapProgress } from "../utils/mergeRoadmapProgress.js";

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

const resolveRoadmapProfile = (user, settings) => {
    const targetRole = user.target_role || "";
    // The admin's default is the fallback, which is what "used when a learner
    // does not pick one" on the settings screen has always claimed. Without it
    // an unset level reached the generator as "" and silently took a 1.0
    // multiplier, so the setting could be changed with no effect at all.
    const experienceLevel =
        normalizeExperienceLevel(
            user.experience_level || user.profile?.occupation?.experienceLevel
        ) || normalizeExperienceLevel(settings?.defaultLevel) || "beginner";
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
        const [user, settings] = await Promise.all([
            User.findById(userId),
            Settings.current(),
        ]);
        const roadmapProfile = resolveRoadmapProfile(user || {}, settings);
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

        // 2. Fetch the skill gap analysis for this role. Scores earned against
        // a different curriculum use different skill names, so they would
        // never match this role's template — reading them would be noise.
        const skillGap = await SkillGap.findOne({
            user_id: userId,
            target_role: roadmapProfile.targetRole,
        }).sort({
            createdAt: -1,
        });

        if (!skillGap) {
            console.info(
                `No skill gap analysis found for user='${userId}' role='${roadmapProfile.targetRole}'. Generating full roadmap from profile only.`
            );
        }

        // 3. Supersede the previous roadmap for this role only, so a plan for
        // another track the user may return to is left alone.
        await Roadmap.updateMany(
            { user_id: userId, status: "active", target_role: roadmapProfile.targetRole },
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
            // Derived rather than stored: one score per skill, kept on
            // skill_gaps, reshaped into the name->score map the AI service
            // expects. Skill names legitimately contain dots.
            skill_scores: Object.fromEntries(
                (skillGap?.skill_gaps || []).map((gap) => [gap.skill, gap.current_score])
            ),
            current_skills: normalizeCurrentSkillsForAI(user.current_skills),
            // "Modules per roadmap" on the admin settings screen. Applied in
            // the generator, after the dependency sort, so the skills that
            // survive still arrive in a workable order.
            max_modules: settings.maxModules,
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
                // Record what the AI service actually reports. The old default
                // labelled roadmaps "gpt-4o-mini" even though no OpenAI client
                // exists anywhere in this project, so stored provenance was wrong.
                generation_method: aiResult.model_used || "unknown",
                ai_model_used: aiResult.model_used || "unknown",
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
        // Show the plan for the role the user is currently working towards.
        // Changing role therefore reveals that role's roadmap rather than a
        // stale one for a track they have left, and changing back brings the
        // original plan straight back instead of forcing a regenerate.
        const user = await User.findById(req.user._id).select("target_role");
        const query = { user_id: req.user._id, status: "active" };
        if (user?.target_role) {
            query.target_role = user.target_role;
        }

        const roadmap = await Roadmap.findOne(query).sort({ createdAt: -1 });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "No active roadmap found. Generate one first.",
            });
        }

        res.status(200).json({
            success: true,
            // Worked out on read so it can never disagree with the ticks it
            // is counting.
            data: { ...roadmap.toObject(), schedule: scheduleForPlan(roadmap) },
        });
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
        }).lean();

        if (!roadmap) {
            return res
                .status(404)
                .json({ success: false, message: "Roadmap not found." });
        }

        // A plan is built from the skill gaps known at the time. Assessments
        // taken since then are not reflected in it, and nothing regenerates
        // automatically — so the screen needs to be able to say so rather
        // than presenting an out-of-date plan as current.
        const skillGap = await SkillGap.findOne({
            user_id: req.user._id,
            target_role: roadmap.target_role,
        })
            .select("updatedAt")
            .lean();

        const assessedAt = skillGap?.updatedAt || null;

        // Marking a skill done is self-reported. Where a skill has a topic in
        // the quiz catalogue, the plan can offer to test it instead — so each
        // skill carries the topic that covers it, when one exists. Skills like
        // "REST API Design" have no topic and simply carry none.
        const topicNames = [
            ...new Set(
                (roadmap.skills || []).map((s) => topicForSkill(s.skill)).filter(Boolean)
            ),
        ];
        const topicIdByName = new Map(
            topicNames.length
                ? (await Topic.find({ name: { $in: topicNames }, isActive: true })
                      .select("name")
                      .lean()).map((t) => [t.name, String(t._id)])
                : []
        );

        const skills = (roadmap.skills || []).map((s) => {
            const topicName = topicForSkill(s.skill);
            const topicId = topicName ? topicIdByName.get(topicName) : undefined;
            return topicId ? { ...s, quiz_topic_id: topicId, quiz_topic_name: topicName } : s;
        });

        res.status(200).json({
            success: true,
            data: {
                ...roadmap,
                schedule: scheduleForPlan(roadmap),
                skills,
                is_stale: Boolean(assessedAt && new Date(assessedAt) > new Date(roadmap.createdAt)),
                assessed_at: assessedAt,
            },
        });
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
        const [user, roadmaps] = await Promise.all([
            User.findById(req.user._id).select("target_role").lean(),
            Roadmap.find({ user_id: req.user._id })
                .sort({ createdAt: -1 })
                .select(
                    "roadmap_id target_role total_duration_weeks status version metadata.generated_at started_at skills weekly_plans"
                )
                .lean(),
        ]);

        // Thirteen rows reading "AI/ML Engineer" with only a date to tell them
        // apart is a list nobody can act on — least of all to decide which one
        // to delete. Each row says how long the plan is, how much of it was
        // finished, and whether it is the one being worked from.
        const data = roadmaps.map((roadmap) => {
            const { skills, weekly_plans: weeks, ...rest } = roadmap;
            return {
                ...rest,
                skill_count: (skills || []).length,
                week_count: (weeks || []).length,
                progress: progressHeldBy(roadmap),
                is_current: isCurrentPlan(roadmap, user?.target_role),
                can_delete: canDeleteRoadmap(roadmap, user?.target_role).allowed,
            };
        });

        res.status(200).json({ success: true, data });
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

/**
 * PATCH /api/roadmap/task-status — tick or untick one task in a week.
 *
 * Weeks already had a status but nothing could set it, and the smallest thing
 * a learner could mark was a whole skill — three and a half weeks of work on
 * the MERN track between one tick and the next. This is the unit people
 * actually finish in an evening.
 */
export const updateTaskStatus = async (req, res) => {
    try {
        const { week_number: weekNumber, task_index: taskIndex, done } = req.body || {};

        if (!Number.isInteger(weekNumber) || !Number.isInteger(taskIndex)) {
            return res.status(400).json({
                success: false,
                message: "week_number and task_index must be integers.",
            });
        }
        if (typeof done !== "boolean") {
            return res.status(400).json({ success: false, message: "done must be true or false." });
        }

        const roadmap = await Roadmap.findOne({ user_id: req.user._id, status: "active" });
        if (!roadmap) {
            return res.status(404).json({ success: false, message: "Active roadmap not found." });
        }

        const week = roadmap.weekly_plans.find((w) => w.week_number === weekNumber);
        if (!week) {
            return res.status(404).json({ success: false, message: `Week ${weekNumber} not found.` });
        }
        // Bounds are checked against the stored tasks, so an index from a stale
        // page cannot write a tick that points at nothing.
        if (taskIndex < 0 || taskIndex >= week.tasks.length) {
            return res.status(400).json({
                success: false,
                message: `Week ${weekNumber} has ${week.tasks.length} tasks; ${taskIndex} is not one of them.`,
            });
        }

        const ticked = new Set((week.completed_tasks || []).map(Number));
        if (done) ticked.add(taskIndex);
        else ticked.delete(taskIndex);
        week.completed_tasks = [...ticked].sort((a, b) => a - b);

        // The week's own status follows its tasks rather than being set by
        // hand, so the two can never disagree.
        const total = week.tasks.length;
        const complete = week.completed_tasks.length;
        week.status = complete === 0 ? "pending" : complete >= total ? "completed" : "in_progress";

        await roadmap.save();

        res.status(200).json({
            success: true,
            data: {
                week_number: weekNumber,
                completed_tasks: week.completed_tasks,
                status: week.status,
                total_tasks: total,
            },
        });
    } catch (err) {
        console.error("updateTaskStatus error:", err);
        res.status(500).json({ success: false, message: "Server error.", error: err.message });
    }
};

/**
 * POST /api/roadmap/analyse-job — read a job posting against the curriculum.
 *
 * The ATS check already parses a posting, but only to score a CV against it.
 * This asks the question a learner actually arrives with: can I do this job,
 * and if not, how far off am I.
 *
 * What counts as "already have" comes from two places — the skills on the
 * profile, and skills assessed at or above the pass mark. A skill someone
 * scored 40% on is not one they have, and scheduling it is the point.
 */
export const analyseJobPosting = async (req, res) => {
    try {
        const jobDescription = (req.body?.jobDescription || "").trim();
        if (jobDescription.length < 20) {
            return res.status(400).json({
                success: false,
                message: "Paste the job posting — a line or two is not enough to read.",
            });
        }

        const user = await User.findById(req.user._id).select(
            "current_skills target_role hours_per_week experience_level"
        );

        // Assessed skills count only if they were actually passed.
        const gap = await SkillGap.findOne({
            user_id: req.user._id,
            target_role: user?.target_role,
        }).lean();
        const passed = (gap?.skill_gaps || [])
            .filter((g) => Number(g.current_score) >= 70)
            .map((g) => g.skill);

        const known = [
            ...normalizeCurrentSkillsForAI(user?.current_skills).map((s) => s.skill || s),
            ...passed,
        ].filter(Boolean);

        const { data } = await axios.post(
            `${AI_SERVICE_URL}/api/jobs/analyse`,
            {
                job_description: jobDescription,
                known_skills: known,
                hours_per_week: user?.hours_per_week || 10,
                experience_level: user?.experience_level || "beginner",
                role_hint: req.body?.roleHint || null,
            },
            { timeout: 20000 }
        );

        // Attach the quiz topic that covers each missing skill, the same way
        // the roadmap does, so "assess these skills" can open the quiz on one
        // of them instead of leaving the learner to find it in a list of 29.
        // Skills with no topic in the catalogue simply carry none.
        // Kept in the order the skills are missing rather than whatever order
        // the lookup returns, so the first one offered is the first gap named.
        const missingTopicNames = [
            ...new Set((data?.missing || []).map((s) => topicForSkill(s)).filter(Boolean)),
        ];
        const idByName = new Map(
            missingTopicNames.length
                ? (await Topic.find({ name: { $in: missingTopicNames }, isActive: true })
                      .select("name")
                      .lean()).map((t) => [t.name, String(t._id)])
                : []
        );
        const missingTopics = missingTopicNames
            .filter((name) => idByName.has(name))
            .map((name) => ({ topicId: idByName.get(name), topicName: name }));

        return res.status(200).json({
            success: true,
            data: { ...data, missing_topics: missingTopics },
        });
    } catch (err) {
        if (err.response || err.request) {
            console.error("Job analysis service error:", err.message);
            return res.status(503).json({
                success: false,
                message: "The analysis service is not reachable. Try again in a moment.",
            });
        }
        console.error("analyseJobPosting error:", err);
        return res.status(500).json({ success: false, message: "Server error.", error: err.message });
    }
};

/**
 * POST /api/roadmap/adapt — rebuild the active plan around newer results,
 * keeping the progress made on it.
 *
 * The stale notice used to offer only "Regenerate", which writes a new
 * document, supersedes the old one, and leaves every completed skill and every
 * ticked task behind in history. So the offer to rebuild around a fresh
 * assessment was really an offer to start again, and for anyone a few weeks in
 * the sensible answer was to ignore it.
 *
 * This rebuilds the same document. Skills carry by name and ticks carry by
 * what the task says, so the plan can reorder and renumber freely without
 * losing the work — see utils/mergeRoadmapProgress.js for why neither can be
 * carried by position.
 *
 * Regenerate is still there for a genuine restart. This is the other case.
 */
export const adaptRoadmap = async (req, res) => {
    try {
        const userId = req.user._id;
        const [user, settings] = await Promise.all([User.findById(userId), Settings.current()]);
        const roadmapProfile = resolveRoadmapProfile(user || {}, settings);

        const roadmap = await Roadmap.findOne({
            user_id: userId,
            status: "active",
            ...(roadmapProfile.targetRole ? { target_role: roadmapProfile.targetRole } : {}),
        }).sort({ createdAt: -1 });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "No active roadmap to adapt. Generate one first.",
            });
        }

        const skillGap = await SkillGap.findOne({
            user_id: userId,
            target_role: roadmapProfile.targetRole,
        }).sort({ createdAt: -1 });

        let aiResult;
        try {
            const response = await axios.post(
                `${AI_SERVICE_URL}/api/roadmap/generate`,
                {
                    user_id: userId.toString(),
                    target_role: roadmapProfile.targetRole,
                    experience_level: roadmapProfile.experienceLevel,
                    hours_per_week: roadmapProfile.hoursPerWeek,
                    learning_style: roadmapProfile.learningStyle,
                    skill_gaps: skillGap?.skill_gaps || [],
                    skill_scores: Object.fromEntries(
                        (skillGap?.skill_gaps || []).map((gap) => [gap.skill, gap.current_score])
                    ),
                    current_skills: normalizeCurrentSkillsForAI(user.current_skills),
                    max_modules: settings.maxModules,
                },
                { timeout: 30000 }
            );
            aiResult = response.data;
        } catch (aiError) {
            console.error("AI service error during adapt:", aiError.message);
            // The existing plan is untouched, so saying so is the whole
            // recovery — nothing has been half-rewritten.
            return res.status(503).json({
                success: false,
                message: "Could not rebuild the plan just now. Your current one is unchanged.",
            });
        }

        const previous = {
            skills: roadmap.skills.map((s) => ({ skill: s.skill, status: s.status })),
            weekly_plans: roadmap.weekly_plans.map((w) => ({
                week_number: w.week_number,
                skills: [...(w.skills || [])],
                tasks: [...(w.tasks || [])],
                completed_tasks: [...(w.completed_tasks || [])],
            })),
        };

        const next = {
            skills: aiResult.skills || [],
            weekly_plans: aiResult.weekly_plans || [],
        };
        const carried = mergeRoadmapProgress(previous, next);

        roadmap.skills = next.skills;
        roadmap.weekly_plans = next.weekly_plans;
        roadmap.total_duration_weeks = aiResult.total_duration_weeks;
        roadmap.metadata = { ...(roadmap.metadata || {}), last_adapted_at: new Date() };
        await roadmap.save();

        return res.status(200).json({
            success: true,
            message: "Plan rebuilt around your latest results.",
            data: {
                roadmap_id: roadmap.roadmap_id,
                total_duration_weeks: roadmap.total_duration_weeks,
                skills_carried: carried.skillsCarried,
                ticks_carried: carried.ticksCarried,
                ticks_dropped: carried.ticksDropped,
            },
        });
    } catch (err) {
        console.error("adaptRoadmap error:", err);
        return res.status(500).json({ success: false, message: "Server error.", error: err.message });
    }
};

// ─────────────────────────────────────────────
// DELETE /api/roadmap/:roadmap_id
// ─────────────────────────────────────────────
/**
 * Throws a saved plan away for good.
 *
 * Regenerating keeps the old plan every time, so history fills with
 * near-identical entries and clearing it out is a fair thing to want. This is
 * a real delete rather than a hidden flag: a list that still holds everything
 * it claims to have removed is the same clutter with a filter over it, and
 * the learner asked for the row to be gone.
 *
 * The plan being worked from is refused. It is reachable from every screen,
 * and deleting it would empty the roadmap page with no way back — generating
 * a new one supersedes it first, which is the ordinary path.
 */
export const deleteRoadmap = async (req, res) => {
    try {
        const [user, roadmap] = await Promise.all([
            User.findById(req.user._id).select("target_role").lean(),
            Roadmap.findOne({
                roadmap_id: req.params.roadmap_id,
                // Scoped to the owner, so a guessed id reads as missing
                // rather than as someone else's plan.
                user_id: req.user._id,
            }),
        ]);

        const verdict = canDeleteRoadmap(roadmap, user?.target_role);
        if (!verdict.allowed) {
            return res
                .status(roadmap ? 409 : 404)
                .json({ success: false, message: verdict.reason });
        }

        // Reported back so the confirmation can say what was actually lost,
        // rather than the caller having to remember what it asked to delete.
        const progress = progressHeldBy(roadmap);
        await Roadmap.deleteOne({ _id: roadmap._id });

        return res.status(200).json({
            success: true,
            message: "Roadmap deleted.",
            data: {
                roadmap_id: roadmap.roadmap_id,
                target_role: roadmap.target_role,
                progress,
            },
        });
    } catch (err) {
        console.error("deleteRoadmap error:", err);
        return res
            .status(500)
            .json({ success: false, message: "Server error.", error: err.message });
    }
};
