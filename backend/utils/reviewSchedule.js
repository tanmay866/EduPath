/**
 * When a topic is worth going back to.
 *
 * Every attempt has always been stored — score, topic, date, and the answer to
 * each question — and nothing ever looked back at any of it. The history page
 * lists attempts, but nothing says "you scored 40% on this five weeks ago and
 * have not touched it since", which is the one thing that data is good for.
 *
 * This is a fixed interval ladder, not a memory model. Something scored badly
 * comes back in a week; something scored well comes back in two months. That
 * is the whole idea, and it is worth being plain about: it is not measuring
 * anyone's forgetting curve, and calling it spaced repetition would claim more
 * than it does. The intervals are a starting point that can be tuned once
 * there is real retake data to tune them against.
 */

/**
 * How long a score buys before the topic is worth revisiting.
 *
 * Ordered worst first and read top down, so the boundaries cannot overlap.
 */
export const REVIEW_INTERVALS = [
    { below: 50, days: 7, label: "Struggled with this" },
    { below: 70, days: 14, label: "Below the pass mark" },
    { below: 85, days: 30, label: "Passed, not comfortably" },
    { below: Infinity, days: 60, label: "Solid" },
];

export const intervalFor = (score) => {
    // null and '' both convert to 0, which is a finite number in the worst
    // band — so a topic with no score would be read as a total failure and
    // pushed to the top of the queue. Absent is not zero.
    if (score === null || score === undefined || score === "") return null;
    const pct = Number(score);
    if (!Number.isFinite(pct)) return null;
    return REVIEW_INTERVALS.find((band) => pct < band.below);
};

const DAY = 24 * 60 * 60 * 1000;

export const daysBetween = (from, to = new Date()) => {
    if (!from) return null;
    const ms = new Date(to).getTime() - new Date(from).getTime();
    return Number.isFinite(ms) ? Math.floor(ms / DAY) : null;
};

/**
 * One topic's review state.
 *
 * `overdueBy` is what orders the list: a topic a month past its interval
 * matters more than one a day past, whatever the scores were.
 */
export const reviewStateFor = (topic, now = new Date()) => {
    const band = intervalFor(topic?.latestScore);
    const elapsed = daysBetween(topic?.latestAt, now);
    if (!band || elapsed === null) return null;

    return {
        topicId: topic.topicId ?? topic._id ?? null,
        topicName: topic.topicName ?? topic.name ?? "Untitled topic",
        latestScore: Math.round(Number(topic.latestScore)),
        latestAt: topic.latestAt,
        daysSince: elapsed,
        intervalDays: band.days,
        reason: band.label,
        due: elapsed >= band.days,
        overdueBy: elapsed - band.days,
    };
};

/**
 * The topics worth going back to, most overdue first.
 *
 * Only what is actually due. A list padded with topics that are fine would
 * make the due ones harder to see, which is the opposite of the point.
 */
export const reviewQueue = (topicPerformance = [], now = new Date()) =>
    topicPerformance
        .map((t) => reviewStateFor(t, now))
        .filter((r) => r && r.due)
        .sort((a, b) => b.overdueBy - a.overdueBy || a.latestScore - b.latestScore);

export default reviewQueue;
