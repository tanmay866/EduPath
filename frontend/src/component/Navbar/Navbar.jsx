import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Wordmark, Button, Avatar } from '../../design';

/**
 * The marketing header from the landing composition: 18px 44px on white with a
 * bottom rule, wordmark left, plain 13.5px links in the middle, and a quiet
 * sign-in beside a primary on the right.
 *
 * The old bar carried five hover dropdowns and a mobile drawer, all of which
 * duplicated the learner sidebar for anyone signed in. Signed in, the right
 * side is a link into the app plus the avatar; signed out, Sign in and Start
 * free. Nothing opens on hover.
 *
 * Sign out lives on the Settings page, not here — the learner sidebar
 * already carries it on every page inside the app, so a second copy here
 * was a duplicate control rather than a needed one.
 */
/**
 * The bar offered five links to everyone, and three of them went nowhere
 * without an account: Assessments, Resume & ATS and Portfolio are app
 * screens, so a signed-out visitor clicking one was sent straight to the
 * sign-in page. Advertising a door that is locked is worse than not drawing
 * the door.
 *
 * The two without `app` are the two that genuinely work signed out. Roadmap
 * and Tracks explain the product to someone deciding whether to sign up,
 * which is the whole reason this bar exists on a marketing page; hiding
 * those as well would leave a prospect nothing to read.
 *
 * One list rather than two, so the order cannot drift and a new link is
 * placed once — marking it `app` is the only decision to make.
 */
const LINKS = [
  { to: '/assessment-hub', label: 'Assessments', app: true },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/resume-builder', label: 'Resume & ATS', app: true },
  { to: '/portfolio-generator', label: 'Portfolio', app: true },
  { to: '/services', label: 'Tracks' },
];

const linksFor = (signedIn) => LINKS.filter((link) => signedIn || !link.app);

// Colour alone marked the current page, one step of grey apart, which is easy
// to miss and carries nothing for anyone who cannot separate the two. NavLink
// already sets aria-current; this adds a rule under the word, the same device
// the rest of the system uses to mark a section.
const linkStyle = ({ isActive }) => ({
  fontSize: 13.5,
  fontWeight: 500,
  fontFamily: 'var(--font-sans)',
  textDecoration: 'none',
  color: isActive ? 'var(--color-ink)' : 'var(--color-text-2)',
  whiteSpace: 'nowrap',
  paddingBottom: 3,
  borderBottom: `1px solid ${isActive ? 'var(--color-ink)' : 'transparent'}`,
});

const readSession = () => ({
  email: sessionStorage.getItem('email'),
  firstName: sessionStorage.getItem('firstName') || '',
  lastName: sessionStorage.getItem('lastName') || '',
});

const Navbar = () => {
  const [session, setSession] = useState(readSession);

  useEffect(() => {
    const read = () => setSession(readSession());
    window.addEventListener('storage', read);
    window.addEventListener('sessionStorageUpdated', read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('sessionStorageUpdated', read);
    };
  }, []);

  const initials = `${session.firstName.charAt(0)}${session.lastName.charAt(0)}`.trim()
    || (session.email || '?').charAt(0).toUpperCase();

  return (
    <header className="site-header">
      <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <Wordmark size={26} labelSize={21} />
      </Link>

      <nav className="site-header__nav" aria-label="Main">
        {linksFor(Boolean(session.email)).map((link) => (
          <NavLink key={link.to} to={link.to} style={linkStyle}>{link.label}</NavLink>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        {session.email ? (
          <>
            <Link to="/assessment" style={{ textDecoration: 'none' }}>
              <Button style={{ padding: '10px 18px', fontSize: 13.5 }}>Open EduPath</Button>
            </Link>
            <Link
              to="/profile"
              style={{ textDecoration: 'none' }}
              title={session.email}
              aria-label={`Your profile${session.email ? ` (${session.email})` : ''}`}
            >
              <Avatar initials={initials} size={32} fontSize={12} />
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/signin"
              style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--color-text-2)', textDecoration: 'none' }}
            >
              Sign in
            </Link>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Button style={{ padding: '10px 18px', fontSize: 13.5 }}>Start free</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
