/**
 * Session storage for a signed-in user.
 *
 * Sign-in and email verification both put the user into a logged-in state, and
 * they have to write the same keys. When verification only stored the token and
 * role, the app treated the user as half logged out — Settings looks for
 * `email` and bounced them to /signin — so a brand new account had to sign in
 * again immediately after verifying.
 *
 * Both paths call this, so the set of keys stays in one place.
 */

const CLOUDINARY_AVATAR_BASE =
  'https://res.cloudinary.com/dmk1ekxzf/image/upload/w_300,h_300,c_fill,g_face,q_auto/edupath/profile-pictures';

/**
 * @param {string} token - JWT from the API
 * @param {Object} user - the `user` object returned alongside it
 */
export const storeSession = (token, user = {}) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('userId', user.id || '');
  sessionStorage.setItem('email', user.email || '');
  sessionStorage.setItem('loginId', user.loginId || '');
  sessionStorage.setItem('role', user.role || 'student');
  sessionStorage.setItem('firstName', user.firstName || '');
  sessionStorage.setItem('lastName', user.lastName || '');
  sessionStorage.setItem('phone', user.phone || '');
  sessionStorage.setItem('skills', user.skills || '');
  // Drives the onboarding redirect. Stored rather than re-fetched so the
  // guard can decide synchronously and never flashes a page it is about to
  // navigate away from.
  sessionStorage.setItem('profileComplete', user.profile_complete ? '1' : '0');
  // The career track role-driven screens open with, so none of them has to
  // ask for it again.
  sessionStorage.setItem('targetRole', user.target_role || '');
  // Whether the first-run tour has already been dismissed. The account is the
  // source of truth; this is just a copy so the hub can decide on first paint.
  sessionStorage.setItem('tourSeen', user.tour_seen ? '1' : '0');

  // Profile pictures live only in Cloudinary; the URL is derived from the id.
  // An existing value is kept so a freshly uploaded picture is not overwritten
  // with the derived URL.
  if (!sessionStorage.getItem('profilePicture') && user.id) {
    sessionStorage.setItem('profilePicture', `${CLOUDINARY_AVATAR_BASE}/${user.id}`);
  }

  // The navbar and other components re-read sessionStorage on this event.
  // Without it they keep rendering the logged-out state until a reload.
  window.dispatchEvent(new Event('sessionStorageUpdated'));
};

/**
 * Every key storeSession writes, so clearing cannot miss one.
 *
 * Signing out used to be each screen removing the keys it happened to know
 * about, which is how a "signed out" tab kept a name in the navbar.
 */
export const SESSION_KEYS = [
  'token', 'userId', 'email', 'loginId', 'role', 'firstName', 'lastName',
  'phone', 'skills', 'profileComplete', 'targetRole', 'tourSeen',
  'profilePicture',
];

/** The session as the app reads it, or nulls when signed out. */
export const readSession = () => {
  const token = sessionStorage.getItem('token');
  if (!token) return { token: null, user: null };

  return {
    token,
    user: {
      id: sessionStorage.getItem('userId') || '',
      email: sessionStorage.getItem('email') || '',
      loginId: sessionStorage.getItem('loginId') || '',
      role: sessionStorage.getItem('role') || 'student',
      firstName: sessionStorage.getItem('firstName') || '',
      lastName: sessionStorage.getItem('lastName') || '',
      phone: sessionStorage.getItem('phone') || '',
      skills: sessionStorage.getItem('skills') || '',
      profile_complete: sessionStorage.getItem('profileComplete') === '1',
      target_role: sessionStorage.getItem('targetRole') || '',
      tour_seen: sessionStorage.getItem('tourSeen') === '1',
      profilePicture: sessionStorage.getItem('profilePicture') || '',
    },
  };
};

/**
 * Update the stored user from a partial one, leaving absent fields alone.
 *
 * This exists for the /api/auth/me refresh. That endpoint does not return
 * `phone` or `skills`, and storeSession writes every key it knows — so
 * refreshing through storeSession would blank both on a page load, which is
 * the profile screen losing a phone number nobody touched.
 */
export const mergeSession = (user = {}) => {
  const has = (key) => Object.prototype.hasOwnProperty.call(user, key);
  const write = (key, value) => sessionStorage.setItem(key, value ?? '');

  if (has('id')) write('userId', user.id);
  if (has('email')) write('email', user.email);
  if (has('loginId')) write('loginId', user.loginId);
  if (has('role')) write('role', user.role || 'student');
  if (has('firstName')) write('firstName', user.firstName);
  if (has('lastName')) write('lastName', user.lastName);
  if (has('phone')) write('phone', user.phone);
  if (has('skills')) write('skills', user.skills);
  if (has('target_role')) write('targetRole', user.target_role);
  if (has('profile_complete')) write('profileComplete', user.profile_complete ? '1' : '0');
  if (has('tour_seen')) write('tourSeen', user.tour_seen ? '1' : '0');

  window.dispatchEvent(new Event('sessionStorageUpdated'));
};

/** Signs out: every key gone, and the chrome told to re-read. */
export const clearSession = () => {
  for (const key of SESSION_KEYS) sessionStorage.removeItem(key);
  window.dispatchEvent(new Event('sessionStorageUpdated'));
};

export default storeSession;
