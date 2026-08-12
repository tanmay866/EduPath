import { describe, test, expect } from 'vitest';

import { requiresAuth } from './protectedRoutes';

/**
 * Decides whether an expired token should move somebody or just sign them
 * out where they stand. Getting it wrong in one direction throws a reader off
 * a public page; in the other it leaves them looking at an empty protected
 * screen with no explanation.
 */
describe('paths that need a session', () => {
  test.each([
    '/profile',
    '/settings',
    '/onboarding',
    '/job-fit',
    '/roadmap/plan',
    '/assessment',
    '/assessment/quiz',
    '/assessment-hub/aptitude',
    '/resume',
    '/resume-builder',
    '/ats-analyzer',
    '/portfolio-generator',
    '/admin/users',
  ])('%s', (path) => {
    expect(requiresAuth(path)).toBe(true);
  });
});

describe('paths that do not', () => {
  test.each([
    '/',
    '/about',
    '/faq',
    '/terms',
    '/privacy',
    '/contact',
    '/services',
    '/signin',
    '/signup',
    '/verify-email',
    '/unsubscribe',
    '/p/abc123',
    '/u/some-handle',
  ])('%s', (path) => {
    expect(requiresAuth(path)).toBe(false);
  });

  test('/roadmap is the marketing page and stays public', () => {
    // Naive prefix matching would catch this along with /roadmap/plan, and
    // throw anonymous readers off a page written to be read anonymously.
    expect(requiresAuth('/roadmap')).toBe(false);
    expect(requiresAuth('/roadmap/plan')).toBe(true);
  });

  test('a path that merely starts with the same letters is not protected', () => {
    // '/profile-of-the-week' starts with '/profile' but is not under it.
    expect(requiresAuth('/profile-of-the-week')).toBe(false);
    expect(requiresAuth('/settings-guide')).toBe(false);
  });

  test('an empty or missing path is not protected', () => {
    expect(requiresAuth('')).toBe(false);
    expect(requiresAuth()).toBe(false);
  });
});
