/**
 * The handle a published portfolio lives at.
 *
 * Portfolios were saved with `username: user.username`, and there is no
 * username field on a user — there never has been. So every portfolio ever
 * created stored an empty string, which made `GET /portfolio/u/:username`
 * impossible to satisfy for anybody: the route, the model field and the
 * download filename all read a value nothing wrote.
 *
 * The handle is derived from the person's name rather than asked for. A
 * portfolio is generated in one action from a resume, and interrupting that
 * to invent a URL slug is a question nobody wants at that moment. It stays
 * changeable later; what matters is that it exists.
 */

/**
 * A name reduced to something that can sit in a URL.
 *
 * Returns '' when nothing usable survives — an accented-only or symbol-only
 * name is a real possibility, and a caller has to be able to tell that apart
 * from a working handle rather than publishing at a blank address.
 */
export const slugify = (value) =>
    String(value || '')
        .normalize('NFKD')
        // Strip accents rather than dropping the letters they sit on, so
        // "José" becomes "jose" instead of "jos".
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40)
        .replace(/-+$/g, '');

/**
 * A handle that is not already taken.
 *
 * `isTaken` is asked rather than assumed so the caller owns the storage
 * question. Suffixes count up rather than being random, because a person
 * reading "jane-smith-2" can tell what happened.
 *
 * Falls back to the portfolio's own id when the name yields nothing, since a
 * URL that works and reads badly beats no URL at all.
 */
export const uniqueHandle = async (name, isTaken, fallback = '') => {
    const base = slugify(name) || slugify(fallback) || 'portfolio';

    if (!(await isTaken(base))) return base;

    // Bounded: past a handful of collisions the name is not the problem, and
    // an unbounded loop against a database is not something to leave running.
    for (let n = 2; n <= 50; n += 1) {
        const candidate = `${base}-${n}`;
        if (!(await isTaken(candidate))) return candidate;
    }

    return `${base}-${Date.now().toString(36)}`;
};

export default uniqueHandle;
