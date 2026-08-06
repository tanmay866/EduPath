import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ticksFor, completedSkillNames, allTasksTicked, allSkillsDone,
  isWeekDone, currentWeek, doneWeekCount,
} from '../utils/weekProgress.js';

/**
 * The same cases as frontend/src/Pages/Roadmap/weekProgress.test.js.
 *
 * The rule exists on both sides — the browser needs it to move the card the
 * moment a task is ticked, the Monday email needs it hours later with no
 * browser involved — and it cannot cross the language boundary. Testing both
 * against identical cases is what keeps the email describing the same week the
 * learner is looking at.
 */
const week = (n, tasks = 4, over = {}) => ({
  week_number: n,
  tasks: Array.from({ length: tasks }, (_, i) => `task ${i}`),
  skills: [`Skill ${n}`],
  ...over,
});

const skill = (name, status = 'pending') => ({ skill: name, status });

test('a week with no ticks reads as empty, not undefined', () => {
  assert.deepEqual(ticksFor(week(1)), new Set());
  assert.deepEqual(ticksFor(undefined), new Set());
});

test('stored ticks are read as numbers', () => {
  // Mongo can hand these back as strings; a Set of "0" would never match 0.
  assert.deepEqual(ticksFor({ completed_tasks: ['0', 2] }), new Set([0, 2]));
});

test('all tasks ticked means done', () => {
  const w = week(1, 3, { completed_tasks: [0, 1, 2] });
  assert.equal(allTasksTicked(w), true);
  assert.equal(isWeekDone(w, new Set()), true);
});

test('some tasks ticked is not done', () => {
  assert.equal(isWeekDone(week(1, 3, { completed_tasks: [0, 1] }), new Set()), false);
});

test('a week with no tasks at all is not silently complete', () => {
  assert.equal(allTasksTicked(week(1, 0)), false);
});

test('all skills complete counts, for plans made before ticking existed', () => {
  const done = completedSkillNames([skill('Skill 1', 'completed')]);
  assert.equal(allSkillsDone(week(1), done), true);
  assert.equal(isWeekDone(week(1), done), true);
});

test('a partly complete skill list is not done', () => {
  const w = week(1, 4, { skills: ['A', 'B'] });
  const done = completedSkillNames([skill('A', 'completed'), skill('B')]);
  assert.equal(isWeekDone(w, done), false);
});

test('the current week is the first unfinished one', () => {
  const weeks = [
    week(1, 2, { completed_tasks: [0, 1] }),
    week(2, 2, { completed_tasks: [0] }),
    week(3, 2),
  ];
  assert.equal(currentWeek(weeks, [])?.week_number, 2);
});

test('week one on a plan nobody has touched', () => {
  assert.equal(currentWeek([week(1), week(2)], [])?.week_number, 1);
});

test('null when every week is finished, so the email is skipped rather than wrong', () => {
  const weeks = [week(1, 1, { completed_tasks: [0] }), week(2, 1, { completed_tasks: [0] })];
  assert.equal(currentWeek(weeks, []), null);
});

test('an empty plan has no current week and does not throw', () => {
  assert.equal(currentWeek([], []), null);
  assert.equal(currentWeek(undefined, undefined), null);
});

test('a gap in the middle is the first gap, not the last', () => {
  const weeks = [
    week(1, 1, { completed_tasks: [0] }),
    week(2, 1),
    week(3, 1, { completed_tasks: [0] }),
  ];
  assert.equal(currentWeek(weeks, [])?.week_number, 2);
});

test('finished weeks are counted wherever they fall', () => {
  const weeks = [
    week(1, 1, { completed_tasks: [0] }),
    week(2, 1),
    week(3, 1, { completed_tasks: [0] }),
  ];
  assert.equal(doneWeekCount(weeks, []), 2);
});
