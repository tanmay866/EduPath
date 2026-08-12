/**
 * Keeps a half-finished onboarding form.
 *
 * The form is saved in one go at the end, so until Save is pressed nothing
 * typed into it exists anywhere. Leaving to check something, following the
 * "skip for now" link, a refresh, or the tab being restored all discarded the
 * lot — and this is the screen where a learner is asked to list the skills
 * they already have, which is the most tedious thing to type twice.
 *
 * localStorage rather than sessionStorage: a closed tab is exactly the case
 * worth surviving, and sessionStorage does not outlive one. It holds no
 * credentials — a target role, an experience level, hours a week and a list of
 * skills — but it is still keyed per user and cleared on a successful save, so
 * a shared machine does not offer one person's answers to the next.
 */
const KEY_PREFIX = 'edupath:onboarding-draft';

const keyFor = (userId) => (userId ? `${KEY_PREFIX}:${userId}` : KEY_PREFIX);

/** Anything older than this is likelier to confuse than to help. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const saveDraft = (userId, form) => {
  try {
    localStorage.setItem(
      keyFor(userId),
      JSON.stringify({ savedAt: Date.now(), form })
    );
  } catch {
    // Quota or private browsing. A draft is a convenience; failing to keep
    // one must never interrupt the form itself.
  }
};

/**
 * The stored draft, or null when there is nothing usable.
 *
 * Returns null rather than throwing on corrupt JSON, because a bad draft
 * should cost someone the draft and not the page.
 */
export const readDraft = (userId) => {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.form) return null;
    if (Date.now() - (parsed.savedAt || 0) > MAX_AGE_MS) {
      localStorage.removeItem(keyFor(userId));
      return null;
    }

    return parsed.form;
  } catch {
    return null;
  }
};

export const clearDraft = (userId) => {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch {
    // See above.
  }
};

/**
 * Whether a draft is worth restoring over what the server already knows.
 *
 * An untouched form is all empty strings and an empty list; offering to
 * restore that would be offering nothing, and would put a notice on the
 * screen of every learner who opened onboarding and immediately left.
 */
export const hasContent = (form = {}) =>
  Boolean(
    form.target_role ||
    form.experience_level ||
    form.hours_per_week ||
    (Array.isArray(form.current_skills) && form.current_skills.length > 0)
  );
