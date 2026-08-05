/**
 * One-off: replace the stored base prompt if it is still the old default.
 *
 * "Generate structured JSON output only. No explanations." was written while
 * nothing read this field. The quiz prompt reads it now, and every question
 * must carry an explanation — validateQuestionStructure rejects one without
 * it, and the results screen shows it to the learner. Left in place, turning
 * the field on would have told the model to omit the one thing generation
 * requires, failing every attempt.
 *
 * Only the exact old default is replaced. Anything an admin has typed is left
 * alone: it is their instruction, and the prompt now keeps the structural
 * rules after it so a bad line cannot break the schema anyway.
 *
 *   node scripts/retireUnsafeBasePrompt.js          # report only
 *   node scripts/retireUnsafeBasePrompt.js --apply  # write
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Settings from '../models/Settings.js';

const OLD_DEFAULT = 'Generate structured JSON output only. No explanations.';
const NEW_DEFAULT = 'Prefer questions that test understanding over recall. Keep wording plain.';

const apply = process.argv.includes('--apply');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const doc = await Settings.findOne({ key: 'platform' }).lean();

  if (!doc) {
    console.log('No settings document — the next read creates one with the new default.');
  } else if (doc.basePrompt !== OLD_DEFAULT) {
    console.log(`Base prompt is not the old default, leaving it: ${JSON.stringify(doc.basePrompt)}`);
  } else {
    console.log(`${JSON.stringify(OLD_DEFAULT)}\n  -> ${JSON.stringify(NEW_DEFAULT)}`);
    if (apply) {
      await Settings.updateOne({ key: 'platform' }, { $set: { basePrompt: NEW_DEFAULT } });
    }
  }

  console.log(apply ? 'Applied.' : 'Dry run — pass --apply to write.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
