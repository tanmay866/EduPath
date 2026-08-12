import test from 'node:test';
import assert from 'node:assert/strict';
import {
  wilsonInterval,
  confidenceLevel,
  swingPerQuestion,
  scoreConfidence,
} from '../utils/scoreConfidence.js';

/**
 * Four out of five and sixteen out of twenty are both 80%, and they are not
 * the same claim: one more question going the other way moves the first by
 * twenty points and the second by five. Both were shown identically and both
 * could drop a skill from a roadmap.
 */

test('a thin result is reported as a wide range', () => {
  const { low, high } = wilsonInterval(4, 5);
  assert.ok(high - low > 40, `expected a wide interval, got ${low}-${high}`);
});

test('the same percentage from more questions is a narrower range', () => {
  const thin = wilsonInterval(4, 5);
  const thick = wilsonInterval(16, 20);
  assert.ok(
    (thick.high - thick.low) < (thin.high - thin.low),
    'twenty questions should be more precise than five at the same score'
  );
});

test('a perfect score does not claim certainty', () => {
  // The normal approximation returns 100 to 100 here, which is why it is not
  // used: five right in a row is good evidence, not proof.
  const { low, high } = wilsonInterval(5, 5);
  assert.ok(low < 100, `expected doubt below 100, got ${low}`);
  assert.equal(high, 100);
});

test('intervals never leave the scale', () => {
  for (const [correct, total] of [[0, 1], [1, 1], [0, 5], [5, 5], [0, 20], [20, 20]]) {
    const { low, high } = wilsonInterval(correct, total);
    assert.ok(low >= 0 && low <= 100, `low ${low} out of range for ${correct}/${total}`);
    assert.ok(high >= 0 && high <= 100, `high ${high} out of range for ${correct}/${total}`);
    assert.ok(low <= high, `inverted interval for ${correct}/${total}`);
  }
});

test('no questions is not an error', () => {
  const { low, high } = wilsonInterval(0, 0);
  assert.equal(low, 0);
  assert.equal(high, 100);
});

test('confidence rises with the number of questions', () => {
  assert.equal(confidenceLevel(3), 'low');
  assert.equal(confidenceLevel(5), 'moderate');
  assert.equal(confidenceLevel(10), 'good');
  assert.equal(confidenceLevel(25), 'high');
});

test('one answer is worth twenty points on a five-question quiz', () => {
  assert.equal(swingPerQuestion(5), 20);
  assert.equal(swingPerQuestion(20), 5);
  assert.equal(swingPerQuestion(0), 0);
});

test('a short quiz says so plainly', () => {
  const { note, reliable, level } = scoreConfidence(3, 4);
  assert.equal(reliable, false);
  assert.equal(level, 'low');
  assert.match(note, /rough indication/i);
  assert.match(note, /25 points/);
});

test('a short quiz blames its length, which is the reason', () => {
  const thin = scoreConfidence(4, 5);
  assert.ok(thin.width > 30, `expected a wide interval, got ${thin.width}`);
  assert.match(thin.note, /Only 5 questions/);
});

test('a proper quiz with a wide range says so without calling itself short', () => {
  // 16/20 carries a genuinely wide interval, but "only 20 questions"
  // misdescribes a full quiz — the count is not what is wrong with it.
  const { width, note } = scoreConfidence(16, 20);
  assert.ok(width > 30, `expected a wide interval, got ${width}`);
  assert.doesNotMatch(note, /^Only/);
  assert.match(note, /not a precise measure/);
  assert.match(note, /between \d+% and \d+%/);
});

test('a tight result states itself plainly', () => {
  const { width, note } = scoreConfidence(18, 20);
  assert.ok(width <= 30, `expected a tight interval, got ${width}`);
  assert.match(note, /Based on 20 questions\./);
});

test('a full quiz reports its precision rather than apologising', () => {
  const { note, reliable } = scoreConfidence(16, 20);
  assert.equal(reliable, true);
  assert.match(note, /Based on 20 questions/);
});

test('the percentage is unchanged by any of this', () => {
  // Confidence describes the score; it must never quietly alter it.
  assert.equal(scoreConfidence(4, 5).percentage, 80);
  assert.equal(scoreConfidence(16, 20).percentage, 80);
});

test('an empty quiz does not divide by zero', () => {
  const result = scoreConfidence(0, 0);
  assert.equal(result.percentage, 0);
  assert.match(result.note, /nothing to measure/i);
});
