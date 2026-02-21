import { body, param, validationResult } from 'express-validator';

/**
 * Middleware to handle validation results uniformly
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path, // Using 'path' (Express Validator v7 standard)
        message: err.msg,
      })),
    });
  }

  next();
};

/**
 * Validation rules for user signup
 */
export const signupValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(), // Added for consistency 

  // Updated to match the strictness of reset password
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Invalid role. Must be either student or admin'),

  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  body().custom((value, { req }) => {
    if (!req.body.loginId && !req.body.email) {
      throw new Error('Either loginId or email must be provided');
    }
    return true;
  }),

  handleValidationErrors,
];

/**
 * Validation rules for forgot password
 */
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  handleValidationErrors,
];

/**
 * Validation rules for reset password
 */
export const resetPasswordValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidationErrors,
];

/**
 * Validation rules for change password
 */
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidationErrors,
];

/**
 * Validation for result ID parameter
 */
export const resultIdValidation = [
  param('resultId')
    .isMongoId()
    .withMessage('Invalid result ID format'),
  
  handleValidationErrors, // Added handler
];

/**
 * Validation for starting a quiz
 */
export const startQuizValidation = [
  body('topicId')
    .notEmpty()
    .withMessage('Topic ID is required')
    .isMongoId()
    .withMessage('Invalid topic ID format'),
  
  body('difficulty')
    .notEmpty()
    .withMessage('Difficulty level is required')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  
  body('experienceLevel')
    .notEmpty()
    .withMessage('Experience level is required')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Experience level must be beginner, intermediate, or advanced'),
  
  body('questionCount')
    .optional()
    .isInt({ min: 5, max: 30 })
    .withMessage('Question count must be between 5 and 30'),

  handleValidationErrors, // Added handler
];

/**
 * Validation for submitting quiz answers
 */
export const submitQuizValidation = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isMongoId()
    .withMessage('Invalid session ID format'),
  
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers must be a non-empty array'),
  
  body('answers.*')
    .isInt({ min: 0, max: 3 })
    .withMessage('Each answer must be a number between 0 and 3'),

  handleValidationErrors, // Added handler
];

/**
 * Validation for session ID parameter
 */
export const sessionIdValidation = [
  param('sessionId')
    .isMongoId()
    .withMessage('Invalid session ID format'),

  handleValidationErrors, // Added handler
];

export default {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  resultIdValidation,
  startQuizValidation,
  submitQuizValidation,
  sessionIdValidation,
  handleValidationErrors,
};