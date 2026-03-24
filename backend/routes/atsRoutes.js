import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/authMiddleware.js';
import { analyzeResume, generateReport } from '../controllers/atsController.js';

const router = express.Router();

// Configure multer for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  }
});

// @route   POST /api/ats/analyze
// @desc    Analyze resume with ATS scoring using Sentence Transformers
// @access  Private
router.post('/analyze', protect, upload.single('resume'), analyzeResume);

// @route   POST /api/ats/generate-report
// @desc    Generate PDF report for ATS analysis results
// @access  Private
router.post('/generate-report', protect, generateReport);

export default router;
