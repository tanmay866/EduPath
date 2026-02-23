import express from 'express';
import { sendContactMessage } from '../controllers/contactController.js';

const router = express.Router();

/**
 * @route   POST /api/contact/send
 * @desc    Send contact form message
 * @access  Public
 */
router.post('/send', sendContactMessage);

export default router;
