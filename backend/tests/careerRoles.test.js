import test from 'node:test';
import assert from 'node:assert/strict';
import { CAREER_ROLES, isCareerRole } from '../utils/careerRoles.js';

/**
 * Role used to be free text, and the roadmap page guessed which track a typed
 * role meant by substring. Because 'ai' and 'ml' were keywords, "Email
 * Marketer", "HTML Developer" and "Blockchain Developer" all resolved to
 * AI/ML Engineer, and "QA Engineer" resolved to nothing and blocked
 * generation outright.
 *
 * The guesser is gone and the value is an enum. These pin that down: the
 * strings have to match the AI service's role templates exactly, so a
 * well-meaning reword here breaks roadmap generation silently.
 */
test('the six supported roles are accepted', () => {
  for (const role of CAREER_ROLES) {
    assert.equal(isCareerRole(role), true, `${role} should be accepted`);
  }
});

test('there are exactly six, and they are the template names', () => {
  assert.deepEqual(CAREER_ROLES, [
    'MERN Developer',
    'AI/ML Engineer',
    'Data Science Engineer',
    'DevOps Engineer',
    'Mobile Developer',
    'Cybersecurity Engineer',
  ]);
});

test('job titles that used to be mis-guessed are rejected outright', () => {
  // Every one of these was silently mapped to a real role by the old guesser.
  for (const typed of [
    'Email Marketer',
    'HTML Developer',
    'Retail Analyst',
    'Blockchain Developer',
    'Maintenance Engineer',
    'Database Administrator',
    'Full Stack Dev',
    'QA Engineer',
  ]) {
    assert.equal(isCareerRole(typed), false, `${typed} should not be a career role`);
  }
});

test('near-misses in spelling and case are rejected, not coerced', () => {
  for (const near of ['mern developer', 'AI/ML  Engineer', 'DevOps', 'MERN']) {
    assert.equal(isCareerRole(near), false, `${near} should not pass as canonical`);
  }
});

test('empty and missing values are not roles', () => {
  for (const empty of ['', '   ', null, undefined]) {
    assert.equal(isCareerRole(empty), false);
  }
});
