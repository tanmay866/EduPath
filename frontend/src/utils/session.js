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

export default storeSession;
