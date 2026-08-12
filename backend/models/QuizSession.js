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
        /**
         * What this question actually is, which is not always the level the
         * learner picked — a quiz is now built as a spread around that level
         * rather than entirely at it, so the score can tell "knows the
         * basics" apart from "knows this well".
         *
         * Stored per question because the breakdown on the result page is
         * computed from it. Sessions written before this have none, and
         * scoring falls back to the session's own level for those.
         */
        difficulty: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
        },
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
    /**
     * Answers so far, so a quiz survives leaving the page.
     *
     * The field existed and nothing ever wrote to it — the whole quiz lived
     * in React state, so a refresh, a closed tab or a phone locking itself
     * threw away every answer given and left the session "ongoing" with
     * nothing in it. The learner's only route back was to abandon and start
     * again, on a fresh set of questions, with the clock reset.
     *
     * Keyed by position rather than by a question id. The old shape referred
     * to a `Question` collection that does not exist: questions are embedded
     * in the session above and addressed by index everywhere else, including
     * by the submit handler that scores them.
     */
    answers: [
      {
        questionIndex: {
          type: Number,
          required: true,
          min: 0,
        },
        selectedOptionIndex: {
          type: Number,
          min: 0,
          max: 3,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    /** Questions flagged to come back to, so the flags survive a reload too. */
    markedForReview: [{ type: Number, min: 0 }],
    /** When progress was last written, for the "restored" notice. */
    progressSavedAt: {
      type: Date,
    },
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

/**
 * Which sessions have run out of time but still call themselves ongoing.
 *
 * Split out from the update so it can be tested without a database — the
 * failure worth catching is a filter that matches everything, which would
 * expire a quiz somebody is in the middle of.
 */
export const expiredSessionFilter = (now = new Date(), userId = null) => {
  const filter = {
    status: 'ongoing',
    expiresAt: { $lt: now },
  };
  if (userId) filter.userId = userId;
  return filter;
};

/**
 * Marks timed-out sessions as expired.
 *
 * Sessions were created ongoing and never moved off it. Nothing set them to
 * expired, so a quiz abandoned days ago still described itself as in
 * progress until the TTL index removed the row a week later. The status enum
 * has carried 'expired' from the start and this method was written to apply
 * it; it was simply never called.
 *
 * Called when a learner starts a quiz, scoped to that learner. There is no
 * dependable scheduler here — the host sleeps when idle, which is what moved
 * the weekly email out to an external trigger — so tying it to an action that
 * only happens while the app is awake is what keeps it honest. Anyone who
 * never comes back has their rows dropped by the TTL index regardless.
 */
quizSessionSchema.statics.expireOldSessions = async function (userId = null) {
  return this.updateMany(expiredSessionFilter(new Date(), userId), {
    $set: { status: 'expired' },
  });
};

const QuizSession = mongoose.model('QuizSession', quizSessionSchema);

export default QuizSession;