import mongoose from 'mongoose';

/**
 * Topic Model - Specific subjects within categories
 * Examples: JavaScript, Python, React, Node.js, etc.
 */

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
      minlength: [2, 'Topic name must be at least 2 characters'],
      maxlength: [100, 'Topic name cannot exceed 100 characters'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      // Note: index is created via compound index below
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    icon: {
      type: String,
      default: '📖',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
      default: 'mixed',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    // Statistics (updated periodically)
    stats: {
      totalQuestions: {
        type: Number,
        default: 0,
      },
      totalAttempts: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for category and active status
topicSchema.index({ categoryId: 1, isActive: 1 });
topicSchema.index({ isActive: 1, order: 1 });

// Virtual for question count (real-time)
topicSchema.virtual('questionCount', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'topicId',
  count: true,
});

// Static method to get active topics by category
topicSchema.statics.getActiveByCategory = async function (categoryId) {
  return this.find({ categoryId, isActive: true })
    .sort({ order: 1, name: 1 })
    .populate('categoryId', 'name icon');
};

// Static method to get all active topics with question counts
topicSchema.statics.getAllActiveWithStats = async function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'questions',
        let: { topicId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$topicId', '$$topicId'] },
                  { $eq: ['$isActive', true] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'questionStats',
      },
    },
    {
      $addFields: {
        activeQuestionCount: {
          $ifNull: [{ $arrayElemAt: ['$questionStats.count', 0] }, 0],
        },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $sort: { order: 1, name: 1 } },
  ]);
};

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;