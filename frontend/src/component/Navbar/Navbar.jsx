import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Wordmark, Button, Avatar, Modal } from '../../design';

/**
 * The marketing header from the landing composition: 18px 44px on white with a
 * bottom rule, wordmark left, plain 13.5px links in the middle, and a quiet
 * sign-in beside a primary on the right.
 *
 * The old bar carried five hover dropdowns and a mobile drawer, all of which
 * duplicated the learner sidebar for anyone signed in. Signed in, the right
 * side is a link into the app plus the avatar; signed out, Sign in and Start
 * free. Nothing opens on hover.
 */
const LINKS = [
  { to: '/assessment-hub', label: 'Assessments' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/resume-builder', label: 'Resume & ATS' },
  { to: '/portfolio-generator', label: 'Portfolio' },
  { to: '/services', label: 'Tracks' },
];

const linkStyle = ({ isActive }) => ({
  fontSize: 13.5,
  fontWeight: 500,
  fontFamily: 'var(--font-sans)',
  textDecoration: 'none',
  color: isActive ? 'var(--color-ink)' : 'var(--color-text-2)',
  whiteSpace: 'nowrap',
});

const readSession = () => ({
  email: sessionStorage.getItem('email'),
  firstName: sessionStorage.getItem('firstName') || '',
  lastName: sessionStorage.getItem('lastName') || '',
});

const Navbar = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(readSession);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const read = () => setSession(readSession());
    window.addEventListener('storage', read);
    window.addEventListener('sessionStorageUpdated', read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('sessionStorageUpdated', read);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    window.dispatchEvent(new Event('sessionStorageUpdated'));
    setShowLogoutModal(false);
    navigate('/');
  };

  const initials = `${session.firstName.charAt(0)}${session.lastName.charAt(0)}`.trim()
    || (session.email || '?').charAt(0).toUpperCase();

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
          padding: '18px 44px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Wordmark size={26} labelSize={21} />
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 30 }} className="max-lg:hidden">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} style={linkStyle}>{link.label}</NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          {session.email ? (
            <>
              <Button variant="quiet" onClick={() => setShowLogoutModal(true)}>Sign out</Button>
              <Link to="/assessment" style={{ textDecoration: 'none' }}>
                <Button style={{ padding: '10px 18px', fontSize: 13.5 }}>Open EduPath</Button>
              </Link>
              <Link to="/profile" style={{ textDecoration: 'none' }} title={session.email}>
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

      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign out?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Stay signed in</Button>
            <Button onClick={handleLogout}>Sign out</Button>
          </>
        }
      >
        You will need your password to get back in. Nothing you have saved is removed.
      </Modal>
    </>
  );
};

export default Navbar;
