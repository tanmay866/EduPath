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

export const PASS_MARK = 70;
export const STRONG_MARK = 85;

/**
 * How well held a topic is, read across every attempt rather than the last.
 *
 * The queue judged a topic by its most recent score alone, which reads two
 * quite different learners the same way. Someone who has passed a topic four
 * times running and someone who scraped a pass once are both "passed", and
 * telling them apart is the difference between "keep this warm" and "you have
 * not really got this yet".
 *
 * Deliberately coarse. There is no retake data to fit anything finer to, and
 * a four-step scale that can be explained in a sentence is worth more than a
 * number nobody can account for.
 */
export const masteryFor = ({ attempts = 0, passes = 0, bestScore = 0, latestScore = 0 } = {}) => {
    if (attempts === 0) return { level: "untested", label: "Not attempted yet" };

    if (passes === 0) {
        return {
            level: "struggling",
            label: attempts === 1 ? "One attempt, not passed" : `${attempts} attempts, not passed yet`,
        };
    }

    if (passes === 1) {
        return { level: "developing", label: "Passed once" };
    }

    // Repeatedly passed. Whether it counts as held depends on where it is
    // now, not only on how often it has been passed before.
    if (latestScore >= STRONG_MARK && bestScore >= STRONG_MARK) {
        return { level: "mastered", label: `Passed ${passes} times, comfortably` };
    }

    return { level: "consolidating", label: `Passed ${passes} times` };
};

/**
 * Why this topic is on the list, in a sentence rather than a label.
 *
 * The queue said "Below the pass mark" and left the learner to infer the
 * rest — how long it had been, how long is normal for a score like that, and
 * what they were being asked to do about it.
 */
export const explainDue = ({ latestScore, daysSince, intervalDays, reason }) => {
    const over = daysSince - intervalDays;
    const when = daysSince === 0
        ? "today"
        : daysSince === 1
            ? "yesterday"
            : `${daysSince} days ago`;

    const lateness = over <= 0
        ? "which is about when it is worth another look"
        : over < 7
            ? `which is ${over} day${over === 1 ? "" : "s"} past the ${intervalDays}-day mark`
            : `which is well past the ${intervalDays}-day mark for a score like that`;

    return `${reason} — you scored ${latestScore}% ${when}, ${lateness}.`;
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

    const latestScore = Math.round(Number(topic.latestScore));
    const attempts = Number(topic.attempts) || 0;
    const passes = Number(topic.passes) || 0;
    const bestScore = Math.round(Number(topic.bestScore ?? latestScore));

    const state = {
        topicId: topic.topicId ?? topic._id ?? null,
        topicName: topic.topicName ?? topic.name ?? "Untitled topic",
        latestScore,
        latestAt: topic.latestAt,
        daysSince: elapsed,
        intervalDays: band.days,
        reason: band.label,
        due: elapsed >= band.days,
        overdueBy: elapsed - band.days,
        attempts,
        bestScore,
        // Everything the screen needs to offer the retake without a second
        // request: the queue used to name a topic and leave the learner to go
        // and find it in a list of fifty-four.
        difficulty: topic.difficulty || null,
        experienceLevel: topic.experienceLevel || null,
        mastery: masteryFor({ attempts, passes, bestScore, latestScore }),
    };

    state.explanation = explainDue(state);
    return state;
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
