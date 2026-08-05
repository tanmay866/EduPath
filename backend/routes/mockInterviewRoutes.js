import express from 'express';
import {
  getQuestion,
  evaluate,
  getSummary,
  getRoles
} from '../controllers/mockInterviewController.js';
import {
  createInterviewResult,
  getInterviewHistory,
  getInterviewResultById,
} from '../controllers/interviewResultController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { isStudent } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Get available interview roles (public)
router.get('/roles', getRoles);

// Protected routes - require authentication
router.post('/question', protect, getQuestion);
router.post('/evaluate', protect, evaluate);
router.post('/summary', protect, getSummary);

// Saved interview results
router.post('/results', protect, isStudent, createInterviewResult);
router.get('/results', protect, isStudent, getInterviewHistory);
router.get('/results/:resultId', protect, isStudent, getInterviewResultById);

export default router;
