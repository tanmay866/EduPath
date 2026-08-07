import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { submitFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

// Signed in only. A report needs an account behind it so it can be followed
// up, and the contact form already covers anyone who is not signed in.
router.post('/', protect, submitFeedback);

export default router;
