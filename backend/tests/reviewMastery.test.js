import test from 'node:test';
import assert from 'node:assert/strict';
import {
  masteryFor,
  explainDue,
  reviewStateFor,
  PASS_MARK,
  STRONG_MARK,
} from '../utils/reviewSchedule.js';

/**
 * The queue judged a topic by its most recent score alone, which reads two
 * quite different learners the same way: somebody who has passed four times
 * running and somebody who scraped one pass were both "passed". It also gave
 * a two-word label and left them to work out how long it had been and what
 * they were being asked to do.
 */

test('a topic never attempted is untested, not failed', () => {
  // Zero is not the same as bad, and sorting it as bad puts topics nobody has
  // opened above ones they actually struggled with.
  assert.equal(masteryFor({ attempts: 0 }).level, 'untested');
});

test('attempts without a pass are reported as struggling, with the count', () => {
  assert.equal(masteryFor({ attempts: 1, passes: 0 }).level, 'struggling');
  assert.match(masteryFor({ attempts: 3, passes: 0 }).label, /3 attempts/);
});

test('one pass is developing, not mastered', () => {
  const mastery = masteryFor({ attempts: 2, passes: 1, bestScore: 72, latestScore: 72 });
  assert.equal(mastery.level, 'developing');
});

test('repeated passes at a strong score count as mastered', () => {
  const mastery = masteryFor({
    attempts: 3, passes: 3, bestScore: 95, latestScore: STRONG_MARK,
  });
  assert.equal(mastery.level, 'mastered');
});

test('repeated passes that have slipped are consolidating, not mastered', () => {
  // Passed three times but the latest is a scrape. Calling that mastered
  // would take it off the queue exactly when it needs to stay on.
  const mastery = masteryFor({
    attempts: 3, passes: 3, bestScore: 95, latestScore: PASS_MARK + 1,
  });
  assert.equal(mastery.level, 'consolidating');
});

test('every mastery level carries a label a learner can read', () => {
  const cases = [
    { attempts: 0 },
    { attempts: 1, passes: 0 },
    { attempts: 2, passes: 1, bestScore: 75, latestScore: 75 },
    { attempts: 3, passes: 3, bestScore: 90, latestScore: 90 },
    { attempts: 3, passes: 2, bestScore: 90, latestScore: 71 },
  ];
  for (const input of cases) {
    const { label } = masteryFor(input);
    assert.ok(label && label.length > 5, `${JSON.stringify(input)} gave "${label}"`);
  }
});

test('the explanation says the score, the when, and the how late', () => {
  const text = explainDue({
    latestScore: 45, daysSince: 21, intervalDays: 7, reason: 'Struggled with this',
  });
  assert.match(text, /45%/);
  assert.match(text, /21 days ago/);
  assert.match(text, /past the 7-day mark/);
});

test('yesterday and today read as words, not as a number of days', () => {
  assert.match(explainDue({ latestScore: 50, daysSince: 0, intervalDays: 7, reason: 'x' }), /today/);
  assert.match(explainDue({ latestScore: 50, daysSince: 1, intervalDays: 7, reason: 'x' }), /yesterday/);
});

test('a review state carries everything the screen needs to offer the retake', () => {
  // The queue used to name a topic and leave the learner to find it again in
  // a list of fifty-four.
  const state = reviewStateFor({
    topicId: 't1',
    topicName: 'React Hooks',
    latestScore: 45,
    latestAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    attempts: 2,
    passes: 0,
    bestScore: 55,
    difficulty: 'intermediate',
    experienceLevel: 'beginner',
  });

  assert.equal(state.due, true);
  assert.equal(state.difficulty, 'intermediate');
  assert.equal(state.experienceLevel, 'beginner');
  assert.equal(state.mastery.level, 'struggling');
  assert.ok(state.explanation.includes('45%'));
  assert.equal(state.bestScore, 55);
});

test('best score falls back to the latest when history has none', () => {
  const state = reviewStateFor({
    topicName: 'Solo',
    latestScore: 62,
    latestAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    attempts: 1,
    passes: 0,
  });
  assert.equal(state.bestScore, 62);
});
