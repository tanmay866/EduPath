/**
 * Shared bits of admin table formatting.
 *
 * Kept out of the page files so fast refresh keeps working — a module that
 * exports both a component and a constant loses it.
 */

// Matches QuizResult's actual enum ('beginner' | 'intermediate' | 'advanced'),
// capitalised the same way shapeAttempt() capitalises it on the backend.
// Earlier labels here were 'Easy' / 'Medium' / 'Hard', copied from mock data —
// they never matched a real row once the screens were wired to the API.
export const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

/** Score colour: green at or above 70%, clay below 50%, plain ink between. */
export const scoreTone = (pct) =>
  pct >= 70 ? 'var(--color-green)' : pct < 50 ? 'var(--color-clay)' : 'var(--color-ink)';

export const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
