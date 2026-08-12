import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import SkillGap from '../models/SkillGap.js';
import { TOPIC_SKILL_MAP } from '../utils/skillTopicMap.js';

/**
 * Regression cover for a silent data loss.
 *
 * Scores were held in a Mongoose Map keyed by skill name. Mongoose rejects map
 * keys containing '.', and two real template skills have one — "Node.js
 * Basics" and "Express.js" — so sitting either of those assessments threw
 * inside the write, was swallowed by its catch, and recorded nothing at all.
 * Nothing surfaced: the quiz reported a score and the roadmap simply never
 * heard about it.
 *
 * Scores now live on skill_gaps entries, where the name is a value rather than
 * a key. These run without a database — a document validates offline.
 *
 * validate() rather than validateSync(): the synchronous form is deprecated
 * and goes away in Mongoose 10, so these would have started failing at the
 * upgrade rather than at any change to the code they cover.
 */
/** The ValidationError validate() rejects with, or null when it passes. */
const validationError = (doc) => doc.validate().then(() => null, (err) => err);
const buildGap = (skills) =>
  new SkillGap({
    user_id: new mongoose.Types.ObjectId(),
    target_role: 'MERN Developer',
    skill_gaps: skills.map((skill) => ({
      skill,
      gap_severity: 'high',
      current_score: 40,
      required_score: 70,
    })),
  });

test('skill names containing dots are stored and read back intact', async () => {
  const doc = buildGap(['Node.js Basics', 'Express.js']);
  assert.equal(await validationError(doc), null, 'dotted skill names must validate');

  const stored = doc.skill_gaps.map((g) => g.skill);
  assert.deepEqual(stored, ['Node.js Basics', 'Express.js']);
});

test('every skill the topic map can produce is storable', async () => {
  // The write path only ever inserts names from this map, so if any of them
  // cannot be stored the failure is silent for that topic alone.
  //
  // Only the assessed names are ever written — the related ones are recorded
  // nowhere — but both are checked, so adding a dotted name to either list
  // cannot reintroduce the fault by being promoted later.
  const everySkill = Object.values(TOPIC_SKILL_MAP).flatMap((e) => [
    ...e.assesses,
    ...e.related,
  ]);
  const doc = buildGap(everySkill);

  assert.equal(await validationError(doc), null, 'no mapped skill may be unstorable');
  assert.equal(doc.skill_gaps.length, everySkill.length);
  assert.deepEqual(
    doc.skill_gaps.map((g) => g.skill),
    everySkill,
    'names must round-trip unchanged — the AI service matches them exactly'
  );
});

test('no schema path keys data by skill name', () => {
  // Checked against the schema, not a document: an unset Map reads as
  // undefined either way, so asserting on an instance would pass even with
  // the field restored — which is exactly what it did on the first attempt.
  //
  // Any Map keyed by skill name silently drops "Node.js Basics" and
  // "Express.js", so the shape itself is what has to stay gone.
  assert.equal(
    SkillGap.schema.path('skill_scores'),
    undefined,
    'skill_scores was reintroduced — a Map cannot hold skill names containing dots'
  );

  for (const [name, path] of Object.entries(SkillGap.schema.paths)) {
    assert.notEqual(
      path.instance,
      'Map',
      `${name} is a Map; keys containing '.' would be rejected on write`
    );
  }
});

test('a gap needs a role to belong to', async () => {
  // Results are scoped per role; one without a role would be unreachable by
  // the roadmap, which always looks a role up.
  const doc = new SkillGap({
    user_id: new mongoose.Types.ObjectId(),
    skill_gaps: [],
  });
  const err = await validationError(doc);
  assert.ok(err?.errors?.target_role, 'target_role should be required');
});

test('severity is constrained to the values the generator understands', async () => {
  const doc = new SkillGap({
    user_id: new mongoose.Types.ObjectId(),
    target_role: 'MERN Developer',
    skill_gaps: [{ skill: 'React Basics', gap_severity: 'urgent', current_score: 10, required_score: 70 }],
  });
  assert.ok(await validationError(doc), 'an unknown severity should not validate');
});
