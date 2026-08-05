import mongoose from 'mongoose';

/**
 * A completed AI mock interview — the summary plus every question, answer
 * and per-answer evaluation, so a past interview can be reviewed in the
 * same depth the live result screen shows right after finishing.
 */
const questionResultSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    evaluation: {
      score: { type: Number, required: true, min: 0, max: 10 },
      feedback: { type: String },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
    },
  },
  { _id: false }
);

const interviewResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: { type: String, required: true },
    overallScore: { type: Number, required: true, min: 0, max: 10 },
    recommendation: { type: String },
    summary: { type: String },
    topStrengths: [{ type: String }],
    areasToImprove: [{ type: String }],
    advice: { type: String },
    results: [questionResultSchema],
  },
  { timestamps: true }
);

interviewResultSchema.index({ userId: 1, createdAt: -1 });

const InterviewResult = mongoose.model('InterviewResult', interviewResultSchema);

export default InterviewResult;
