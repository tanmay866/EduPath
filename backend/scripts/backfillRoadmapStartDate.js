import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

/**
 * Gives existing roadmaps the day they started.
 *
 * Plans had no dates, so nothing could say which week the calendar put a
 * learner in. New plans record started_at when they are generated; the ones
 * already on record need it filled in, and the honest value is the day the
 * plan was created — that is when the learner got it.
 *
 * Superseded plans are filled in too. They are read on the history screen,
 * and a plan with no start date there would be the only one unable to say
 * when it ran.
 *
 * Safe to re-run — it only touches documents with no start date. Pass --dry
 * to preview.
 */
const run = async () => {
    const dryRun = process.argv.includes('--dry');

    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    const roadmaps = mongoose.connection.db.collection('roadmaps');

    const missing = await roadmaps
        .find({ started_at: { $exists: false } })
        .project({ _id: 1, target_role: 1, status: 1, createdAt: 1 })
        .toArray();

    console.log(`${missing.length} roadmap(s) without a start date`);
    for (const r of missing) {
        console.log(
            `   ${r.target_role} (${r.status}) — starting ${new Date(r.createdAt).toISOString().slice(0, 10)}`
        );
    }

    if (missing.length && !dryRun) {
        let updated = 0;
        for (const r of missing) {
            // Each takes its own createdAt, so this cannot be one updateMany.
            const res = await roadmaps.updateOne(
                { _id: r._id },
                { $set: { started_at: r.createdAt } }
            );
            updated += res.modifiedCount;
        }
        console.log(`\nfilled in ${updated}`);
    } else if (missing.length) {
        console.log(`\n--dry: would fill in ${missing.length}`);
    }

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
