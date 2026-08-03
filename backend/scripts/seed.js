/**
 * Seed the quiz catalog (categories and topics).
 *
 *   npm run seed
 *
 * Idempotent: documents are upserted by _id, so running it twice changes
 * nothing and running it against an existing database repairs missing or edited
 * catalog entries without touching users, quiz results or roadmaps.
 *
 * Pass --force to replace existing catalog documents wholesale rather than
 * leaving edited ones alone.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from '../models/category.js';
import Topic from '../models/Topic.js';
import { CATEGORIES, TOPICS } from './seedData.js';

dotenv.config();

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const seedCollection = async (Model, docs, label, force) => {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const doc of docs) {
    const _id = toObjectId(doc._id);
    const payload = { ...doc, _id };
    if (payload.categoryId) {
      payload.categoryId = toObjectId(payload.categoryId);
    }

    const existing = await Model.findById(_id).lean();

    if (!existing) {
      await Model.create(payload);
      created++;
    } else if (force) {
      await Model.replaceOne({ _id }, payload);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`  ${label}: ${created} created, ${updated} updated, ${skipped} already present`);
  return { created, updated, skipped };
};

const run = async () => {
  const force = process.argv.includes('--force');

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Add it to backend/.env before seeding.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`\nSeeding ${mongoose.connection.name} on ${mongoose.connection.host}`);

  // Categories first: topics reference them by _id.
  await seedCollection(Category, CATEGORIES, 'categories', force);
  await seedCollection(Topic, TOPICS, 'topics', force);

  const orphans = await Topic.countDocuments({
    categoryId: { $nin: CATEGORIES.map((c) => toObjectId(c._id)) },
  });
  if (orphans > 0) {
    console.warn(`  warning: ${orphans} topic(s) reference a category that is not in the seed`);
  }

  console.log(
    `\nCatalog ready: ${await Category.countDocuments()} categories, ${await Topic.countDocuments()} topics\n`
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('\nSeeding failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
