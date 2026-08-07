/**
 * What a report is allowed to carry, and how it reads in a list.
 *
 * The context comes from the browser, so it is taken as a claim rather than
 * as fact: only known keys survive, each is truncated, and nothing is trusted
 * to be a string until it has been made one. Without that, a report is an
 * open channel for writing arbitrary documents into the database and for
 * putting whatever it likes on an admin's screen.
 */

/** Per kind, the keys worth keeping. Anything else is dropped. */
const ALLOWED = {
    question: ['resultId', 'topic', 'difficulty', 'question', 'givenAnswer', 'correctAnswer'],
    roadmap: ['roadmapId', 'targetRole', 'weekNumber', 'skills'],
    general: ['page'],
};

const MAX_FIELD = 500;

const clean = (value) => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.map(clean).filter(Boolean).slice(0, 12).join(', ');
    if (typeof value === 'object') return '';
    return String(value).trim().slice(0, MAX_FIELD);
};

/**
 * The context reduced to what this kind of report may carry.
 *
 * An unknown kind keeps nothing rather than everything — the failure should
 * be an empty context, not an unfiltered one.
 */
export const sanitiseContext = (kind, context) => {
    const allowed = ALLOWED[kind];
    if (!allowed || !context || typeof context !== 'object') return {};

    const out = {};
    for (const key of allowed) {
        const value = clean(context[key]);
        if (value !== '') out[key] = value;
    }
    return out;
};

/**
 * One line describing what the report is about, for the admin list.
 *
 * Built here rather than in the screen so the list and any future export
 * cannot describe the same report differently.
 */
export const describeContext = (kind, context = {}) => {
    if (kind === 'question') {
        const parts = [context.topic, context.difficulty].filter(Boolean);
        return parts.length ? parts.join(' · ') : 'Quiz question';
    }
    if (kind === 'roadmap') {
        const parts = [
            context.targetRole,
            context.weekNumber ? `week ${context.weekNumber}` : null,
        ].filter(Boolean);
        return parts.length ? parts.join(' · ') : 'Roadmap';
    }
    return context.page || 'General';
};

export default sanitiseContext;
