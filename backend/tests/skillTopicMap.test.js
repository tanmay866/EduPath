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

test('a skill is never sent to the topic that merely touches it', () => {
  // Each of these now has a topic of its own. What must not happen is the
  // lookup falling back to the broader topic that only brushes past it —
  // sending someone to a Python Basics quiz cannot settle Python for
  // Security, and answering it well would wrongly take the skill off a plan.
  const wrongAnswers = [
    ['Python for Security', 'Python Basics'],
    ['Python for Data Science', 'Python Basics'],
    ['React Router', 'React'],
    ['React Hooks & State Management', 'React'],
    ['ES6+ & Modern JS', 'JavaScript'],
    ['Async JS (Promises, async/await)', 'JavaScript'],
    ['Linux & Shell Scripting', 'Linux'],
    ['Feature Engineering & Model Evaluation', 'Data Analysis'],
  ];
  for (const [skill, tooBroad] of wrongAnswers) {
    assert.notEqual(
      topicForSkill(skill),
      tooBroad,
      `${skill} must not be settled by the ${tooBroad} quiz`
    );
    assert.equal(topicForSkill(skill), skill, `${skill} should be tested by its own topic`);
  }
});

test('a skill nobody has heard of resolves to nothing rather than a near match', () => {
  // Returning something approximate is how a learner gets sent to a quiz
  // that cannot answer the question they arrived with.
  for (const skill of ['Rust Basics', 'Quantum Computing', 'React Native Router', '', null]) {
    assert.equal(topicForSkill(skill), undefined, `${skill} should not resolve to a topic`);
  }
});

test('skill names containing dots survive the lookup', () => {
  // Node.js Basics and Express.js are the names that broke the skill-gap
  // write path, because the store they went into rejected dotted keys.
  assert.equal(topicForSkill('Node.js Basics'), 'Node.js');
  assert.equal(topicForSkill('Express.js'), 'Express.js');
});
