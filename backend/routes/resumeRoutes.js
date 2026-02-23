import express from 'express';
import { uploadResume, getResumes, deleteResume } from '../controllers/resumeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getResumes)
  .post(uploadResume);

router.delete('/:id', deleteResume);

export default router;
