import express from 'express';
import {
  createPracticeResult,
  getPracticeHistory,
  getPracticeResultById,
} from '../controllers/practiceResultController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { isStudent } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect, isStudent);
router.post('/results', createPracticeResult);
router.get('/results', getPracticeHistory);
router.get('/results/:resultId', getPracticeResultById);

export default router;
