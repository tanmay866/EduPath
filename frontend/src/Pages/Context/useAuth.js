import { createContext, useContext } from 'react';

/**
 * The context lives here rather than beside the provider, for the same reason
 * useQuiz.js does: a file exporting both a component and a value loses fast
 * refresh, and here that would remount the whole signed-in app on every edit.
 */
export const AuthContext = createContext(null);

/**
 * The signed-in user, and the operations that change who that is.
 *
 * Returns:
 *   status          'loading' until the first /me refresh settles, then
 *                   'authenticated' or 'anonymous'
 *   isAuthenticated whether a token is held — decided synchronously on the
 *                   first render, so guards never flash a page they are
 *                   about to navigate away from
 *   user            the stored user, or null
 *   profileComplete whether onboarding has been finished
 *   signIn          store a token and user, after login or verification
 *   signOut         clear everything
 *   refresh         re-read the account from the API
 */
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return value;
};

export default useAuth;
