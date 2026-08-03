import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  generateResume,
  convertResumeToPdf,
  downloadResume,
  getResumeHistory,
  getResumeVersion,
  deleteResume
} from '../controllers/resumeGeneratorController.js';

const router = express.Router();

// Generate resume from user data (PDF or DOCX)
router.post('/generate', protect, generateResume);

// Convert a previously generated resume to PDF
router.post('/convert-to-pdf', protect, convertResumeToPdf);

// Download generated resume file
router.get('/download/:filename', protect, downloadResume);

// Get resume version history for logged-in user
router.get('/history', protect, getResumeHistory);

// Get specific resume version data
router.get('/version/:version', protect, getResumeVersion);

// Delete resume by ID
router.delete('/:id', protect, deleteResume);

export default router;
