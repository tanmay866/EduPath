import express from 'express';
import {
  getQuestion,
  evaluate,
  getSummary
} from '../controllers/mockInterviewController.js';
import {
  createInterviewResult,
  getInterviewHistory,
  getInterviewResultById,
} from '../controllers/interviewResultController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { isStudent } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// The role now comes from the user's profile; the canonical list is served
// by GET /api/career-roles rather than a second one kept here.

// Protected routes - require authentication
router.post('/question', protect, getQuestion);
router.post('/evaluate', protect, evaluate);
router.post('/summary', protect, getSummary);

// Saved interview results
router.post('/results', protect, isStudent, createInterviewResult);
router.get('/results', protect, isStudent, getInterviewHistory);
router.get('/results/:resultId', protect, isStudent, getInterviewResultById);

export default router;
