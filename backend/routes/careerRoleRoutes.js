import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { CAREER_ROLES } from '../utils/careerRoles.js';

/**
 * The list of career tracks, served so the client never keeps its own copy.
 *
 * A second hard-coded list on the frontend is how the role vocabularies drifted
 * apart in the first place; this keeps careerRoles.js the only definition.
 */
const router = express.Router();

router.get('/', protect, (req, res) => {
  res.status(200).json({ success: true, data: CAREER_ROLES });
});

export default router;
