import test from 'node:test';
import assert from 'node:assert/strict';

import {
    isCurrentPlan,
    canDeleteRoadmap,
    progressHeldBy,
    progressSummary,
    isSuperseded,
    supersededPlans,
    totalProgressHeldBy,
    summarise,
} from '../utils/roadmapDeletion.js';

/**
 * Deletion is permanent and the thing being deleted is not empty — a
 * superseded plan carries every tick and every completed skill from when it
 * was live. Two failures matter: letting the plan someone is working from be
 * deleted out from under them, and under-reporting what a plan holds so they
 * agree to lose more than they were told.
 */
const plan = ({ status = 'regenerated', role = 'AI/ML Engineer', weeks = [], skills = [] } = {}) => ({
    status,
    target_role: role,
    weekly_plans: weeks,
    skills,
});

test('the plan being worked from cannot be deleted', () => {
    const current = plan({ status: 'active', role: 'AI/ML Engineer' });
    assert.equal(isCurrentPlan(current, 'AI/ML Engineer'), true);

    const verdict = canDeleteRoadmap(current, 'AI/ML Engineer');
    assert.equal(verdict.allowed, false);
    assert.match(verdict.reason, /working from/i, 'the refusal has to say why');
});

test('a superseded plan for the current track can be deleted', () => {
    const old = plan({ status: 'regenerated', role: 'AI/ML Engineer' });
    assert.equal(canDeleteRoadmap(old, 'AI/ML Engineer').allowed, true);
});

test('an active plan for a track the learner has left can be deleted', () => {
    // Switching track leaves the old track's plan active on purpose, so it is
    // waiting if they return. It is still theirs to throw away.
    const other = plan({ status: 'active', role: 'MERN Developer' });
    assert.equal(isCurrentPlan(other, 'AI/ML Engineer'), false);
    assert.equal(canDeleteRoadmap(other, 'AI/ML Engineer').allowed, true);
});

test('with no track set nothing is protected on those grounds', () => {
    const active = plan({ status: 'active', role: 'AI/ML Engineer' });
    for (const none of ['', null, undefined]) {
        assert.equal(isCurrentPlan(active, none), false);
        assert.equal(canDeleteRoadmap(active, none).allowed, true);
    }
});

test('a plan that is not there is refused rather than deleted twice', () => {
    const verdict = canDeleteRoadmap(null, 'AI/ML Engineer');
    assert.equal(verdict.allowed, false);
    assert.match(verdict.reason, /no longer exists/i);
});

test('progress is counted across every week, not just the first', () => {
    const held = progressHeldBy(
        plan({
            weeks: [
                { completed_tasks: [0, 1, 2] },
                { completed_tasks: [] },
                { completed_tasks: [0, 3] },
            ],
            skills: [
                { status: 'completed' },
                { status: 'pending' },
                { status: 'completed' },
            ],
        })
    );
    assert.equal(held.ticks, 5);
    assert.equal(held.skillsDone, 2);
    assert.equal(held.isEmpty, false);
});

test('an untouched plan reports as empty rather than as unknown', () => {
    const held = progressHeldBy(plan({ weeks: [{ completed_tasks: [] }], skills: [{ status: 'pending' }] }));
    assert.equal(held.ticks, 0);
    assert.equal(held.skillsDone, 0);
    assert.equal(held.isEmpty, true);
    assert.equal(progressSummary(plan()), null, 'nothing to warn about is no warning');
});

test('a missing or malformed plan counts as nothing rather than throwing', () => {
    for (const bad of [null, undefined, {}, { weekly_plans: null, skills: null }]) {
        const held = progressHeldBy(bad);
        assert.equal(held.ticks, 0);
        assert.equal(held.skillsDone, 0);
    }
});

test('the warning says what is actually there, in readable numbers', () => {
    assert.equal(
        progressSummary(plan({ weeks: [{ completed_tasks: [0, 1] }], skills: [{ status: 'completed' }] })),
        '2 tasks ticked and 1 skill done'
    );
    assert.equal(
        progressSummary(plan({ weeks: [{ completed_tasks: [0] }] })),
        '1 task ticked'
    );
    assert.equal(
        progressSummary(plan({ skills: [{ status: 'completed' }, { status: 'completed' }] })),
        '2 skills done'
    );
});

/**
 * The sweep is the dangerous one: a single click deleting many plans. What
 * must not slip in is a plan that is not clutter — a track someone finished,
 * or one they stepped away from and may come back to.
 */
test('only plans replaced by a newer one are swept', () => {
    const plans = [
        plan({ status: 'regenerated' }),
        plan({ status: 'active' }),
        plan({ status: 'completed' }),
        plan({ status: 'draft' }),
        plan({ status: 'regenerated', role: 'MERN Developer' }),
    ];
    const swept = supersededPlans(plans);
    assert.equal(swept.length, 2);
    assert.ok(swept.every(isSuperseded));
});

test('a finished track is never swept', () => {
    // Completing a roadmap is the point of the product; it is not clutter.
    assert.equal(isSuperseded(plan({ status: 'completed' })), false);
    assert.equal(supersededPlans([plan({ status: 'completed' })]).length, 0);
});

test('a track stepped away from is never swept', () => {
    // Switching track deliberately leaves the old plan active so it is there
    // on return. A sweep that took it would lose that on one click.
    assert.equal(isSuperseded(plan({ status: 'active', role: 'MERN Developer' })), false);
});

test('the sweep totals progress across every plan it would remove', () => {
    const total = totalProgressHeldBy([
        plan({ weeks: [{ completed_tasks: [0, 1] }], skills: [{ status: 'completed' }] }),
        plan({ weeks: [{ completed_tasks: [0] }], skills: [{ status: 'completed' }, { status: 'pending' }] }),
    ]);
    assert.equal(total.ticks, 3);
    assert.equal(total.skillsDone, 2);
    assert.equal(summarise(total), '3 tasks ticked and 2 skills done');
});

test('an empty sweep warns about nothing rather than about zero', () => {
    const total = totalProgressHeldBy([]);
    assert.equal(total.isEmpty, true);
    assert.equal(summarise(total), null);
    assert.equal(totalProgressHeldBy(null).ticks, 0);
});

test('one wording serves a single plan and a whole sweep', () => {
    // Two phrasings of the same warning drift apart; the sweep and the single
    // delete have to describe a loss the same way.
    const one = plan({ weeks: [{ completed_tasks: [0, 1] }], skills: [{ status: 'completed' }] });
    assert.equal(progressSummary(one), summarise(totalProgressHeldBy([one])));
});
