import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Pages/Context/useAuth';
import { Loading } from '../design';

/**
 * Sends a user to onboarding when the page they opened cannot work without a
 * target role.
 *
 * Only wrap pages that genuinely need one. Aptitude and CS Fundamentals are
 * role-independent, and gating them would be inventing a requirement. The
 * roadmap and the skill assessment do need it: results are filed against the
 * role they were earned under, so taking one with no role set files the work
 * where nothing will ever read it.
 *
 * Being signed in is decided synchronously, from the token held on this tab.
 * Having a profile is not, and the difference matters: the stored flag is a
 * copy, and it is wrong for anyone who finished onboarding in another tab or
 * on another device. Acting on a stale '0' sends a learner who is already set
 * up back through setup. So while the opening /me refresh is still in flight
 * this waits rather than redirecting — a moment of loading on a protected
 * page, against wrongly restarting onboarding.
 *
 * The wait only ever applies to somebody holding a token; a signed-out
 * visitor is turned away on the first render as before.
 */
const RequiresProfile = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, profileComplete, status } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (status === 'loading' && !profileComplete) {
    return <Loading label="Checking your setup" style={{ padding: '120px 20px' }} />;
  }

  if (!profileComplete) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/onboarding?next=${next}`} replace />;
  }

  return children;
};

export default RequiresProfile;
