import React from 'react';
import { SiteFooter } from '../../design';

/**
 * Spec §6 Footer — ink panel, 48px 32px, inner 1100px, logo left, link columns
 * right, a mono copyright line under a #2A2822 rule. The whole thing lives in
 * SiteFooter; this file only supplies the columns.
 *
 * The YouTube badge is gone: §5 allows no icon buttons, and the same link now
 * sits in the Elsewhere column as text.
 */
const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Assessments', to: '/assessment-hub' },
      { label: 'Roadmap', to: '/roadmap' },
      { label: 'Resume & ATS', to: '/resume-builder' },
      { label: 'Portfolio', to: '/portfolio-generator' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'How it works', to: '/work' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in', to: '/signin' },
      { label: 'Create an account', to: '/signup' },
      { label: 'Profile', to: '/profile' },
      { label: 'Settings', to: '/settings' },
    ],
  },
];

const Footer = () => <SiteFooter columns={COLUMNS} />;

export default Footer;
