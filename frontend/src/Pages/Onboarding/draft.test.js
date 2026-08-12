import { describe, test, expect, beforeEach, vi } from 'vitest';

import { saveDraft, readDraft, clearDraft, hasContent } from './draft';

/**
 * Onboarding is saved in one go at the end, so until Save is pressed nothing
 * typed into it exists anywhere. These cover the cases that decide whether a
 * learner has to type their skills list a second time.
 */
const FORM = {
  target_role: 'DevOps Engineer',
  experience_level: 'beginner',
  hours_per_week: '8',
  learning_style: 'mixed',
  current_skills: ['Linux', 'Docker'],
};

beforeEach(() => {
  localStorage.clear();
});

describe('a draft', () => {
  test('comes back with what was typed', () => {
    saveDraft('u1', FORM);
    expect(readDraft('u1')).toEqual(FORM);
  });

  test('is kept per user, so a shared machine does not leak answers', () => {
    saveDraft('u1', FORM);
    expect(readDraft('u2')).toBeNull();
  });

  test('is gone once cleared', () => {
    saveDraft('u1', FORM);
    clearDraft('u1');
    expect(readDraft('u1')).toBeNull();
  });

  test('is not offered once it is stale', () => {
    saveDraft('u1', FORM);
    // Eight days on, answers are likelier to confuse than to help.
    vi.setSystemTime(Date.now() + 8 * 24 * 60 * 60 * 1000);
    expect(readDraft('u1')).toBeNull();
    vi.useRealTimers();
  });

  test('corrupt storage costs the draft, not the page', () => {
    localStorage.setItem('edupath:onboarding-draft:u1', 'not json');
    expect(() => readDraft('u1')).not.toThrow();
    expect(readDraft('u1')).toBeNull();
  });

  test('saving cannot throw the form away when storage refuses', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    // Private browsing and full quotas both do this. A draft is a
    // convenience; failing to keep one must not interrupt onboarding.
    expect(() => saveDraft('u1', FORM)).not.toThrow();
    setItem.mockRestore();
  });
});

describe('hasContent', () => {
  test('an untouched form is not worth restoring', () => {
    // Otherwise every learner who opened onboarding and left would come back
    // to a notice about answers they never gave.
    expect(hasContent({
      target_role: '', experience_level: '', hours_per_week: '',
      learning_style: 'mixed', current_skills: [],
    })).toBe(false);
  });

  test('any real answer counts', () => {
    expect(hasContent({ target_role: 'DevOps Engineer' })).toBe(true);
    expect(hasContent({ current_skills: ['Linux'] })).toBe(true);
    expect(hasContent({ hours_per_week: '5' })).toBe(true);
  });

  test('learning_style alone does not, since it starts filled in', () => {
    expect(hasContent({ learning_style: 'mixed', current_skills: [] })).toBe(false);
  });

  test('a missing form is not content', () => {
    expect(hasContent()).toBe(false);
  });
});
