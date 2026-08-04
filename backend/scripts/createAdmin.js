/**
 * Create or promote an admin account.
 *
 * The signup flow cannot produce an admin — it hardcodes the student role — and
 * an account inserted straight into the database would be locked out anyway,
 * because login refuses anyone whose email is not verified. This script does
 * both parts: it sets the role and marks the address verified, so the account
 * can sign in with a password and nothing else.
 *
 * The password is never written to a file or hardcoded here. It comes from the
 * environment, so it stays out of the repository and out of git history:
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' npm run create-admin
 *
 * Run it again with the same address to reset that admin's password.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import generateUserId from '../utils/generateUserId.js';

const {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_FIRST_NAME = 'EduPath',
  ADMIN_LAST_NAME = 'Admin',
  MONGODB_URI,
  MONGO_URI,
} = process.env;

// Mirrors the express-validator chains in middlewares/validationMiddleware.js.
// The rule lives only inside those chains, so there is nothing to import — if
// it changes there, change it here too.
const passwordError = (value) => {
  if (value.length < 6) return 'at least 6 characters';
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    return 'an uppercase letter, a lowercase letter and a number';
  }
  return null;
};

const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

const run = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    fail(
      'ADMIN_EMAIL and ADMIN_PASSWORD are required.\n\n'
      + "  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='...' npm run create-admin"
    );
  }

  // The same rules the signup form and the API enforce, checked here so a weak
  // admin password cannot be created by going around the form.
  const weak = passwordError(ADMIN_PASSWORD);
  if (weak) {
    fail(`Password rejected: it needs ${weak}.`);
  }

  await mongoose.connect(MONGODB_URI || MONGO_URI);

  const email = ADMIN_EMAIL.toLowerCase().trim();
  const existing = await User.findOne({ email });

  if (existing) {
    // Promoting rather than refusing, so this doubles as a password reset for
    // an admin who has lost theirs.
    existing.role = 'admin';
    existing.isEmailVerified = true;
    existing.isActive = true;
    existing.password = ADMIN_PASSWORD;
    await existing.save();

    console.log(`\n✅ Promoted the existing account to admin`);
    console.log(`   Email    ${existing.email}`);
    console.log(`   Login ID ${existing.loginId}`);
    console.log(`   Password updated to the one you supplied\n`);
  } else {
    // Same retry as signup: the unique index on loginId is what guarantees
    // uniqueness, and a concurrent insert can claim the serial we just read.
    const MAX_ATTEMPTS = 5;
    let user;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const loginId = await generateUserId(ADMIN_FIRST_NAME, ADMIN_LAST_NAME, attempt);
      try {
        user = await User.create({
          firstName: ADMIN_FIRST_NAME,
          lastName: ADMIN_LAST_NAME,
          email,
          password: ADMIN_PASSWORD,
          loginId,
          role: 'admin',
          // Set here because there is no inbox round-trip to verify through.
          isEmailVerified: true,
          isActive: true,
        });
        break;
      } catch (error) {
        const duplicateLoginId = error?.code === 11000 && error?.keyPattern?.loginId;
        if (!duplicateLoginId || attempt === MAX_ATTEMPTS - 1) throw error;
      }
    }

    console.log(`\n✅ Admin account created`);
    console.log(`   Email    ${user.email}`);
    console.log(`   Login ID ${user.loginId}`);
    console.log(`   Name     ${user.firstName} ${user.lastName}\n`);
  }

  console.log('   Sign in at /signin. The admin screens replace the learner ones');
  console.log('   for any account whose role is admin.\n');

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('\n✖ Failed:', error.message, '\n');
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
