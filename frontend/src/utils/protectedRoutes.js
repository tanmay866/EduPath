/**
 * Which paths cannot be read without a session.
 *
 * The router is the real authority — RequiresAuth and RequiresProfile wrap
 * these same routes in App.jsx. This list exists because the expired-token
 * handler runs inside an axios interceptor, outside React, with no router to
 * ask. Adding a protected route means adding its prefix here; the cost of
 * forgetting is small and one-directional, since a missed prefix means the
 * guard redirects on the next render instead of the interceptor doing it
 * immediately.
 */
/**
 * Hyphenated siblings are listed separately on purpose. Matching is on a path
 * segment — '/assessment' or '/assessment/…' — so '/assessment-hub' is not
 * covered by '/assessment', and '/resume-builder' is not covered by
 * '/resume'. Matching on a bare string prefix instead would drag in anything
 * that merely starts with the same letters, so the segment rule stays and the
 * real routes are named.
 */
const PROTECTED_PREFIXES = [
  '/admin',
  '/assessment',
  '/assessment-hub',
  '/ats-analyzer',
  '/job-fit',
  '/onboarding',
  '/portfolio-generator',
  '/profile',
  '/resume',
  '/resume-builder',
  '/roadmap/plan',
  '/settings',
];

/**
 * `/roadmap` is the marketing page and is public; `/roadmap/plan` is the
 * learner's actual plan and is not. Prefix matching alone would make the
 * public one protected, so the specific path is listed above and the bare
 * one has to stay out of it.
 */
export const requiresAuth = (pathname = '') =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

/**
 * Guards against a burst of redirects.
 *
 * A screen that fires four requests on mount gets four 401s when the token
 * has expired, and each one would otherwise push its own navigation — so the
 * address bar ends up carrying `next` from whichever lost the race, and the
 * history stack has four entries the user has to press Back through.
 */
let redirecting = false;

export const redirectToSignIn = (from = '') => {
  if (redirecting) return;
  // Already there. Redirecting to the page you are on reloads it and throws
  // away anything typed into the form.
  if (window.location.pathname === '/signin') return;

  redirecting = true;
  const next = encodeURIComponent(from);
  window.location.assign(`/signin?next=${next}&expired=1`);
};

/** Test seam: the module-level latch would otherwise leak between cases. */
export const resetRedirectLatch = () => { redirecting = false; };
