import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { CAREER_ROLES } from '../utils/careerRoles.js';
import { LEARNING_STYLES } from '../utils/learningStyles.js';

/**
 * User Model - Authentication and user management
 */

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // The old pattern capped each label at 3 characters, which rejected every
      // TLD longer than that (.tech, .info, .online, .store, .email). Those
      // addresses passed the express-validator isEmail() check on the route and
      // then failed here, so signup broke with no useful explanation.
      match: [
        /^[\w.+-]+@[\w-]+(\.[\w-]+)*\.[A-Za-z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    loginId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin', 'developer', 'designer', 'teacher', 'manager', 'entrepreneur', 'instructor', 'other'],
        message: '{VALUE} is not a valid role',
      },
      default: 'student',
    },
    // Profile information
    //
    // The career track everything personalised is built from. It is an enum
    // because the AI service matches these strings verbatim against its
    // roadmap templates — a free-text role has no curriculum behind it. '' is
    // the "not chosen yet" state.
    target_role: {
      type: String,
      enum: {
        values: [...CAREER_ROLES, ''],
        message: '{VALUE} is not a supported career role',
      },
      default: '',
      trim: true,
    },
    experience_level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    hours_per_week: {
      type: Number,
      default: 0,
    },
    // How the weekly plan is phrased. An enum because the AI service keys its
    // task templates off these exact values and quietly falls back to mixed
    // for anything else — so a stray value would look like the setting simply
    // did nothing. '' is "not chosen yet".
    learning_style: {
      type: String,
      enum: {
        values: [...LEARNING_STYLES, ''],
        message: '{VALUE} is not a supported learning style',
      },
      default: '',
      trim: true,
    },
    current_skills: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    profile_complete: {
      type: Boolean,
      default: false,
    },
    // When the first-run tour was dismissed. Stored per account rather than in
    // browser storage so it follows the person to another device and is not
    // lost by clearing site data. Null means they have not seen it.
    tour_seen_at: {
      type: Date,
      default: null,
    },
    profile: {
      phone: {
        type: String,
        trim: true,
        default: '',
      },
      avatar: {
        type: String,
        default: '',
      },
      avatarPublicId: {
        type: String,
        default: '',
      },
      bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
      },
      dateOfBirth: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      },
      location: {
        city: String,
        state: String,
        country: String,
      },
      education: {
        degree: String,
        institution: String,
        graduationYear: Number,
      },
      occupation: {
        title: String,
        company: String,
        experienceLevel: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'fresher', '1-3 years', '3+ years'],
          default: 'Beginner',
        },
      },
      skills: {
        type: String,
        trim: true,
        default: '',
      },
      currentSkills: [String],
      // profile.targetRole used to duplicate the root target_role, and the two
      // drifted because not every write path updated both. The root field is
      // now the only one.
      availableLearningTime: {
        type: Number,
        default: 10,
      },
      resumeUrl: String,
      githubUrl: String,
      linkedinUrl: String,
    },
    // Preferences
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    language: {
      type: String,
      default: 'Eng',
    },
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
    // Skill assessment profile
    skillProfile: {
      assessedSkills: [{
        skillName: String,
        score: Number,
        level: String,
        lastAssessed: Date,
      }],
      totalAssessments: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
    },
    // Quiz statistics
    quizStats: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      totalPassed: {
        type: Number,
        default: 0,
      },
      totalFailed: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      highestScore: {
        type: Number,
        default: 0,
      },
      totalTimeSpent: {
        type: Number,
        default: 0,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      lastQuizDate: {
        type: Date,
      },
    },
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    // Password reset
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    // Security
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    lastLoginIP: {
      type: String,
    },
    // Roadmap reference
    activeRoadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
// Note: email and loginId already have unique indexes from schema definition
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'quizStats.averageScore': -1 });
userSchema.index({ activeRoadmap: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual to check if account is locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual to populate all roadmaps for this user
userSchema.virtual('roadmaps', {
  ref: 'Roadmap',
  localField: '_id',
  foreignField: 'user_id',
});


// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get user without sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.resetPasswordExpires;
  delete user.emailVerificationToken;
  return user;
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockDuration = 15 * 60 * 1000; // 15 minutes

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockDuration };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Method to update quiz statistics
userSchema.methods.updateQuizStats = async function (result) {
  const updates = {
    $inc: {
      'quizStats.totalAttempts': 1,
    },
    $set: {
      'quizStats.lastQuizDate': new Date(),
    },
  };

  if (result.status === 'pass') {
    updates.$inc['quizStats.totalPassed'] = 1;

    const daysSinceLastQuiz = this.quizStats.lastQuizDate
      ? Math.floor((Date.now() - this.quizStats.lastQuizDate) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceLastQuiz <= 1) {
      updates.$inc['quizStats.currentStreak'] = 1;
    } else {
      updates.$set['quizStats.currentStreak'] = 1;
    }
  } else {
    updates.$inc['quizStats.totalFailed'] = 1;
    updates.$set['quizStats.currentStreak'] = 0;
  }

  const totalScore = this.quizStats.averageScore * this.quizStats.totalAttempts + result.percentage;
  updates.$set['quizStats.averageScore'] = totalScore / (this.quizStats.totalAttempts + 1);

  if (result.percentage > this.quizStats.highestScore) {
    updates.$set['quizStats.highestScore'] = result.percentage;
  }

  const newStreak = updates.$set['quizStats.currentStreak'] || this.quizStats.currentStreak + 1;
  if (newStreak > this.quizStats.longestStreak) {
    updates.$set['quizStats.longestStreak'] = newStreak;
  }

  updates.$inc['quizStats.totalTimeSpent'] = result.timeTaken;

  return this.updateOne(updates);
};

// Method to set active roadmap
userSchema.methods.setActiveRoadmap = async function (roadmapId) {
  return this.updateOne({
    $set: { activeRoadmap: roadmapId },
  });
};

// Method to get active roadmap with populated data
userSchema.methods.getActiveRoadmap = async function () {
  if (!this.activeRoadmap) {
    return null;
  }
  return mongoose.model('Roadmap').findById(this.activeRoadmap);
};

// Static method to get the next serial number for user ID generation.
//
// Sorting by loginId used to pick the alphabetically largest id, which is the
// highest *name prefix* rather than the highest serial — ZZZZ2026001 outranked
// AAAA2026999 — so this returned a serial that was already taken. The serial is
// now extracted and compared as a number.
//
// This still races: two concurrent signups can read the same maximum. The unique
// index on loginId is what actually guarantees uniqueness, and callers retry on
// the resulting duplicate-key error.
userSchema.statics.getNextSerialNumber = async function (year) {
  const [highest] = await this.aggregate([
    { $match: { loginId: new RegExp(`^[A-Z]{4}${year}\\d+$`) } },
    { $project: { serial: { $toInt: { $substrBytes: ['$loginId', 8, 10] } } } },
    { $sort: { serial: -1 } },
    { $limit: 1 },
  ]);

  return (highest?.serial ?? 0) + 1;
};

// Static method to get top performers
userSchema.statics.getTopPerformers = async function (limit = 10) {
  return this.find({ role: 'student', isActive: true })
    .sort({ 'quizStats.averageScore': -1, 'quizStats.totalAttempts': -1 })
    .limit(limit)
    .select('firstName lastName profile.avatar quizStats');
};

const User = mongoose.model('User', userSchema);

export default User;