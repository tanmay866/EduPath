import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * The "start the assessment" call to action used across the marketing pages.
 *
 * These all pointed at /signup unconditionally, so a signed-in user clicking
 * "Begin assessment" was sent to create an account they already had. The
 * destination now depends on whether there is a session, and it lives here
 * rather than in four pages so the four cannot drift apart.
 *
 * Session state is read the same way the navbar reads it — including the
 * sessionStorageUpdated event — so the link switches the moment someone signs
 * in or out, without needing a reload.
 */
const hasSession = () => Boolean(sessionStorage.getItem('token'));

export const StartLink = ({ children, to = '/assessment-hub', style }) => {
  const [signedIn, setSignedIn] = useState(hasSession);

  useEffect(() => {
    const read = () => setSignedIn(hasSession());
    // `storage` covers the same account in another tab; the custom event is
    // what sign-in and sign-out dispatch in this one.
    window.addEventListener('storage', read);
    window.addEventListener('sessionStorageUpdated', read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('sessionStorageUpdated', read);
    };
  }, []);

  return (
    <Link to={signedIn ? to : '/signup'} style={{ textDecoration: 'none', ...style }}>
      {children}
    </Link>
  );
};

export default StartLink;
