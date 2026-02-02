import User from '../models/userModel.js';
import { asyncHandler } from '../middlewares/errorMiddleware.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import { generateToken, generateResetToken, hashResetToken, createTokenResponse } from '../utils/tokenUtils.js';
import generateUserId from '../utils/generateUserId.js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangeEmail } from '../utils/sendEmail.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return next(new AppError('User with this email already exists', 400));
    }

    // Generate unique login ID
    const loginId = await generateUserId(firstName, lastName);

    // Create user
    const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        loginId,
        role,
    });

    // Send welcome email with credentials
    try {
        await sendWelcomeEmail(user, password);
        console.log('✅ Welcome email sent to:', user.email);
    } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError.message);
        // Don't fail registration if email fails, just log it
    }
    
    console.log('✅ User created - Login ID:', loginId);

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Send response
    res.status(201).json({
        success: true,
        message: 'Account created successfully. Login credentials sent to your email.',
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            loginId: user.loginId,
            role: user.role,
        },
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
    const { loginId, email, password } = req.body;

    // Build query based on provided credentials
    let query = {};
    if (loginId) {
        query.loginId = loginId.toUpperCase();
    } else if (email) {
        query.email = email.toLowerCase();
    }

    // Find user and include password field
    const user = await User.findOne(query).select('+password');

    if (!user) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
        return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Send response
    res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            loginId: user.loginId,
            role: user.role,
            lastLogin: user.lastLogin,
        },
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
    // User is already attached to req by protect middleware
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            loginId: user.loginId,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
        },
    });
});

/**
 * @desc    Forgot password - Send reset token via email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        return next(new AppError('No user found with this email address', 404));
    }

    // Generate reset token
    const { resetToken, hashedToken } = generateResetToken();

    // Save hashed token and expiry to database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
        await sendPasswordResetEmail(user, resetToken);
        console.log('✅ Password reset email sent to:', user.email);

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email',
        });
    } catch (emailError) {
        console.error('❌ Failed to send reset email:', emailError.message);
        // If email fails, remove reset token from database
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('Failed to send reset email. Please try again later.', 500));
    }
});

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password/:resetToken
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Hash the token from URL to compare with database
    const hashedToken = hashResetToken(resetToken);

    // Find user with valid reset token and not expired
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
        return next(new AppError('Invalid or expired reset token', 400));
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send confirmation email
    try {
        await sendPasswordChangeEmail(user);
        console.log('✅ Password change confirmation sent to:', user.email);
    } catch (emailError) {
        console.error('❌ Failed to send password change confirmation:', emailError.message);
    }

    // Generate new JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
        success: true,
        message: 'Password reset successful',
        token,
    });
});

/**
 * @desc    Change password (for logged in users)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
        return next(new AppError('Current password is incorrect', 401));
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    try {
        await sendPasswordChangeEmail(user);
        console.log('✅ Password change confirmation sent to:', user.email);
    } catch (emailError) {
        console.error('❌ Failed to send password change confirmation:', emailError.message);
    }

    // Generate new JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        token,
    });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res, next) => {
    // Since we're using JWT, logout is handled client-side by removing the token
    // This endpoint is just for consistency and can be used for logging purposes

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});

export default {
    signup,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    changePassword,
    logout,
};