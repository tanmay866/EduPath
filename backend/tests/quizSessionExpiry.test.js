import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import { expiredSessionFilter } from '../models/QuizSession.js';

/**
 * Sessions were created 'ongoing' and never moved off it. Nothing ever set
 * them to 'expired', so a quiz abandoned days ago still described itself as
 * in progress until the TTL index dropped the row a week later — seventeen of
 * them were sitting that way.
 *
 * The dangerous direction is the other one. This filter drives an updateMany,
 * so a filter that is too broad ends a quiz somebody is part-way through, and
 * that is not a failure anyone would report as a bug — the questions would
 * just stop accepting answers.
 */
const NOW = new Date('2026-08-06T12:00:00Z');
const minutesFromNow = (n) => new Date(NOW.getTime() + n * 60 * 1000);

const matches = (filter, session) =>
  Object.entries(filter).every(([key, want]) => {
    const got = session[key];
    if (want && typeof want === 'object' && '$lt' in want) return got < want.$lt;
    return String(got) === String(want);
  });

test('a session past its expiry is caught', () => {
  const filter = expiredSessionFilter(NOW);
  assert.ok(matches(filter, { status: 'ongoing', expiresAt: minutesFromNow(-1) }));
  assert.ok(matches(filter, { status: 'ongoing', expiresAt: minutesFromNow(-60 * 48) }));
});

test('a quiz still running is left alone', () => {
  // The one that matters: this learner is mid-question.
  const filter = expiredSessionFilter(NOW);
  assert.ok(!matches(filter, { status: 'ongoing', expiresAt: minutesFromNow(1) }));
  assert.ok(!matches(filter, { status: 'ongoing', expiresAt: minutesFromNow(20) }));
});

test('a session that already finished is not reopened or relabelled', () => {
  const filter = expiredSessionFilter(NOW);
  for (const status of ['completed', 'expired', 'abandoned']) {
    assert.ok(
      !matches(filter, { status, expiresAt: minutesFromNow(-60) }),
      `${status} sessions must be left as they are`
    );
  }
});

test('the filter is never empty', () => {
  // An empty filter passed to updateMany rewrites the whole collection.
  const filter = expiredSessionFilter(NOW);
  assert.ok(Object.keys(filter).length >= 2);
  assert.equal(filter.status, 'ongoing');
  assert.ok(filter.expiresAt?.$lt instanceof Date);
});

test('scoping to a learner only narrows it', () => {
  const userId = new mongoose.Types.ObjectId();
  const scoped = expiredSessionFilter(NOW, userId);
  assert.equal(String(scoped.userId), String(userId));
  assert.equal(scoped.status, 'ongoing');

  const other = new mongoose.Types.ObjectId();
  assert.ok(matches(scoped, { status: 'ongoing', expiresAt: minutesFromNow(-1), userId }));
  assert.ok(!matches(scoped, { status: 'ongoing', expiresAt: minutesFromNow(-1), userId: other }));
});

test('no learner given means every learner', () => {
  assert.equal('userId' in expiredSessionFilter(NOW), false);
});
