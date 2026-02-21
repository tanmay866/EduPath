import express from 'express';
import {
  startQuiz,
  submitQuiz,
  getQuizSession,
  getQuizResult,
  abandonQuiz,
  getQuizHistory,
  getQuizStats,
  retryQuiz,
} from '../controllers/quizController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { isStudent } from '../middlewares/roleMiddleware.js';
import {
  startQuizValidation,
  submitQuizValidation,
  sessionIdValidation,
  resultIdValidation,
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/start', isStudent, startQuizValidation, startQuiz);
router.get('/session/:sessionId', isStudent, sessionIdValidation, getQuizSession);
router.put('/session/:sessionId/abandon', isStudent, sessionIdValidation, abandonQuiz);
router.post('/submit', isStudent, submitQuizValidation, submitQuiz);
router.get('/result/:resultId', isStudent, resultIdValidation, getQuizResult);
router.post('/result/:resultId/retry', isStudent, resultIdValidation, retryQuiz);
router.get('/history', isStudent, getQuizHistory);
router.get('/stats', isStudent, getQuizStats);

export default router;