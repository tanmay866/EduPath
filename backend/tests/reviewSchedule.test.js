import test from 'node:test';
import assert from 'node:assert/strict';

import {
    intervalFor, daysBetween, reviewStateFor, reviewQueue, REVIEW_INTERVALS,
} from '../utils/reviewSchedule.js';

/**
 * The queue is only useful if it is short and right. A list that surfaces
 * everything is the history page again, and one that surfaces a topic passed
 * yesterday teaches people to ignore it.
 */
const daysAgo = (n, from = new Date('2026-08-06T12:00:00Z')) =>
    new Date(from.getTime() - n * 24 * 60 * 60 * 1000);

const NOW = new Date('2026-08-06T12:00:00Z');

const topic = (name, latestScore, days) => ({
    topicId: name.toLowerCase(),
    topicName: name,
    latestScore,
    latestAt: daysAgo(days),
});

test('a worse score buys less time than a better one', () => {
    const days = [40, 60, 80, 95].map((s) => intervalFor(s).days);
    assert.deepEqual(days, [...days].sort((a, b) => a - b), 'intervals must rise with the score');
    assert.equal(intervalFor(40).days, 7);
    assert.equal(intervalFor(95).days, 60);
});

test('the bands cover every score with no gap or overlap', () => {
    for (let score = 0; score <= 100; score += 1) {
        assert.ok(intervalFor(score), `no band for ${score}`);
    }
    // Read top down, so a boundary belongs to exactly one band.
    assert.equal(intervalFor(69).days, 14);
    assert.equal(intervalFor(70).days, 30);
    assert.equal(intervalFor(84).days, 30);
    assert.equal(intervalFor(85).days, 60);
});

test('a score that is not a number has no interval', () => {
    for (const bad of [null, undefined, 'x', NaN]) assert.equal(intervalFor(bad), null);
});

test('elapsed days are whole days, not fractions', () => {
    assert.equal(daysBetween(daysAgo(3), NOW), 3);
    assert.equal(daysBetween(daysAgo(0.5), NOW), 0);
    assert.equal(daysBetween(null), null);
});

test('a topic inside its interval is not due', () => {
    // 40% buys seven days; this is day three.
    const state = reviewStateFor(topic('Python Basics', 40, 3), NOW);
    assert.equal(state.due, false);
    assert.equal(state.overdueBy, -4);
});

test('a topic past its interval is due, and says why', () => {
    const state = reviewStateFor(topic('Python Basics', 40, 30), NOW);
    assert.equal(state.due, true);
    assert.equal(state.overdueBy, 23);
    assert.equal(state.reason, 'Struggled with this');
});

test('a well-scored topic is left alone far longer than a weak one', () => {
    const weak = reviewStateFor(topic('Weak', 40, 20), NOW);
    const strong = reviewStateFor(topic('Strong', 95, 20), NOW);
    assert.equal(weak.due, true);
    assert.equal(strong.due, false, '95% twenty days ago is not worth interrupting anyone for');
});

test('the queue holds only what is due', () => {
    const queue = reviewQueue([
        topic('Due', 40, 30),
        topic('Fresh', 40, 1),
        topic('Solid', 95, 10),
    ], NOW);
    assert.deepEqual(queue.map((r) => r.topicName), ['Due']);
});

test('the most overdue comes first', () => {
    const queue = reviewQueue([
        topic('A little late', 40, 10),
        topic('Very late', 40, 60),
        topic('Late', 40, 20),
    ], NOW);
    assert.deepEqual(queue.map((r) => r.topicName), ['Very late', 'Late', 'A little late']);
});

test('equally overdue topics are ordered by the worse score', () => {
    const queue = reviewQueue([
        topic('Better', 65, 21),
        topic('Worse', 55, 21),
    ], NOW);
    assert.deepEqual(queue.map((r) => r.topicName), ['Worse', 'Better']);
});

test('a learner who has attempted nothing gets an empty queue, not an error', () => {
    assert.deepEqual(reviewQueue([], NOW), []);
    assert.deepEqual(reviewQueue(undefined, NOW), []);
});

test('a topic with no attempt date is skipped rather than assumed overdue', () => {
    // A missing date would read as 1970 and put the topic at the top forever.
    const queue = reviewQueue([{ topicName: 'No date', latestScore: 40 }], NOW);
    assert.deepEqual(queue, []);
});

test('every band carries a reason a learner can read', () => {
    for (const band of REVIEW_INTERVALS) {
        assert.ok(band.label && band.label.length > 3, 'each band needs a human reason');
    }
});
