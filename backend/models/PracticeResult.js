import mongoose from 'mongoose';
import { DIFFICULTIES } from '../utils/difficulty.js';

/**
 * Results for the practice tests that don't run against a Topic-backed
 * question bank — Aptitude (a public question API) and CS Fundamentals
 * (QuizAPI.io) — so they can't reuse QuizResult, which is built around a
 * topicId. Each test type stores exactly what its own ResultStage already
 * computes client-side; this just gives it somewhere to land.
 */
const reviewItemSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    answer: { type: String },
  },
  { _id: false }
);

const practiceResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['aptitude', 'cs-fundamentals'],
      required: true,
    },
    // Enforced now: this was a free String, which is how "Easy" reached the
    // admin difficulty split as a category that exists nowhere else.
    difficulty: { type: String, enum: [...DIFFICULTIES, null], default: null },
    total: { type: Number, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    unanswered: { type: Number, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    timeTaken: { type: Number, default: 0 },
    review: [reviewItemSchema],
  },
  { timestamps: true }
);

practiceResultSchema.index({ userId: 1, type: 1, createdAt: -1 });

const PracticeResult = mongoose.model('PracticeResult', practiceResultSchema);

export default PracticeResult;
