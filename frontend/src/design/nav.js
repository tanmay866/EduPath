/**
 * Navigation for the learner and admin shells.
 *
 * Defined once because §6 puts the sidebar in the shell rather than on each
 * screen — every learner page renders the same sections, and a nav item added
 * here appears everywhere without visiting ten files.
 */

export const learnerNav = [
  {
    label: 'Learn',
    items: [
      { to: '/assessment', label: 'Overview', end: true },
      // The learner's own plan, not the public page about roadmaps —
      // every other item here goes straight to its screen, and this one
      // used to drop a signed-in learner onto marketing with the public
      // navbar and make them click through.
      { to: '/roadmap/plan', label: 'Roadmap' },
      { to: '/job-fit', label: 'Job fit' },
      { to: '/assessment-hub', label: 'Assessments' },
    ],
  },
  {
    label: 'Build',
    items: [
      { to: '/resume-builder', label: 'Resume' },
      { to: '/ats-analyzer', label: 'ATS check' },
      { to: '/portfolio-generator', label: 'Portfolio' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile' },
      { to: '/settings', label: 'Settings' },
    ],
  },
];

export const adminNav = [
  // Exact match only — every other admin path sits under /admin.
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/quiz-attempts', label: 'Attempts' },
  { to: '/admin/roadmaps', label: 'Roadmaps' },
  { to: '/admin/analytics', label: 'AI analytics' },
  { to: '/admin/settings', label: 'Settings' },
];

/** Initials for the header avatar, from whatever the session holds. */
export const sessionInitials = () => {
  const first = sessionStorage.getItem('firstName') || '';
  const last = sessionStorage.getItem('lastName') || '';
  const fallback = sessionStorage.getItem('email') || '';
  const initials = `${first.charAt(0)}${last.charAt(0)}`.trim();
  return initials || fallback.charAt(0).toUpperCase() || '—';
};

/** Login ID for the sidebar footer, falling back to the address. */
export const sessionLoginId = () =>
  sessionStorage.getItem('loginId') || sessionStorage.getItem('email') || 'Signed in';

export const sessionName = () => {
  const first = sessionStorage.getItem('firstName') || '';
  const last = sessionStorage.getItem('lastName') || '';
  return `${first} ${last}`.trim() || sessionStorage.getItem('email') || 'Your account';
};
