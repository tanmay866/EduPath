import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  updateSettings
} from '../controllers/profileController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/profile
router.get('/', getProfile);

// @route   PUT /api/profile
router.put('/', updateProfile);

// @route   PUT /api/profile/settings
router.put('/settings', updateSettings);

export default router;
