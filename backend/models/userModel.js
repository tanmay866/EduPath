import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
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
      targetRole: {
        type: String,
        enum: ['MERN', 'AI', 'Cyber', 'Data Science', 'DevOps', 'Mobile'],
      },
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
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
// Note: email and loginId already have unique indexes from schema definition
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'quizStats.averageScore': -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual to check if account is locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
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

// Static method to get the next serial number for user ID generation
userSchema.statics.getNextSerialNumber = async function (year) {
  const lastUser = await this.findOne({
    loginId: new RegExp(`^[A-Z]{4}${year}`),
  })
    .sort({ loginId: -1 })
    .select('loginId');

  if (!lastUser) {
    return 1;
  }

  const lastSerial = parseInt(lastUser.loginId.slice(-3));
  return lastSerial + 1;
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