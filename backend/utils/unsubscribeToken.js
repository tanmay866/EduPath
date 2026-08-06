import crypto from "crypto";

/**
 * A signed, self-contained unsubscribe link.
 *
 * The link is clicked from an email client with no session, so it cannot ask
 * anyone to log in — a person who wants the mail stopped must be able to stop
 * it in one click, not sign in first.
 *
 * It is an HMAC of the user id rather than a stored token, so there is nothing
 * to expire, clean up, or leak in a database dump. It is deliberately not a
 * JWT: this grants exactly one ability, turning one flag off, and reusing the
 * login token format would make an unsubscribe link a credential.
 *
 * No expiry on purpose. Mail lives in inboxes for years and a dead
 * unsubscribe link is worse than none — that is what gets a sender reported.
 */
const secret = () => process.env.JWT_SECRET || "";

export const signUnsubscribe = (userId) =>
    crypto.createHmac("sha256", secret()).update(`unsubscribe:${userId}`).digest("hex").slice(0, 32);

/** Constant-time compare, so the signature cannot be guessed a byte at a time. */
export const verifyUnsubscribe = (userId, token) => {
    if (!userId || !token) return false;
    const expected = signUnsubscribe(userId);
    const a = Buffer.from(expected);
    const b = Buffer.from(String(token));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const unsubscribeUrlFor = (user) => {
    const base = process.env.FRONTEND_URL || "";
    return `${base}/unsubscribe?u=${user._id}&t=${signUnsubscribe(user._id)}`;
};

export default unsubscribeUrlFor;
