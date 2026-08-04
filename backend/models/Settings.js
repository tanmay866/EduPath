import mongoose from 'mongoose';

/**
 * Platform settings, as a single document.
 *
 * The admin settings screen used to write to component state and nothing else,
 * so every value reset on reload and none of them affected generation. These
 * are read by the quiz controller before it builds a quiz, which is what makes
 * them settings rather than a form.
 */
const settingsSchema = new mongoose.Schema(
  {
    // One row, always. The fixed key is what makes findOneAndUpdate upsert
    // into the same document instead of creating a second one under load.
    key: {
      type: String,
      default: 'platform',
      unique: true,
      immutable: true,
    },
    maxQuestions: { type: Number, default: 10, min: 1, max: 50 },
    maxDuration: { type: Number, default: 30, min: 1, max: 180 },
    maxModules: { type: Number, default: 8, min: 1, max: 30 },
    defaultLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    enableAI: { type: Boolean, default: true },
    basePrompt: {
      type: String,
      default: 'Generate structured JSON output only. No explanations.',
      maxlength: 1000,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

/** The settings document, created with defaults the first time it is asked for. */
settingsSchema.statics.current = async function current() {
  return this.findOneAndUpdate(
    { key: 'platform' },
    { $setOnInsert: { key: 'platform' } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
