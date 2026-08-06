import { describe, test, expect, vi } from 'vitest';

import { storeSession } from './session';

/**
 * storeSession is the whole of sign-in as far as the rest of the app is
 * concerned: the navbar, the footer, RequiresProfile and the onboarding
 * redirect all read what it writes. A field it forgets is a screen that shows
 * the wrong thing to a signed-in user.
 */
const USER = {
  id: 'u1',
  email: 'learner@example.com',
  loginId: 'TAPA2026001',
  role: 'student',
  firstName: 'Tanmay',
  lastName: 'Patel',
  phone: '9313928398',
  skills: 'React, Node',
  profile_complete: true,
  target_role: 'AI/ML Engineer',
  tour_seen: true,
};

describe('storeSession', () => {
  test('writes what the guards and chrome read back', () => {
    storeSession('jwt-token', USER);
    expect(sessionStorage.getItem('token')).toBe('jwt-token');
    expect(sessionStorage.getItem('email')).toBe('learner@example.com');
    expect(sessionStorage.getItem('role')).toBe('student');
    expect(sessionStorage.getItem('loginId')).toBe('TAPA2026001');
    expect(sessionStorage.getItem('targetRole')).toBe('AI/ML Engineer');
  });

  test('booleans become the "1" / "0" the guards compare against', () => {
    // RequiresProfile tests `!== '1'`, so a raw boolean or "true" would send a
    // complete profile back to onboarding on every protected route.
    storeSession('t', USER);
    expect(sessionStorage.getItem('profileComplete')).toBe('1');
    expect(sessionStorage.getItem('tourSeen')).toBe('1');

    storeSession('t', { ...USER, profile_complete: false, tour_seen: false });
    expect(sessionStorage.getItem('profileComplete')).toBe('0');
    expect(sessionStorage.getItem('tourSeen')).toBe('0');
  });

  test('missing fields are stored empty, never the string "undefined"', () => {
    storeSession('t', {});
    for (const key of ['email', 'firstName', 'lastName', 'phone', 'skills', 'targetRole', 'loginId']) {
      expect(sessionStorage.getItem(key), key).toBe('');
    }
    // A user object omitted entirely must not throw either.
    expect(() => storeSession('t')).not.toThrow();
  });

  test('role defaults to student rather than empty', () => {
    storeSession('t', {});
    expect(sessionStorage.getItem('role')).toBe('student');
  });

  test('announces the change, or the navbar keeps rendering signed out', () => {
    const listener = vi.fn();
    window.addEventListener('sessionStorageUpdated', listener);
    storeSession('t', USER);
    expect(listener).toHaveBeenCalled();
    window.removeEventListener('sessionStorageUpdated', listener);
  });

  test('an already-uploaded picture is not overwritten by the derived URL', () => {
    sessionStorage.setItem('profilePicture', 'https://cdn.example/custom.png');
    storeSession('t', USER);
    expect(sessionStorage.getItem('profilePicture')).toBe('https://cdn.example/custom.png');
  });

  test('a derived picture URL is set when there is none', () => {
    storeSession('t', USER);
    expect(sessionStorage.getItem('profilePicture')).toContain('u1');
  });
});
