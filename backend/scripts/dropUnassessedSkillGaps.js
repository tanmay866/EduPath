import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { TOPIC_SKILL_MAP } from '../utils/skillTopicMap.js';

dotenv.config();

/**
 * Removes skill-gap entries for skills no quiz topic actually assesses.
 *
 * A quiz score used to be written against every skill its topic touched, so
 * ten questions on "Python Basics" recorded a score against "Python for
 * Security" too. That was harmless while an unproven skill and a wrongly
 * proven one both stayed on the roadmap; once a passing score began removing
 * a skill from the plan, those entries started excusing learners from
 * material they were never asked about — a React quiz clearing React Router,
 * a Python quiz clearing security Python.
 *
 * The write path is fixed, but the entries it already wrote are still on
 * record and still read on every generation. Any entry naming a skill that no
 * topic assesses can only have come from the old fan-out, since nothing else
 * writes to this collection, so removing them is unambiguous.
 *
 * Scores against skills a topic really does assess are left alone.
 *
 * Safe to re-run. Pass --dry to preview.
 */
const run = async () => {
    const dryRun = process.argv.includes('--dry');

    const assessed = new Set();
    const related = new Set();
    for (const entry of Object.values(TOPIC_SKILL_MAP)) {
        entry.assesses.forEach((s) => assessed.add(s));
        entry.related.forEach((s) => related.add(s));
    }
    const unprovable = [...related].filter((s) => !assessed.has(s));

    console.log(`${unprovable.length} skill name(s) no topic can assess:`);
    unprovable.forEach((s) => console.log(`   - ${s}`));

    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    const skillGaps = mongoose.connection.db.collection('skillgaps');

    const docs = await skillGaps
        .find({ 'skill_gaps.skill': { $in: unprovable } })
        .toArray();
    console.log(`\n${docs.length} document(s) carry at least one`);

    let removed = 0;
    for (const doc of docs) {
        const keep = (doc.skill_gaps || []).filter((g) => !unprovable.includes(g.skill));
        const dropped = (doc.skill_gaps || []).length - keep.length;
        removed += dropped;

        console.log(
            `   ${doc.target_role || '(no role)'} — dropping ${dropped}: ` +
                (doc.skill_gaps || [])
                    .filter((g) => unprovable.includes(g.skill))
                    .map((g) => `${g.skill} (${g.current_score}%)`)
                    .join(', ')
        );

        if (!dryRun) {
            // strength_score is the mean of what is on record, so it has to be
            // recomputed from what survives rather than left describing
            // entries that are gone.
            const scores = keep.map((g) => g.current_score ?? 0);
            const strength = scores.length
                ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
                : 0;
            await skillGaps.updateOne(
                { _id: doc._id },
                { $set: { skill_gaps: keep, strength_score: strength } }
            );
        }
    }

    console.log(
        dryRun
            ? `\n--dry: would remove ${removed} entr(ies)`
            : `\nremoved ${removed} entr(ies)`
    );

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
