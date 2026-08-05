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
 */
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

test('skill names containing dots are stored and read back intact', () => {
  const doc = buildGap(['Node.js Basics', 'Express.js']);
  assert.equal(doc.validateSync(), undefined, 'dotted skill names must validate');

  const stored = doc.skill_gaps.map((g) => g.skill);
  assert.deepEqual(stored, ['Node.js Basics', 'Express.js']);
});

test('every skill the topic map can produce is storable', () => {
  // The write path only ever inserts names from this map, so if any of them
  // cannot be stored the failure is silent for that topic alone.
  const everySkill = Object.values(TOPIC_SKILL_MAP).flat();
  const doc = buildGap(everySkill);

  assert.equal(doc.validateSync(), undefined, 'no mapped skill may be unstorable');
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

test('a gap needs a role to belong to', () => {
  // Results are scoped per role; one without a role would be unreachable by
  // the roadmap, which always looks a role up.
  const doc = new SkillGap({
    user_id: new mongoose.Types.ObjectId(),
    skill_gaps: [],
  });
  const err = doc.validateSync();
  assert.ok(err?.errors?.target_role, 'target_role should be required');
});

test('severity is constrained to the values the generator understands', () => {
  const doc = new SkillGap({
    user_id: new mongoose.Types.ObjectId(),
    target_role: 'MERN Developer',
    skill_gaps: [{ skill: 'React Basics', gap_severity: 'urgent', current_score: 10, required_score: 70 }],
  });
  assert.ok(doc.validateSync(), 'an unknown severity should not validate');
});
