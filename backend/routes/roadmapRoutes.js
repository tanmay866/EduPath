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

export default router;