import React, { useEffect, useState } from 'react';
import { SiteFooter } from '../../design';

/**
 * Spec §6 Footer — ink panel, 48px 32px, inner 1100px, brand left, link
 * columns right, a mono line under a #2A2822 rule.
 *
 * Three things were wrong with the old set of links.
 *
 * Tracks was missing, though it is in the main nav and is the page that
 * answers "what can I actually learn here". So was the ATS check, which had no
 * route into it from anywhere except the Resume page.
 *
 * The four assessments were reachable only by going to the hub first. They are
 * the thing people arrive wanting, so they get a column.
 *
 * And the Account column listed "Sign in", "Create an account", "Profile" and
 * "Settings" all at once, to everybody. Half of it was always wrong: a signed
 * in visitor was invited to sign in, and a signed out one was offered a
 * profile page that bounces them to the sign-in screen. It now follows the
 * session, the same way the navbar does.
 *
 * The YouTube badge is gone: §5 allows no icon buttons.
 */

const PRODUCT = {
  heading: 'Product',
  links: [
    { label: 'Tracks', to: '/services' },
    { label: 'Roadmap', to: '/roadmap' },
    { label: 'Resume builder', to: '/resume-builder' },
    { label: 'ATS check', to: '/ats-analyzer' },
    { label: 'Portfolio', to: '/portfolio-generator' },
  ],
};

const ASSESSMENTS = {
  heading: 'Assessments',
  links: [
    { label: 'All four', to: '/assessment-hub' },
    { label: 'Skill assessment', to: '/assessment-hub/skill' },
    { label: 'Aptitude test', to: '/assessment-hub/aptitude' },
    { label: 'CS fundamentals', to: '/assessment-hub/cs-fundamentals' },
    { label: 'Mock interview', to: '/assessment-hub/mock-interview' },
  ],
};

const COMPANY = {
  heading: 'Company',
  links: [
    { label: 'About', to: '/about' },
    { label: 'How it works', to: '/work' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Contact', to: '/contact' },
    // Reachable without an account, since they are what someone reads
    // before deciding to make one.
    { label: 'Terms', to: '/terms' },
    { label: 'Privacy', to: '/privacy' },
  ],
};

const SIGNED_OUT = {
  heading: 'Account',
  links: [
    { label: 'Sign in', to: '/signin' },
    { label: 'Create an account', to: '/signup' },
  ],
};

const SIGNED_IN = {
  heading: 'Account',
  links: [
    { label: 'Overview', to: '/assessment' },
    { label: 'My roadmap', to: '/roadmap/plan' },
    { label: 'Profile', to: '/profile' },
    { label: 'Settings', to: '/settings' },
  ],
};

const BLURB =
  'Find out where your skills actually are, get a week-by-week plan for the role '
  + 'you want, and the resume and portfolio to apply with.';

// The same details the contact page lists, so the two cannot disagree. The
// phone number stays on that page rather than every screen on the site.
const CONTACT = [
  { label: 'edupath.developers@gmail.com', href: 'mailto:edupath.developers@gmail.com' },
  { label: 'CHARUSAT University, Changa, Anand' },
];

const isSignedIn = () => Boolean(sessionStorage.getItem('token'));

const Footer = () => {
  const [signedIn, setSignedIn] = useState(isSignedIn);

  // Mirrors the navbar: sessionStorageUpdated fires in this tab after sign in
  // or sign out, `storage` covers the same account in another one.
  useEffect(() => {
    const read = () => setSignedIn(isSignedIn());
    window.addEventListener('storage', read);
    window.addEventListener('sessionStorageUpdated', read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('sessionStorageUpdated', read);
    };
  }, []);

  return (
    <SiteFooter
      columns={[PRODUCT, ASSESSMENTS, COMPANY, signedIn ? SIGNED_IN : SIGNED_OUT]}
      blurb={BLURB}
      contact={CONTACT}
    />
  );
};

export default Footer;
