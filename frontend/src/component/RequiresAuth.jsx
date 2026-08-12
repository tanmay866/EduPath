import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Pages/Context/useAuth';

/**
 * Keeps a signed-out visitor out of the learner app.
 *
 * Every page here used to guard itself, with a useEffect that read the token
 * and navigated away. Nine pages, each having to remember, and two had not:
 * the assessment hub and the skill assessment rendered for anyone who typed
 * the URL. Doing it on the route means a new page cannot forget, because
 * forgetting now means leaving it out of the list rather than omitting a
 * line inside the file.
 *
 * It is also earlier. An effect runs after the first paint, so the page
 * appears and then disappears; this decides before anything renders.
 *
 * The API is what actually protects the data — every creation endpoint
 * refuses an unauthenticated request on its own, and this changes none of
 * that. What it fixes is a signed-out visitor being shown a form, filling it
 * in, and only then being told to sign in.
 *
 * `next` carries where they were going, so signing in finishes the trip
 * rather than dropping them somewhere else.
 *
 * It reads the shared auth state rather than sessionStorage directly, which
 * is what lets an expiry detected by the API interceptor take effect here
 * immediately instead of on the next full page load.
 */
const RequiresAuth = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/signin?next=${next}`} replace />;
  }

  return children;
};

export default RequiresAuth;
