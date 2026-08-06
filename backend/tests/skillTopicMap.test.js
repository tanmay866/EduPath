import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TOPIC_SKILL_MAP,
  topicForSkill,
  skillsAssessedBy,
  skillsRelatedTo,
} from '../utils/skillTopicMap.js';

/**
 * These names are matched verbatim against the AI service's role templates, so
 * a typo here does not throw — it just means a score never reaches the
 * roadmap, which is invisible until someone notices their plan ignoring an
 * assessment they sat.
 *
 * The other half of the file guards the opposite failure, which is louder in
 * its effect and quieter in its symptoms: a score reaching a skill the quiz
 * never tested, and taking it off the plan.
 */
test('every topic assesses at least one skill', () => {
  for (const [topic, entry] of Object.entries(TOPIC_SKILL_MAP)) {
    assert.ok(Array.isArray(entry.assesses), `${topic} has no assesses list`);
    assert.ok(entry.assesses.length > 0, `${topic} assesses nothing`);
    assert.ok(Array.isArray(entry.related), `${topic} has no related list`);
  }
});

test('no skill name is blank or carries stray whitespace', () => {
  for (const [topic, entry] of Object.entries(TOPIC_SKILL_MAP)) {
    for (const skill of [...entry.assesses, ...entry.related]) {
      assert.equal(typeof skill, 'string');
      assert.ok(skill.length > 0, `${topic} has an empty skill`);
      assert.equal(skill, skill.trim(), `"${skill}" has padding that would break exact matching`);
    }
  }
});

test('a skill is never both assessed and merely related by the same topic', () => {
  for (const [topic, entry] of Object.entries(TOPIC_SKILL_MAP)) {
    for (const skill of entry.related) {
      assert.ok(!entry.assesses.includes(skill), `${topic} claims ${skill} both ways`);
    }
  }
});

test('a quiz records only what it tested', () => {
  // The failure this prevents: ten questions on Python Basics writing a pass
  // against Python for Security, which is a different subject sharing a word.
  // A passing score removes a skill from the roadmap, so this is the
  // difference between keeping a skill and skipping it unasked.
  assert.deepEqual(skillsAssessedBy('Python Basics'), ['Python Basics']);
  assert.deepEqual(skillsRelatedTo('Python Basics'), [
    'Python for Security',
    'Python for Data Science',
  ]);

  assert.deepEqual(skillsAssessedBy('React'), ['React Basics']);
  assert.ok(!skillsAssessedBy('React').includes('React Router'));

  assert.deepEqual(skillsAssessedBy('Data Analysis'), ['NumPy & Pandas']);
  assert.deepEqual(skillsAssessedBy('Linux'), ['Linux Basics']);
});

test('one skill spelled two ways in two tracks is assessed under both', () => {
  // Not over-reach: the templates give the same material different names per
  // track, and a machine learning quiz is a fair test of either spelling.
  assert.deepEqual(skillsAssessedBy('Machine Learning'), [
    'ML Fundamentals (Scikit-learn)',
    'Machine Learning Fundamentals',
  ]);
});

test('an unmapped or empty topic records nothing rather than throwing', () => {
  for (const bad of ['TypeScript', 'Computer Vision', '', null, undefined]) {
    assert.deepEqual(skillsAssessedBy(bad), []);
    assert.deepEqual(skillsRelatedTo(bad), []);
  }
});

test('the reverse lookup resolves every assessed skill to a topic that claims it', () => {
  // A skill can legitimately be covered by more than one topic — the template
  // has one "Cross-Platform Development (React Native/Flutter)" that both the
  // React Native and Flutter topics assess. What matters is that the skill
  // resolves, and resolves to a topic that actually claims it.
  for (const entry of Object.values(TOPIC_SKILL_MAP)) {
    for (const skill of entry.assesses) {
      const resolved = topicForSkill(skill);
      assert.ok(resolved, `${skill} does not resolve back to a topic`);
      assert.ok(
        TOPIC_SKILL_MAP[resolved]?.assesses.includes(skill),
        `${skill} resolved to ${resolved}, which does not assess it`
      );
    }
  }
});

test('a merely related skill has no topic offered for it', () => {
  // Sending someone to a Python Basics quiz to settle Python for Security
  // cannot answer the question, so the roadmap offers no test at all.
  for (const skill of ['Python for Security', 'React Router', 'Linux & Shell Scripting']) {
    assert.equal(topicForSkill(skill), undefined, `${skill} should not resolve to a topic`);
  }
});

test('skills with no topic behind them resolve to nothing rather than something approximate', () => {
  // Real roadmap steps with no assessment in the catalogue. Returning a
  // near-match here is how learners get sent to an unrelated quiz.
  for (const skill of ['REST API Design', 'JWT Authentication', 'Full Stack Integration']) {
    assert.equal(topicForSkill(skill), undefined, `${skill} should not resolve to a topic`);
  }
});

test('skill names containing dots survive the lookup', () => {
  // Node.js Basics and Express.js are the names that broke the skill-gap
  // write path, because the store they went into rejected dotted keys.
  assert.equal(topicForSkill('Node.js Basics'), 'Node.js');
  assert.equal(topicForSkill('Express.js'), 'Express.js');
});
