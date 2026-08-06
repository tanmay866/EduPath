import express from "express";
import User from "../models/userModel.js";
import { verifyUnsubscribe } from "../utils/unsubscribeToken.js";

const router = express.Router();

/**
 * POST /api/unsubscribe/weekly — turn the Monday email off from a mail client.
 *
 * Public on purpose: it is reached from a link in an inbox, where there is no
 * session and asking someone to sign in before they can stop unwanted mail is
 * how a sender gets reported instead of unsubscribed. The signed token in the
 * link is the authorisation, and it grants exactly one thing.
 *
 * Always answers as though it worked. A different reply for "no such user"
 * would turn this into a way to test whether an address has an account.
 */
router.post("/weekly", async (req, res) => {
    const { u: userId, t: token } = { ...req.query, ...req.body };

    try {
        if (verifyUnsubscribe(userId, token)) {
            await User.updateOne({ _id: userId }, { $set: { "weeklyEmail.enabled": false } });
        }
    } catch {
        // A malformed id throws on cast; the answer is the same either way.
    }

    res.status(200).json({
        success: true,
        message: "You will not get the weekly email again.",
    });
});

export default router;
