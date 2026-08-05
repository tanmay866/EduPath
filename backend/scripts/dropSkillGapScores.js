import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

/**
 * Drops the redundant `skill_scores` map from existing SkillGap documents.
 *
 * Scores now live only on `skill_gaps[].current_score`. The map duplicated
 * them and could not hold skill names containing '.' — Mongoose rejects such
 * keys — so "Node.js Basics" and "Express.js" silently failed to save.
 *
 * Safe to re-run. Pass --dry to preview.
 */
const run = async () => {
  const dryRun = process.argv.includes('--dry');

  await mongoose.connect(process.env.MONGODB_URI);
  const skillGaps = mongoose.connection.db.collection('skillgaps');

  const stale = await skillGaps.countDocuments({ skill_scores: { $exists: true } });
  console.log(`${stale} document(s) still carry skill_scores`);

  if (stale && !dryRun) {
    const { modifiedCount } = await skillGaps.updateMany(
      { skill_scores: { $exists: true } },
      { $unset: { skill_scores: '' } }
    );
    console.log(`removed the field from ${modifiedCount} document(s)`);
  } else if (stale) {
    console.log('[dry run] no changes written');
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
