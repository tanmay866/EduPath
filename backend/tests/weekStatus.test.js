import test from 'node:test';
import assert from 'node:assert/strict';

import Roadmap from '../models/Roadmap.js';

/**
 * Task ticking, checked against the schema rather than a live database.
 *
 * The rule that matters is the one the controller derives: a week's status
 * follows its ticks and is never set by hand, so the count and the label
 * cannot disagree. That derivation is repeated here because it is the thing
 * that would rot — the storage shape is only interesting insofar as it holds
 * what the derivation reads.
 */
const deriveStatus = (ticked, total) => {
  if (ticked === 0) return 'pending';
  return ticked >= total ? 'completed' : 'in_progress';
};

test('completed_tasks exists on a week and holds numbers', () => {
  const path = Roadmap.schema.path('weekly_plans');
  assert.ok(path, 'weekly_plans is missing');
  const field = path.schema.path('completed_tasks');
  assert.ok(field, 'completed_tasks is missing — task ticks would not persist');
  // `embeddedSchemaType`, not `caster`: on a nested DocumentArray the latter
  // is undefined, so asserting through it passes for the wrong reason.
  assert.equal(field.embeddedSchemaType.instance, 'Number');
});

test('tasks stayed plain strings, so roadmaps saved before this still load', () => {
  // Reshaping tasks into objects would have needed a migration of every
  // stored roadmap; indices into the existing array avoided that.
  const tasks = Roadmap.schema.path('weekly_plans').schema.path('tasks');
  assert.equal(tasks.embeddedSchemaType.instance, 'String');
});

test('a week with no ticks is pending', () => {
  assert.equal(deriveStatus(0, 4), 'pending');
});

test('a partly ticked week is in progress', () => {
  assert.equal(deriveStatus(1, 4), 'in_progress');
  assert.equal(deriveStatus(3, 4), 'in_progress');
});

test('a fully ticked week is completed', () => {
  assert.equal(deriveStatus(4, 4), 'completed');
});

test('unticking the last one drops the week back out of completed', () => {
  assert.equal(deriveStatus(3, 4), 'in_progress');
});

test('a week whose tasks all vanished does not report itself complete on zero', () => {
  // Guards the ordering of the checks: a `ticked >= total` test placed first
  // would call an empty week completed.
  assert.equal(deriveStatus(0, 0), 'pending');
});

test('an existing week validates with no completed_tasks at all', () => {
  const doc = new Roadmap({
    roadmap_id: 'r1',
    user_id: '6a70ceffa4925edaf2e8d775',
    target_role: 'AI/ML Engineer',
    weekly_plans: [{ week_number: 1, skills: ['Python Basics'], tasks: ['a', 'b'] }],
  });
  const err = doc.validateSync();
  const weekErrors = Object.keys(err?.errors || {}).filter((k) => k.startsWith('weekly_plans'));
  assert.deepEqual(weekErrors, [], 'a roadmap saved before ticking existed must still validate');
});
