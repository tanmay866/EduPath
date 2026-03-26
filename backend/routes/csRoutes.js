import express from 'express';
import { getCSQuestions, getCategories } from '../controllers/csController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes (for now, can add authentication later)
router.get('/questions', protect, getCSQuestions);
router.get('/categories', getCategories);

export default router;
