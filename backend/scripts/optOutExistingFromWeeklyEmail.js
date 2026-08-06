/**
 * One-off: switch the weekly email off for accounts that predate it.
 *
 * The field defaults to true so a new signup is opted in at the moment they
 * choose to join. Everyone who already had an account joined before this
 * existed and never agreed to it, so they start off and turn it on in Settings
 * if they want it.
 *
 * Only accounts with no setting at all are touched. Anyone who has since made
 * a choice keeps it, so this is safe to run more than once.
 *
 *   node scripts/optOutExistingFromWeeklyEmail.js          # report only
 *   node scripts/optOutExistingFromWeeklyEmail.js --apply  # write
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

const apply = process.argv.includes('--apply');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const untouched = { 'weeklyEmail.enabled': { $exists: false } };
  const affected = await User.find(untouched).select('email createdAt').lean();

  console.log(`${affected.length} account(s) have never chosen:`);
  affected.forEach((u) => console.log(`  ${u.email}  (joined ${u.createdAt?.toISOString().slice(0, 10)})`));

  if (apply && affected.length) {
    const res = await User.updateMany(untouched, { $set: { 'weeklyEmail.enabled': false } });
    console.log(`Opted out ${res.modifiedCount}.`);
  }

  console.log(apply ? 'Applied.' : 'Dry run — pass --apply to write.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
