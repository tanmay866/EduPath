import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  updateSettings,
  uploadProfilePicture,
  deleteProfilePicture,
  updateBasic,
  updateSkills,
  updateAvailability
} from '../controllers/profileController.js';

const router = express.Router();


router.use(protect);
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/basic', updateBasic);
router.put('/skills', updateSkills);
router.put('/availability', updateAvailability);
router.put('/settings', updateSettings);
router.post('/upload-picture', uploadProfilePicture);
router.delete('/delete-picture', deleteProfilePicture);

export default router;
