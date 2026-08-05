import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeDifficulty, isDifficulty, DIFFICULTIES } from '../utils/difficulty.js';

/**
 * The bug this guards: CS Fundamentals stored "Easy" because its picker
 * mirrors the upstream question API and PracticeResult had no enum. Those rows
 * matched no admin filter, so they were counted in the totals and absent from
 * every breakdown — the kind of gap that looks like a chart bug rather than
 * bad data.
 */
test('the three stored difficulties pass through untouched', () => {
  for (const value of DIFFICULTIES) assert.equal(normalizeDifficulty(value), value);
});

test('the upstream Easy/Medium/Hard vocabulary is mapped, not stored', () => {
  assert.equal(normalizeDifficulty('Easy'), 'beginner');
  assert.equal(normalizeDifficulty('Medium'), 'intermediate');
  assert.equal(normalizeDifficulty('Hard'), 'advanced');
});

test('case and surrounding space do not decide whether a row is filterable', () => {
  assert.equal(normalizeDifficulty('  HARD  '), 'advanced');
  assert.equal(normalizeDifficulty('BeGiNnEr'), 'beginner');
});

test('nothing usable becomes null rather than an invented level', () => {
  // Guessing here would put rows in a chart an admin reads as fact.
  for (const value of ['', '   ', null, undefined, 'somewhat tricky', 42]) {
    assert.equal(normalizeDifficulty(value), null, JSON.stringify(value));
  }
});

test('isDifficulty accepts only what the collections store', () => {
  assert.equal(isDifficulty('beginner'), true);
  assert.equal(isDifficulty('Advanced'), true);
  assert.equal(isDifficulty('Easy'), false);
  assert.equal(isDifficulty(''), false);
});

test('normalising twice changes nothing the second time', () => {
  const once = normalizeDifficulty('Medium');
  assert.equal(normalizeDifficulty(once), once);
});
