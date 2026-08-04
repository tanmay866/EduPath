import express from 'express';
import {
  signup,
  login,
  verifyOtp,
  resendOtp,
  deleteAccount,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import {
  signupValidation,
  loginValidation,
  verifyOtpValidation,
  resendOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  deleteAccountValidation,
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/verify-otp', verifyOtpValidation, verifyOtp);
router.post('/resend-otp', resendOtpValidation, resendOtp);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:resetToken', resetPasswordValidation, resetPassword);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.post('/logout', protect, logout);
router.delete('/account', protect, deleteAccountValidation, deleteAccount);

export default router;