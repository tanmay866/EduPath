import mongoose from 'mongoose';

/**
 * QuizSession Model - Tracks ongoing quiz attempts
 * Prevents cheating and stores selected questions
 */

const quizSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic is required'],
      index: true,
    },
    difficultySelected: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Difficulty level is required'],
    },
    experienceLevelSelected: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Experience level is required'],
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: [
          {
            text: String,
            isCorrect: Boolean,
          },
        ],
        correctAnswer: {
          type: Number,
          min: 0,
          max: 3,
        },
        explanation: String,
        tags: [String],
      },
    ],
    totalQuestions: {
      type: Number,
      required: true,
    },
    timePerQuestion: {
      type: Number,
      default: 30, // seconds
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // Note: index is created via TTL index below
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['ongoing', 'completed', 'expired', 'abandoned'],
      default: 'ongoing',
      index: true,
    },
    // Store user answers during quiz (optional - for resume functionality)
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        selectedOptionIndex: {
          type: Number,
          min: 0,
          max: 3,
        },
        timeSpent: {
          type: Number, // seconds
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // IP and device info (security)
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance
quizSessionSchema.index({ userId: 1, status: 1 });
quizSessionSchema.index({ status: 1, expiresAt: 1 });
quizSessionSchema.index({ userId: 1, topicId: 1, createdAt: -1 });

// TTL index to auto-delete expired sessions after 7 days
quizSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);

// Method to check if session is expired
quizSessionSchema.methods.isExpired = function () {
  return Date.now() > this.expiresAt;
};

// Method to check if session is valid for submission
quizSessionSchema.methods.isValidForSubmission = function () {
  return this.status === 'ongoing' && !this.isExpired();
};

// Method to mark session as completed
quizSessionSchema.methods.markCompleted = async function () {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Static method to get active session for user
quizSessionSchema.statics.getActiveSession = async function (userId, topicId = null) {
  const query = {
    userId,
    status: 'ongoing',
    expiresAt: { $gte: new Date() },
  };

  if (topicId) {
    query.topicId = topicId;
  }

  return this.findOne(query).populate('topicId', 'name');
};

// Static method to get recently attempted question IDs (for anti-repetition)
quizSessionSchema.statics.getRecentlyAttemptedQuestions = async function (
  userId,
  topicId,
  limit = 50
) {
  const recentSessions = await this.find({
    userId,
    topicId,
    status: { $in: ['completed', 'ongoing'] },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('questions');

  const questionIds = [];
  recentSessions.forEach((session) => {
    questionIds.push(...session.questions);
  });

  // Return unique IDs, limited to 'limit'
  return [...new Set(questionIds.map((id) => id.toString()))].slice(0, limit);
};

// Static method to expire old ongoing sessions
quizSessionSchema.statics.expireOldSessions = async function () {
  const result = await this.updateMany(
    {
      status: 'ongoing',
      expiresAt: { $lt: new Date() },
    },
    {
      $set: { status: 'expired' },
    }
  );

  return result;
};

const QuizSession = mongoose.model('QuizSession', quizSessionSchema);

export default QuizSession;