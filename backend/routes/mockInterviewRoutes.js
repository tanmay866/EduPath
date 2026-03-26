import express from 'express';
import {
  getQuestion,
  evaluate,
  getSummary,
  getRoles
} from '../controllers/mockInterviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get available interview roles (public)
router.get('/roles', getRoles);

// Protected routes - require authentication
router.post('/question', protect, getQuestion);
router.post('/evaluate', protect, evaluate);
router.post('/summary', protect, getSummary);

export default router;
