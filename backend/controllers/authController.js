import User from '../models/userModel.js';
import Roadmap from '../models/Roadmap.js';
import SkillGap from '../models/SkillGap.js';
import QuizSession from '../models/QuizSession.js';
import QuizResult from '../models/QuizResult.js';
import PracticeResult from '../models/PracticeResult.js';
import InterviewResult from '../models/InterviewResult.js';
import ProgressLog from '../models/ProgressLog.js';
import Portfolio from '../models/Portfolio.js';
import Resume from '../models/Resume.js';
import GeneratedResume from '../models/GeneratedResume.js';
import cloudinary from '../config/cloudinaryConfig.js';
import { asyncHandler } from '../middlewares/errorMiddleware.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import { generateToken, generateResetToken, hashResetToken, createTokenResponse, generateOtp, hashOtp } from '../utils/tokenUtils.js';
import generateUserId, { isDuplicateLoginIdError } from '../utils/generateUserId.js';
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangeEmail, sendAccountDeletedEmail } from '../utils/sendEmail.js';

// How long a verification code stays valid. Matches the password-reset window.
const OTP_EXPIRY_MINUTES = 10;

/**
 * Issue a fresh verification code, store only its hash, and email the code.
 * Used by both signup and resend so the two cannot drift apart.
 */
const issueVerificationCode = async (user) => {
    const { otp, hashedOtp } = generateOtp();

    user.emailVerificationToken = hashedOtp;
    user.emailVerificationExpires = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    return sendVerificationEmail(user, otp, OTP_EXPIRY_MINUTES);
};

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

    // Generate the login ID and create the user, stepping to the next serial if
    // a concurrent signup claimed this one. The unique index is the real
    // guarantee; without this retry that race surfaced to the user as
    // "LoginId 'XXXX2026006' already exists" and the signup simply failed.
    const MAX_LOGIN_ID_ATTEMPTS = 5;
    let user;
    let loginId;

    for (let attempt = 0; attempt < MAX_LOGIN_ID_ATTEMPTS; attempt++) {
        loginId = await generateUserId(firstName, lastName, attempt);

        try {
            user = await User.create({
                firstName,
                lastName,
                email: email.toLowerCase(),
                password,
                loginId,
                role,
            });
            break;
        } catch (error) {
            if (!isDuplicateLoginIdError(error) || attempt === MAX_LOGIN_ID_ATTEMPTS - 1) {
                throw error;
            }
        }
    }

    console.log('✅ User created - Login ID:', loginId);

    // No token here: the account cannot be used until the emailed code is
    // entered, so handing out credentials now would defeat the check.
    res.status(201).json({
        success: true,
        requiresVerification: true,
        message: 'Account created. Enter the 6-digit code we emailed you to finish signing up.',
        user: {
            email: user.email,
            loginId: user.loginId,
        },
    });

    // Emailed after responding. Delivery can stall for a long time on hosts that
    // throttle outbound SMTP, and a signup that had already succeeded looked
    // like a timeout to the caller; their retry then failed with "email already
    // exists". If this send fails the user can ask for a new code.
    issueVerificationCode(user)
        .then(() => console.log('✅ Verification code sent to:', user.email))
        .catch((emailError) => console.error('❌ Failed to send verification code:', emailError.message));
});

/**
 * @desc    Permanently delete the caller's account and everything they own
 * @route   DELETE /api/auth/account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res, next) => {
    const { password } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Re-authenticate. A stolen session should not be enough to destroy an
    // account, and this is the one action with nothing to undo it.
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new AppError('Password is incorrect', 401));
    }

    const userId = user._id;

    // Remove uploaded files first: once the documents holding their public ids
    // are gone, the assets would be orphaned in Cloudinary with no way to find
    // them. Failures here must not abort the deletion — a leftover file is a
    // smaller problem than an account that cannot be deleted.
    const publicIds = [];
    if (user.profile?.avatarPublicId) {
        publicIds.push(user.profile.avatarPublicId);
    }
    for (const Model of [GeneratedResume, Resume]) {
        const docs = await Model.find({ userId }).select('cloudinaryPublicId').lean();
        publicIds.push(...docs.map((d) => d.cloudinaryPublicId).filter(Boolean));
    }

    for (const publicId of publicIds) {
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
            await cloudinary.uploader.destroy(publicId);
        } catch (assetError) {
            console.error('Could not remove asset', publicId, assetError.message);
        }
    }

    // The schemas disagree on the field name, hence both keys.
    const ownedBy = { $or: [{ userId }, { user_id: userId }] };
    const removed = {};

    for (const [name, Model] of Object.entries({
        roadmaps: Roadmap,
        skillGaps: SkillGap,
        quizSessions: QuizSession,
        quizResults: QuizResult,
        practiceResults: PracticeResult,
        interviewResults: InterviewResult,
        progressLogs: ProgressLog,
        portfolios: Portfolio,
        resumes: Resume,
        generatedResumes: GeneratedResume,
    })) {
        const { deletedCount } = await Model.deleteMany(ownedBy);
        if (deletedCount) {
            removed[name] = deletedCount;
        }
    }

    // Copied before the record goes: after deleteOne there is nothing left to
    // read an address off, and the confirmation still has to reach them.
    const recipient = { firstName: user.firstName, email: user.email };

    await User.deleteOne({ _id: userId });

    console.log(`🗑️  Account deleted: ${user.email} (${user.loginId})`, removed);

    res.status(200).json({
        success: true,
        message: 'Your account and all associated data have been permanently deleted.',
        removed,
    });

    // Sent after responding, like the other mail: the account is already gone,
    // and a slow provider should not hold up the confirmation.
    sendAccountDeletedEmail(recipient, removed)
        .then(() => console.log('✅ Deletion confirmation sent to:', recipient.email))
        .catch((emailError) => console.error('❌ Failed to send deletion confirmation:', emailError.message));
});

/**
 * @desc    Verify an account with the emailed 6-digit code
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() })
        .select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
        return next(new AppError('Invalid or expired verification code', 400));
    }

    if (user.isEmailVerified) {
        return next(new AppError('This account is already verified. Please log in.', 400));
    }

    const matches = user.emailVerificationToken === hashOtp(otp);
    const stillValid = user.emailVerificationExpires && user.emailVerificationExpires > Date.now();

    // One message for both cases: distinguishing them would tell an attacker
    // whether a guessed code was right but stale.
    if (!matches || !stillValid) {
        return next(new AppError('Invalid or expired verification code', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    // Same shape as the login response: the client stores these straight into
    // the session, and a missing field would leave the user half logged in.
    res.status(200).json({
        success: true,
        message: 'Email verified. Welcome to EduPath!',
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            loginId: user.loginId,
            role: user.role,
            phone: user.profile?.phone || '',
            skills: user.profile?.skills || '',
            // Lets the client send a new account to onboarding without a
            // second round trip to work out whether it is needed, and lets
            // role-driven screens open without asking for the role again.
            target_role: user.target_role || '',
            profile_complete: Boolean(user.profile_complete),
            tour_seen: Boolean(user.tour_seen_at),
        },
    });

    sendWelcomeEmail(user)
        .then(() => console.log('✅ Welcome email sent to:', user.email))
        .catch((emailError) => console.error('❌ Failed to send welcome email:', emailError.message));
});

/**
 * @desc    Send a fresh verification code
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always answer the same way. A different response for unknown addresses
    // would turn this into a way to test which emails have accounts.
    const genericResponse = {
        success: true,
        message: 'If that account exists and is unverified, a new code is on its way.',
    };

    if (!user || user.isEmailVerified) {
        return res.status(200).json(genericResponse);
    }

    try {
        await issueVerificationCode(user);
        console.log('✅ Verification code resent to:', user.email);
    } catch (emailError) {
        console.error('❌ Failed to resend verification code:', emailError.message);
    }

    res.status(200).json(genericResponse);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
    const { email, loginId, password } = req.body;

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

    // Refuse before comparing the password, so a locked account cannot be used
    // as an oracle to keep testing guesses.
    if (user.isLocked) {
        const minutesLeft = Math.max(1, Math.ceil((user.lockUntil - Date.now()) / 60000));
        return res.status(423).json({
            success: false,
            accountLocked: true,
            message: `Too many failed login attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}, or reset your password.`,
        });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        // The model locks the account once this reaches 5. The rate limiter caps
        // attempts per IP; this caps them per account, so a distributed attack
        // against one user still gets locked out.
        await user.incLoginAttempts();
        return next(new AppError('Invalid credentials', 401));
    }

    // Correct password, so previous failures were this user mistyping.
    if (user.loginAttempts > 0 || user.lockUntil) {
        await user.resetLoginAttempts();
    }

    // Checked after the password so this cannot be used to discover which
    // addresses have accounts. requiresVerification lets the client send the
    // user straight to the code screen instead of showing a dead end.
    if (!user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            requiresVerification: true,
            email: user.email,
            message: 'Please verify your email before logging in. Check your inbox for the 6-digit code.',
        });
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
            profilePicture: '', // Not stored in MongoDB, only in Cloudinary
            phone: user.profile?.phone || '',
            skills: user.profile?.skills || '',
            target_role: user.target_role || '',
            profile_complete: Boolean(user.profile_complete),
            tour_seen: Boolean(user.tour_seen_at),
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
            target_role: user.target_role || '',
            experience_level: user.experience_level || '',
            hours_per_week: user.hours_per_week || 0,
            learning_style: user.learning_style || '',
            current_skills: user.current_skills || [],
            profile_complete: Boolean(user.profile_complete),
            tour_seen: Boolean(user.tour_seen_at),
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
    // Clear any lockout: the person proved control of the mailbox, and the
    // lockout message tells them a reset is the way back in.
    user.loginAttempts = 0;
    user.lockUntil = undefined;
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