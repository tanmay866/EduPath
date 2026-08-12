import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContext } from './useAuth';
import {
  storeSession,
  readSession,
  mergeSession,
  clearSession,
} from '../../utils/session';

/**
 * One source of truth for who is signed in.
 *
 * Auth used to be read straight from sessionStorage wherever it was needed —
 * 138 reads across 43 files — so there was no such thing as "the current
 * user", only whatever each screen happened to look up. Two screens could
 * disagree, and nothing could react to a sign-in without the manual
 * `sessionStorage.setItem` plus `dispatchEvent` pair that every writer had to
 * remember.
 *
 * The state still lives in sessionStorage underneath, deliberately. A tab
 * reload has to survive, and the screens not yet migrated go on reading the
 * same keys and go on working — so this can be adopted a screen at a time
 * rather than in one sweep that touches every page in the app.
 */
export const AuthProvider = ({ children }) => {
  // Read synchronously on the very first render rather than in an effect.
  // The guards decide from this, and an effect would let them see "signed
  // out" for one paint and bounce a signed-in user to /signin.
  const [session, setSession] = useState(() => readSession());

  // 'loading' only while the opening refresh is in flight, and only when
  // there is a token worth refreshing. A signed-out visitor is anonymous
  // immediately — making them wait on a request that will not be sent would
  // put a spinner in front of the marketing pages.
  const [refreshing, setRefreshing] = useState(() => Boolean(readSession().token));

  const signIn = useCallback((token, user) => {
    storeSession(token, user);
    setSession(readSession());
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setSession({ token: null, user: null });
  }, []);

  /**
   * Re-read the account from the API.
   *
   * Merged rather than replaced: /api/auth/me does not return phone or
   * skills, and writing the whole session from it would blank both.
   */
  const refresh = useCallback(async () => {
    if (!readSession().token) return null;

    try {
      // Imported here rather than at the top of the file, and the reason is
      // bundle size, not taste. This provider is mounted eagerly in main.jsx,
      // so a static import would drag the API client — and axios with it —
      // out of its own chunk and into the entry bundle, which measured 52 kB
      // on a bundle that had just been split to avoid exactly that. Nobody
      // signed out ever calls this, so the landing page should not carry it.
      const { fetchMe } = await import('../Services/authService');
      const user = await fetchMe();
      mergeSession(user);
      setSession(readSession());
      return user;
    } catch (error) {
      // A 401 here is a dead token, and the interceptor has already cleared
      // the session — reflect that rather than holding a user the API will
      // refuse. Any other failure (offline, a sleeping backend) leaves the
      // stored session alone: it is probably still good, and signing
      // somebody out because their train went into a tunnel is worse than
      // showing them slightly stale details.
      if (error?.response?.status === 401) {
        setSession({ token: null, user: null });
      }
      return null;
    }
  }, []);

  // On start, correct what the stored session may have got wrong. Finishing
  // onboarding in another tab, an admin changing a role, a profile completed
  // on another device — all of it is stale here until this runs.
  useEffect(() => {
    let cancelled = false;

    if (!readSession().token) {
      setRefreshing(false);
      return undefined;
    }

    refresh().finally(() => {
      if (!cancelled) setRefreshing(false);
    });

    return () => { cancelled = true; };
  }, [refresh]);

  // The interceptor clears storage on an expired token from anywhere in the
  // app, including the many screens still calling the API directly. Without
  // this the chrome would keep showing a signed-in user until the next
  // navigation. Sign-in and sign-out fire the same event, so this keeps
  // untouched writers working too.
  useEffect(() => {
    const sync = () => setSession(readSession());
    window.addEventListener('sessionStorageUpdated', sync);
    return () => window.removeEventListener('sessionStorageUpdated', sync);
  }, []);

  const value = useMemo(() => ({
    status: refreshing ? 'loading' : session.token ? 'authenticated' : 'anonymous',
    isAuthenticated: Boolean(session.token),
    token: session.token,
    user: session.user,
    profileComplete: Boolean(session.user?.profile_complete),
    isAdmin: session.user?.role === 'admin',
    signIn,
    signOut,
    refresh,
  }), [refreshing, session, signIn, signOut, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
