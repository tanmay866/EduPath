import test from 'node:test';
import assert from 'node:assert/strict';

import { mergeRoadmapProgress } from '../utils/mergeRoadmapProgress.js';

/**
 * The failure being prevented is silent loss. Adapting a plan is only worth
 * offering if progress survives it — and the way it would break is subtle:
 * carrying a tick by index or week number looks right until a skill is dropped
 * and everything after it shifts, at which point the wrong tasks come back
 * ticked and nobody notices because the count still looks plausible.
 */
const week = (n, skills, tasks, ticks = []) => ({
    week_number: n,
    skills,
    tasks,
    completed_tasks: ticks,
});

const plan = (skills, weeks) => ({
    skills: skills.map(([name, status = 'pending']) => ({ skill: name, status })),
    weekly_plans: weeks,
});

test('a completed skill stays completed under its new week number', () => {
    const previous = plan([['React Basics', 'completed'], ['Express.js']], []);
    const next = plan([['Express.js'], ['React Basics']], []);

    const report = mergeRoadmapProgress(previous, next);

    assert.equal(next.skills.find((s) => s.skill === 'React Basics').status, 'completed');
    assert.equal(report.skillsCarried, 1);
});

test('a skill dropped from the new plan simply does not appear', () => {
    const previous = plan([['React Router', 'completed']], []);
    const next = plan([['Express.js']], []);

    mergeRoadmapProgress(previous, next);
    assert.equal(next.skills.length, 1);
    assert.equal(next.skills[0].status, 'pending');
});

test('ticks carry when the week still covers the same skills', () => {
    const previous = plan([], [week(1, ['React Basics'], ['read docs', 'build a thing'], [0])]);
    const next = plan([], [week(1, ['React Basics'], ['read docs', 'build a thing'])]);

    const report = mergeRoadmapProgress(previous, next);

    assert.deepEqual(next.weekly_plans[0].completed_tasks, [0]);
    assert.equal(report.ticksCarried, 1);
});

test('a tick follows its task when re-planning moves and reorders it', () => {
    // This is the case an index would get wrong: the task is now week 2, and
    // second in the list rather than first.
    const previous = plan([], [week(1, ['Express.js'], ['read docs', 'build a thing'], [1])]);
    const next = plan([], [
        week(1, ['React Basics'], ['read docs', 'build a thing']),
        week(2, ['Express.js'], ['build a thing', 'read docs']),
    ]);

    mergeRoadmapProgress(previous, next);

    assert.deepEqual(next.weekly_plans[0].completed_tasks, [], 'must not tick a different skill');
    assert.deepEqual(next.weekly_plans[1].completed_tasks, [0], 'follows the task text');
});

test('identical task wording under a different skill does not carry', () => {
    // "Weekly self-assessment quiz" is generated for every week, so keying on
    // the text alone would tick it everywhere the moment it was ticked once.
    const previous = plan([], [week(1, ['React Basics'], ['Weekly self-assessment quiz'], [0])]);
    const next = plan([], [week(1, ['Express.js'], ['Weekly self-assessment quiz'])]);

    mergeRoadmapProgress(previous, next);
    assert.deepEqual(next.weekly_plans[0].completed_tasks, []);
});

test('a week whose task list changed keeps only the tasks that survived', () => {
    const previous = plan([], [week(1, ['Express.js'], ['a', 'b', 'c'], [0, 1, 2])]);
    const next = plan([], [week(1, ['Express.js'], ['a', 'c'])]);

    const report = mergeRoadmapProgress(previous, next);

    assert.deepEqual(next.weekly_plans[0].completed_tasks, [0, 1]);
    assert.equal(report.ticksCarried, 2);
    assert.equal(report.ticksDropped, 1, 'the dropped one is reported, not hidden');
});

test('week status is derived from the ticks that carried', () => {
    const previous = plan([], [week(1, ['Express.js'], ['a', 'b'], [0, 1])]);
    const next = plan([], [
        week(1, ['Express.js'], ['a', 'b']),
        week(2, ['React Basics'], ['x', 'y']),
    ]);

    mergeRoadmapProgress(previous, next);

    assert.equal(next.weekly_plans[0].status, 'completed');
    assert.equal(next.weekly_plans[1].status, 'pending');
});

test('a partly carried week is in progress, not completed', () => {
    const previous = plan([], [week(1, ['Express.js'], ['a', 'b'], [0])]);
    const next = plan([], [week(1, ['Express.js'], ['a', 'b'])]);

    mergeRoadmapProgress(previous, next);
    assert.equal(next.weekly_plans[0].status, 'in_progress');
});

test('skills ordered differently in the week do not break the match', () => {
    const previous = plan([], [week(1, ['B', 'A'], ['task'], [0])]);
    const next = plan([], [week(1, ['A', 'B'], ['task'])]);

    mergeRoadmapProgress(previous, next);
    assert.deepEqual(next.weekly_plans[0].completed_tasks, [0]);
});

test('a tick does not spread across identical weeks of the same skill', () => {
    // A skill usually spans several weeks, and those weeks are identical —
    // same skill, same generated tasks. Against a real three-week plan this
    // turned two ticks into six, because every week matched every tick.
    const identical = (n, ticks = []) => week(n, ['Python Basics'], ['study', 'practise', 'review'], ticks);

    const previous = plan([], [identical(1, [0, 1]), identical(2), identical(3)]);
    const next = plan([], [identical(1), identical(2), identical(3)]);

    const report = mergeRoadmapProgress(previous, next);

    assert.deepEqual(next.weekly_plans[0].completed_tasks, [0, 1]);
    assert.deepEqual(next.weekly_plans[1].completed_tasks, []);
    assert.deepEqual(next.weekly_plans[2].completed_tasks, []);
    assert.equal(report.ticksCarried, 2, 'two ticks in, two ticks out');
});

test('the second week of a repeated skill matches the second, not the first', () => {
    const identical = (n, ticks = []) => week(n, ['Express.js'], ['a', 'b'], ticks);
    const previous = plan([], [identical(1), identical(2, [1])]);
    // Re-planning inserted a week ahead of these two, shifting their numbers.
    const next = plan([], [week(1, ['React Basics'], ['x']), identical(2), identical(3)]);

    mergeRoadmapProgress(previous, next);

    assert.deepEqual(next.weekly_plans[1].completed_tasks, [], 'first occurrence had no ticks');
    assert.deepEqual(next.weekly_plans[2].completed_tasks, [1], 'second occurrence keeps its tick');
});

test('an untouched previous plan carries nothing and throws nothing', () => {
    const report = mergeRoadmapProgress(plan([['A']], [week(1, ['A'], ['t'])]), plan([['A']], [week(1, ['A'], ['t'])]));
    assert.deepEqual(report, { skillsCarried: 0, ticksCarried: 0, ticksDropped: 0 });
});

test('missing plans on either side are handled', () => {
    assert.doesNotThrow(() => mergeRoadmapProgress(null, plan([], [])));
    assert.doesNotThrow(() => mergeRoadmapProgress(plan([], []), null));
    assert.doesNotThrow(() => mergeRoadmapProgress({}, {}));
});
