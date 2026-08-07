import express from "express";
const router = express.Router();
import { protect } from "../middlewares/authMiddleware.js";

import {
    generateRoadmap,
    getRoadmap,
    getRoadmapById,
    getRoadmapHistory,
    updateSkillStatus,
    updateTaskStatus,
    analyseJobPosting,
    adaptRoadmap,
    deleteRoadmap,
    deleteSupersededRoadmaps,
} from "../controllers/roadmapController.js";

router.use(protect);

router.post("/generate", generateRoadmap);
router.get("/", getRoadmap);
router.get("/history", getRoadmapHistory);
router.get("/:roadmap_id", getRoadmapById);
router.patch("/skill-status", updateSkillStatus);
router.patch("/task-status", updateTaskStatus);
router.post("/analyse-job", analyseJobPosting);
router.post("/adapt", adaptRoadmap);
// Before the parameterised route below, which would otherwise match
// "superseded" as a roadmap id and answer "no longer exists".
router.delete("/superseded", deleteSupersededRoadmaps);
// Last: a literal path must not be swallowed by this catch-all.
router.delete("/:roadmap_id", deleteRoadmap);

export default router;