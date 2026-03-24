import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/authMiddleware.js';
import {
  parseResume,
  deployPortfolio,
  deployToVercel,
  getUserPortfolios,
  updatePortfolio,
  deletePortfolio,
  getPortfolioByUsername,
  getPortfolio
} from '../controllers/portfolioController.js';

const router = express.Router();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
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
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Parse resume and extract portfolio details
router.post('/parse-resume', protect, upload.single('resume'), parseResume);

// Deploy portfolio and return link
router.post('/deploy', protect, deployPortfolio);

// Deploy portfolio to Vercel
router.post('/deploy-vercel/:portfolioId', protect, deployToVercel);

// Get user's portfolios
router.get('/my-portfolios', protect, getUserPortfolios);

// Update portfolio
router.put('/:portfolioId', protect, updatePortfolio);

// Delete portfolio
router.delete('/:portfolioId', protect, deletePortfolio);

// Public route - Get portfolio by username (no auth required)
router.get('/u/:username', getPortfolioByUsername);

// Public route - Get portfolio by ID (no auth required)
router.get('/:portfolioId', getPortfolio);

export default router;
