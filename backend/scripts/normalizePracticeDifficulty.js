/**
 * One-off: bring stored practice difficulties into the vocabulary the rest of
 * the system reads.
 *
 * CS Fundamentals wrote "Easy"/"Medium"/"Hard" because its picker mirrors the
 * upstream question API, and PracticeResult.difficulty had no enum to stop it.
 * Those rows sat outside beginner/intermediate/advanced, so the admin
 * difficulty split drew them as extra categories and every filter but "All"
 * hid them.
 *
 * Writes are normalised at the controller now, so this only exists to fix rows
 * saved before that. Safe to run more than once — anything already canonical
 * is skipped.
 *
 *   node scripts/normalizePracticeDifficulty.js          # report only
 *   node scripts/normalizePracticeDifficulty.js --apply  # write
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import PracticeResult from '../models/PracticeResult.js';
import { normalizeDifficulty, isDifficulty } from '../utils/difficulty.js';

const apply = process.argv.includes('--apply');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const rows = await PracticeResult.find({}).select('_id type difficulty').lean();
  const stale = rows.filter((row) => row.difficulty && !isDifficulty(row.difficulty));

  console.log(`${rows.length} practice result(s), ${stale.length} outside the vocabulary.`);

  for (const row of stale) {
    const next = normalizeDifficulty(row.difficulty);
    console.log(`  ${row.type}  ${JSON.stringify(row.difficulty)} -> ${JSON.stringify(next)}`);

    // A value nothing maps to is left alone and reported. Overwriting it with
    // a guess would put a row in a bucket it was never in.
    if (!next) {
      console.log('    unmapped — left as is');
      continue;
    }
    if (apply) {
      await PracticeResult.updateOne({ _id: row._id }, { $set: { difficulty: next } });
    }
  }

  console.log(apply ? 'Applied.' : 'Dry run — pass --apply to write.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
