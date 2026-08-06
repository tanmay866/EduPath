import { describe, test, expect } from 'vitest';

import {
  ticksFor, completedSkillNames, allTasksTicked, allSkillsDone,
  isWeekDone, currentWeek, doneWeekCount,
} from './weekProgress';

/**
 * "Which week am I on" is asked by both the weekly plan and the overview card.
 * These are the rules both read, so a change that suits one and breaks the
 * other fails here rather than in only one of the two places.
 */
const week = (n, tasks = 4, over = {}) => ({
  week_number: n,
  tasks: Array.from({ length: tasks }, (_, i) => `task ${i}`),
  skills: [`Skill ${n}`],
  ...over,
});

const skill = (name, status = 'pending') => ({ skill: name, status });

describe('reading ticks', () => {
  test('a week with no ticks reads as empty, not undefined', () => {
    expect(ticksFor(week(1))).toEqual(new Set());
    expect(ticksFor(undefined)).toEqual(new Set());
  });

  test('stored ticks are read as numbers', () => {
    // Mongo can hand these back as strings; a Set of "0" would never match 0.
    expect(ticksFor({ completed_tasks: ['0', 2] })).toEqual(new Set([0, 2]));
  });
});

describe('when a week is done', () => {
  test('all its tasks ticked', () => {
    const w = week(1, 3, { completed_tasks: [0, 1, 2] });
    expect(allTasksTicked(w)).toBe(true);
    expect(isWeekDone(w, new Set())).toBe(true);
  });

  test('some of its tasks ticked is not done', () => {
    const w = week(1, 3, { completed_tasks: [0, 1] });
    expect(isWeekDone(w, new Set())).toBe(false);
  });

  test('a week with no tasks at all is not silently complete', () => {
    // `ticks.size >= tasks.length` alone would call 0 >= 0 finished.
    expect(allTasksTicked(week(1, 0))).toBe(false);
  });

  test('all its skills complete counts, for plans made before ticking existed', () => {
    const w = week(1);
    const done = completedSkillNames([skill('Skill 1', 'completed')]);
    expect(allSkillsDone(w, done)).toBe(true);
    expect(isWeekDone(w, done)).toBe(true);
  });

  test('a partly complete skill list is not done', () => {
    const w = week(1, 4, { skills: ['A', 'B'] });
    const done = completedSkillNames([skill('A', 'completed'), skill('B')]);
    expect(isWeekDone(w, done)).toBe(false);
  });

  test('unsaved ticks are honoured over what was stored', () => {
    // The card ticks optimistically; the rule has to see the pending state or
    // the week would not advance until a reload.
    const w = week(1, 2, { completed_tasks: [] });
    expect(isWeekDone(w, new Set(), { 1: new Set([0, 1]) })).toBe(true);
  });
});

describe('which week is current', () => {
  const skills = [];

  test('the first unfinished one', () => {
    const weeks = [
      week(1, 2, { completed_tasks: [0, 1] }),
      week(2, 2, { completed_tasks: [0] }),
      week(3, 2),
    ];
    expect(currentWeek(weeks, skills)?.week_number).toBe(2);
  });

  test('week one on a plan nobody has touched', () => {
    expect(currentWeek([week(1), week(2)], skills)?.week_number).toBe(1);
  });

  test('null when every week is finished, rather than falling back to week one', () => {
    const weeks = [week(1, 1, { completed_tasks: [0] }), week(2, 1, { completed_tasks: [0] })];
    expect(currentWeek(weeks, skills)).toBeNull();
  });

  test('an empty plan has no current week and does not throw', () => {
    expect(currentWeek([], skills)).toBeNull();
    expect(currentWeek(undefined, undefined)).toBeNull();
  });

  test('a gap in the middle is still the first gap, not the last', () => {
    const weeks = [
      week(1, 1, { completed_tasks: [0] }),
      week(2, 1),
      week(3, 1, { completed_tasks: [0] }),
    ];
    expect(currentWeek(weeks, skills)?.week_number).toBe(2);
  });
});

describe('counting finished weeks', () => {
  test('counts every done week, not just the leading run', () => {
    const weeks = [
      week(1, 1, { completed_tasks: [0] }),
      week(2, 1),
      week(3, 1, { completed_tasks: [0] }),
    ];
    expect(doneWeekCount(weeks, [])).toBe(2);
  });

  test('nothing done is zero, not NaN', () => {
    expect(doneWeekCount([week(1), week(2)], [])).toBe(0);
  });
});
