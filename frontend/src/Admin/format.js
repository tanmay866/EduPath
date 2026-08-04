/**
 * Shared bits of admin table formatting.
 *
 * Kept out of the page files so fast refresh keeps working — a module that
 * exports both a component and a constant loses it.
 */

export const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

/** Score colour: green at or above 70%, clay below 50%, plain ink between. */
export const scoreTone = (pct) =>
  pct >= 70 ? 'var(--color-green)' : pct < 50 ? 'var(--color-clay)' : 'var(--color-ink)';

export const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
