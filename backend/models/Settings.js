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
    // House style for generated questions, appended to the quiz prompt.
    //
    // The old default read "Generate structured JSON output only. No
    // explanations." — written when nothing read this field. It is now read,
    // and every question must carry an explanation: the validator rejects one
    // without it and the results screen shows it. Left as it was, switching
    // this field on would have failed every generation.
    basePrompt: {
      type: String,
      default: 'Prefer questions that test understanding over recall. Keep wording plain.',
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
