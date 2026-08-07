import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitiseContext, describeContext } from '../utils/feedbackContext.js';

/**
 * The context arrives from the browser, so it is a claim rather than a fact.
 * The failures that matter are an unfiltered object reaching the database and
 * an oversized or nested value reaching an admin's screen.
 */
test('only the keys this kind is allowed to carry survive', () => {
    const out = sanitiseContext('question', {
        topic: 'Docker',
        difficulty: 'beginner',
        question: 'What is a container?',
        isAdmin: true,
        $set: { role: 'admin' },
        password: 'hunter2',
    });
    assert.deepEqual(Object.keys(out).sort(), ['difficulty', 'question', 'topic']);
    assert.equal('isAdmin' in out, false);
    assert.equal('$set' in out, false);
    assert.equal('password' in out, false);
});

test('an unknown kind keeps nothing rather than everything', () => {
    // The safe failure is an empty context, not an unfiltered one.
    assert.deepEqual(sanitiseContext('made-up', { anything: 'x' }), {});
    assert.deepEqual(sanitiseContext(undefined, { anything: 'x' }), {});
});

test('a missing or malformed context is an empty object, not a throw', () => {
    for (const bad of [null, undefined, 'string', 42, []]) {
        assert.deepEqual(sanitiseContext('question', bad), {});
    }
});

test('long values are cut so one report cannot fill a screen', () => {
    const out = sanitiseContext('question', { question: 'x'.repeat(5000) });
    assert.equal(out.question.length, 500);
});

test('nested objects are dropped rather than stored', () => {
    const out = sanitiseContext('roadmap', { targetRole: { $ne: null }, weekNumber: 3 });
    assert.equal('targetRole' in out, false);
    assert.equal(out.weekNumber, '3');
});

test('a list of skills becomes a readable line', () => {
    const out = sanitiseContext('roadmap', { skills: ['Python Basics', 'NumPy & Pandas'] });
    assert.equal(out.skills, 'Python Basics, NumPy & Pandas');
});

test('empty values are left out instead of stored blank', () => {
    const out = sanitiseContext('question', { topic: '   ', difficulty: 'beginner' });
    assert.equal('topic' in out, false);
    assert.equal(out.difficulty, 'beginner');
});

test('every kind describes itself even with nothing to go on', () => {
    assert.equal(describeContext('question', {}), 'Quiz question');
    assert.equal(describeContext('roadmap', {}), 'Roadmap');
    assert.equal(describeContext('general', {}), 'General');
    assert.equal(describeContext('question', { topic: 'Docker', difficulty: 'beginner' }), 'Docker · beginner');
    assert.equal(describeContext('roadmap', { targetRole: 'AI/ML Engineer', weekNumber: '5' }), 'AI/ML Engineer · week 5');
});
