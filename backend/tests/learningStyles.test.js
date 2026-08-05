import test from 'node:test';
import assert from 'node:assert/strict';
import { LEARNING_STYLES, isLearningStyle } from '../utils/learningStyles.js';

/**
 * These are the keys the AI service looks its weekly task templates up by. It
 * falls back to "mixed" for anything unrecognised, so a value drifting from
 * this list does not error — the setting just silently stops mattering, which
 * is how it went unnoticed that it was never read at all.
 */
test('the four styles are exactly what the task templates are keyed by', () => {
  assert.deepEqual(LEARNING_STYLES, ['mixed', 'video', 'reading', 'project']);
});

test('each supported style is accepted', () => {
  for (const style of LEARNING_STYLES) {
    assert.equal(isLearningStyle(style), true, `${style} should be accepted`);
  }
});

test('plausible near-misses are rejected rather than silently becoming mixed', () => {
  // "projects" is the label shown in the dropdown; the stored value is
  // "project". Sending the label would quietly fall back to mixed.
  for (const wrong of ['projects', 'Mixed', 'VIDEO', 'read', 'hands-on', 'audio']) {
    assert.equal(isLearningStyle(wrong), false, `${wrong} should not be accepted`);
  }
});

test('empty and missing values are not styles', () => {
  for (const empty of ['', '  ', null, undefined]) {
    assert.equal(isLearningStyle(empty), false);
  }
});
