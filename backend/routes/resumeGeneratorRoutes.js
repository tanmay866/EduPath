import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  generateResume,
  downloadResume,
  getResumeHistory,
  getResumeVersion,
  deleteResume
} from '../controllers/resumeGeneratorController.js';

const router = express.Router();

// Generate resume from user data (PDF or DOCX)
router.post('/generate', protect, generateResume);

// Download generated resume file
router.get('/download/:filename', downloadResume);

// Get resume version history for logged-in user
router.get('/history', protect, getResumeHistory);

// Get specific resume version data
router.get('/version/:version', protect, getResumeVersion);

// Delete resume by ID
router.delete('/:id', protect, deleteResume);

export default router;
