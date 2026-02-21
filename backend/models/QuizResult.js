import mongoose from 'mongoose';

/**
 * QuizResult Model - Stores final quiz results
 * Used for analytics, progress tracking, and leaderboards
 */

const answerDetailSchema = new mongoose.Schema(
  {
    questionIndex: {
      type: Number,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    selectedOptionIndex: {
      type: Number,
      min: 0,
      max: 3,
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    userAnswer: {
      type: String,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    marksAwarded: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number, // seconds
      default: 0,
    },
    explanation: {
      type: String,
    },
    tags: [String],
  },
  { _id: false }
);

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    quizSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizSession',
      required: [true, 'Quiz session is required'],
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic is required'],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    // Scoring details
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pass', 'fail'],
      required: true,
    },
    // Time tracking
    timeTaken: {
      type: Number, // total seconds
      required: true,
    },
    averageTimePerQuestion: {
      type: Number, // seconds
      default: 0,
    },
    // Detailed answers (for review)
    answers: [answerDetailSchema],
    // Performance metrics
    metrics: {
      accuracy: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      speed: {
        type: Number, // questions per minute
        default: 0,
      },
      consistency: {
        type: Number, // variance in time per question
        default: 0,
      },
    },
    // Achievements/Badges (optional)
    achievements: [
      {
        type: String,
        enum: [
          'perfect_score',
          'speed_demon',
          'first_attempt',
          'improvement',
          'streak_3',
          'streak_5',
          'streak_10',
        ],
      },
    ],
    // Feedback (optional)
    userFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: 500,
      },
    },
    // Metadata
    attemptNumber: {
      type: Number,
      default: 1,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for analytics and leaderboards
quizResultSchema.index({ userId: 1, createdAt: -1 });
quizResultSchema.index({ topicId: 1, percentage: -1 });
quizResultSchema.index({ userId: 1, topicId: 1, createdAt: -1 });
quizResultSchema.index({ percentage: -1, createdAt: -1 }); // For leaderboard
quizResultSchema.index({ status: 1, percentage: -1 });

// Method to calculate metrics
quizResultSchema.methods.calculateMetrics = function () {
  // Accuracy
  this.metrics.accuracy = this.percentage;
  
  // Speed (questions per minute)
  if (this.timeTaken > 0) {
    this.metrics.speed = (this.totalQuestions / (this.timeTaken / 60)).toFixed(2);
  }
  
  // Consistency (standard deviation of time per question)
  if (this.answers.length > 0) {
    const times = this.answers.map((a) => a.timeSpent);
    const mean = times.reduce((sum, t) => sum + t, 0) / times.length;
    const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length;
    this.metrics.consistency = Math.sqrt(variance).toFixed(2);
  }
  
  return this;
};

// Method to check for achievements
quizResultSchema.methods.checkAchievements = function () {
  const achievements = [];
  
  // Perfect score
  if (this.percentage === 100) {
    achievements.push('perfect_score');
  }
  
  // Speed demon (completed in less than half the allotted time)
  const expectedTime = this.totalQuestions * 30; // 30 seconds per question
  if (this.timeTaken < expectedTime / 2) {
    achievements.push('speed_demon');
  }
  
  // First attempt (check if this is user's first quiz)
  // This would need to check QuizResult count for user
  
  this.achievements = achievements;
  return this;
};

// Static method to get user statistics
quizResultSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$percentage' },
        highestScore: { $max: '$percentage' },
        totalTimeTaken: { $sum: '$timeTaken' },
        passCount: {
          $sum: { $cond: [{ $eq: ['$status', 'pass'] }, 1, 0] },
        },
        failCount: {
          $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] },
        },
      },
    },
  ]);
  
  return stats.length > 0 ? stats[0] : null;
};

// Static method to get topic-wise performance
quizResultSchema.statics.getTopicWisePerformance = async function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$topicId',
        attempts: { $sum: 1 },
        averageScore: { $avg: '$percentage' },
        bestScore: { $max: '$percentage' },
        lastAttempt: { $max: '$createdAt' },
      },
    },
    {
      $lookup: {
        from: 'topics',
        localField: '_id',
        foreignField: '_id',
        as: 'topic',
      },
    },
    { $unwind: '$topic' },
    { $sort: { lastAttempt: -1 } },
  ]);
};

// Static method to get leaderboard
quizResultSchema.statics.getLeaderboard = async function (topicId = null, limit = 10) {
  const matchStage = topicId ? { topicId: new mongoose.Types.ObjectId(topicId) } : {};
  
  return this.aggregate([
    { $match: matchStage },
    { $sort: { percentage: -1, timeTaken: 1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        percentage: 1,
        timeTaken: 1,
        createdAt: 1,
      },
    },
  ]);
};

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

export default QuizResult;