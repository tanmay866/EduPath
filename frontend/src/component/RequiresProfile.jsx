import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

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
 * The check is synchronous on purpose — reading the flag written at sign-in
 * avoids rendering the page for a moment before navigating away from it.
 */
const RequiresProfile = ({ children }) => {
  const location = useLocation();

  if (!sessionStorage.getItem('token')) {
    return <Navigate to="/signin" replace />;
  }

  if (sessionStorage.getItem('profileComplete') !== '1') {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/onboarding?next=${next}`} replace />;
  }

  return children;
};

export default RequiresProfile;
