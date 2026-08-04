import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate JWT token for user authentication
 * 
 * @param {string} userId - User's MongoDB _id
 * @param {string} role - User's role (student/admin)
 * @returns {string} JWT token
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId,
      role: role 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

/**
 * Verify JWT token
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate reset password token
 * 
 * @returns {Object} Object containing token and hashed token
 */
export const generateResetToken = () => {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token for database storage
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  return {
    resetToken,
    hashedToken,
  };
};

/**
 * Hash reset token for comparison
 * 
 * @param {string} token - Plain reset token
 * @returns {string} Hashed token
 */
export const hashResetToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

/**
 * Generate a 6-digit email verification code.
 *
 * randomInt rather than Math.random: the code is a credential, and Math.random
 * is neither uniform nor unpredictable. Only the hash is ever stored, so a leak
 * of the database does not hand out working codes.
 *
 * @returns {{otp: string, hashedOtp: string}}
 */
export const generateOtp = () => {
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');

  return {
    otp,
    hashedOtp: hashOtp(otp),
  };
};

/**
 * Hash a verification code for comparison against the stored value.
 *
 * @param {string} otp - the 6-digit code
 * @returns {string} sha256 hex digest
 */
export const hashOtp = (otp) => {
  return crypto
    .createHash('sha256')
    .update(String(otp))
    .digest('hex');
};

/**
 * Create token response object
 * 
 * @param {Object} user - User object
 * @param {string} token - JWT token
 * @returns {Object} Response object with user and token
 */
export const createTokenResponse = (user, token) => {
  return {
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      loginId: user.loginId,
      role: user.role,
    },
  };
};

export default {
  generateToken,
  verifyToken,
  generateResetToken,
  hashResetToken,
  createTokenResponse,
};