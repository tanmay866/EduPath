import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPIC_SKILL_MAP, topicForSkill } from '../utils/skillTopicMap.js';

/**
 * These names are matched verbatim against the AI service's role templates, so
 * a typo here does not throw — it just means a score never reaches the
 * roadmap, which is invisible until someone notices their plan ignoring an
 * assessment they sat.
 */
test('every topic maps to at least one skill', () => {
  for (const [topic, skills] of Object.entries(TOPIC_SKILL_MAP)) {
    assert.ok(Array.isArray(skills) && skills.length > 0, `${topic} maps to nothing`);
  }
});

test('no skill name is blank or carries stray whitespace', () => {
  for (const [topic, skills] of Object.entries(TOPIC_SKILL_MAP)) {
    for (const skill of skills) {
      assert.equal(typeof skill, 'string');
      assert.ok(skill.length > 0, `${topic} has an empty skill`);
      assert.equal(skill, skill.trim(), `"${skill}" has padding that would break exact matching`);
    }
  }
});

test('the reverse lookup resolves every mapped skill to a topic that covers it', () => {
  // A skill can legitimately be covered by more than one topic — the template
  // has one "Cross-Platform Development (React Native/Flutter)" that both the
  // React Native and Flutter topics assess. What matters is that the skill
  // resolves, and resolves to a topic that actually claims it.
  for (const [, skills] of Object.entries(TOPIC_SKILL_MAP)) {
    for (const skill of skills) {
      const resolved = topicForSkill(skill);
      assert.ok(resolved, `${skill} does not resolve back to a topic`);
      assert.ok(
        TOPIC_SKILL_MAP[resolved]?.includes(skill),
        `${skill} resolved to ${resolved}, which does not list it`
      );
    }
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
