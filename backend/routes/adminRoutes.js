import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import {
  getOverview,
  getUsers,
  toggleUserBlock,
  deleteUser,
  getAttempts,
  getRoadmaps,
  getAnalytics,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import { listFeedback, updateFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

// Every route here is behind both a valid session and the admin role. Setting
// role to 'admin' in the browser only changes which screens render — the data
// is refused without the role on the account itself.
router.use(protect, isAdmin);

router.get('/overview', getOverview);
router.get('/users', getUsers);
router.patch('/users/:id/block', toggleUserBlock);
router.delete('/users/:id', deleteUser);
router.get('/attempts', getAttempts);
router.get('/roadmaps', getRoadmaps);
router.get('/analytics', getAnalytics);
router.get('/feedback', listFeedback);
router.patch('/feedback/:id', updateFeedback);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
