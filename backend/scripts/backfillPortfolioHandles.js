import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Portfolio from '../models/Portfolio.js';
import User from '../models/userModel.js';
import { uniqueHandle } from '../utils/portfolioHandle.js';

dotenv.config();

/**
 * Gives existing portfolios the handle they were never given.
 *
 * Every portfolio was created with `username: user.username`, and users have
 * no username field, so all of them stored an empty string. The public
 * lookup by handle could not match anything, for anyone.
 *
 * Derived from the owner's name, falling back to the portfolio id when the
 * name yields nothing usable.
 *
 * Safe to re-run — it only touches portfolios with no handle. Pass --dry to
 * preview.
 */
const run = async () => {
    const dryRun = process.argv.includes('--dry');

    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

    const missing = await Portfolio.find({
        $or: [{ username: '' }, { username: null }, { username: { $exists: false } }],
    })
        .select('portfolioId userId username')
        .lean();

    console.log(`${missing.length} portfolio(s) without a handle`);

    let updated = 0;
    for (const portfolio of missing) {
        const owner = await User.findById(portfolio.userId).select('firstName lastName').lean();
        const handle = await uniqueHandle(
            [owner?.firstName, owner?.lastName].filter(Boolean).join(' '),
            async (candidate) => Boolean(await Portfolio.exists({ username: candidate })),
            portfolio.portfolioId
        );

        console.log(`   ${portfolio.portfolioId} -> /u/${handle}`);
        if (!dryRun) {
            await Portfolio.updateOne({ _id: portfolio._id }, { $set: { username: handle } });
            updated += 1;
        }
    }

    console.log(dryRun ? `\n--dry: would set ${missing.length}` : `\nset ${updated}`);
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
