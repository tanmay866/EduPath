/**
 * Where the API lives.
 *
 * Every caller used to work this out for itself, and most did it as
 * `'' + import.meta.env.VITE_API_URL + ''`. That is string concatenation, so a
 * build with the variable unset produced the literal text "undefined" and the
 * app then requested "undefined/api/..." — it built cleanly and failed only at
 * runtime, against the wrong origin, with nothing explaining why.
 *
 * This resolves it once. If the variable is missing the app falls back to the
 * API on the conventional port of whatever host served the page, which is
 * right in local development and wrong-but-obvious in production — and says so
 * loudly rather than inventing a URL.
 */
const RAW = import.meta.env.VITE_API_URL;

const fallbackOrigin = () => {
  // 0.0.0.0 is reachable as a bind address but not as a destination.
  const host = window.location.hostname === '0.0.0.0' ? 'localhost' : window.location.hostname;
  return `${window.location.protocol}//${host}:4000`;
};

const resolve = () => {
  const configured = String(RAW || '').trim();
  if (configured) return configured.replace(/\/+$/, '');

  const guess = fallbackOrigin();
  console.error(
    `[EduPath] VITE_API_URL is not set. Falling back to ${guess}. ` +
      'Set it at build time, or API calls will go to the wrong host in production.'
  );
  return guess;
};

/** Origin only, no trailing slash — e.g. https://api.example.com */
export const API_URL = resolve();

/** Origin plus /api, for callers that were appending it themselves. */
export const API_BASE = `${API_URL}/api`;

export default API_URL;
