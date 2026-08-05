import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CAREER_ROLES } from '../utils/careerRoles.js';

dotenv.config();

/**
 * Collapses the two target-role fields into one.
 *
 * Role used to live at both `target_role` (free text) and `profile.targetRole`
 * (an enum that also accepted short aliases). Not every write path touched
 * both, so they drifted. This resolves each user to a single canonical value
 * on `target_role` and drops the nested copy.
 *
 * Resolution order: a canonical `target_role` wins; otherwise the nested value
 * is used, expanding aliases; anything unrecognised becomes '' so the user is
 * asked to choose rather than being silently assigned a track.
 *
 * Safe to re-run. Pass --dry to preview without writing.
 */
const ALIASES = {
  MERN: 'MERN Developer',
  AI: 'AI/ML Engineer',
  Cyber: 'Cybersecurity Engineer',
  'Data Science': 'Data Science Engineer',
  DevOps: 'DevOps Engineer',
  Mobile: 'Mobile Developer',
};

const canonicalise = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (CAREER_ROLES.includes(raw)) return raw;
  return ALIASES[raw] || '';
};

const run = async () => {
  const dryRun = process.argv.includes('--dry');

  await mongoose.connect(process.env.MONGODB_URI);
  const users = mongoose.connection.db.collection('users');

  const docs = await users
    .find({}, { projection: { email: 1, target_role: 1, 'profile.targetRole': 1 } })
    .toArray();

  let changed = 0;
  let cleared = 0;

  for (const doc of docs) {
    const nested = doc.profile?.targetRole;
    const resolved = canonicalise(doc.target_role) || canonicalise(nested);

    const needsValueChange = (doc.target_role || '') !== resolved;
    const needsUnset = nested !== undefined;

    if (!needsValueChange && !needsUnset) continue;

    if (needsValueChange && !resolved) cleared += 1;

    console.log(
      `${doc.email}: target_role=${JSON.stringify(doc.target_role || '')} ` +
        `profile.targetRole=${JSON.stringify(nested)} -> ${JSON.stringify(resolved)}` +
        (needsUnset ? ' (dropping nested copy)' : '')
    );

    if (!dryRun) {
      await users.updateOne(
        { _id: doc._id },
        { $set: { target_role: resolved }, $unset: { 'profile.targetRole': '' } }
      );
    }
    changed += 1;
  }

  console.log(
    `\n${dryRun ? '[dry run] would update' : 'updated'} ${changed} of ${docs.length} user(s)` +
      (cleared ? `; ${cleared} had an unrecognised role and must choose again` : '')
  );

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
