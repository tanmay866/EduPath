import test from 'node:test';
import assert from 'node:assert/strict';
import { CAREER_ROLES } from '../utils/careerRoles.js';
import { ROLE_TOPICS, topicsForRole, rolesMissingTopics } from '../utils/roleTopicMap.js';
import { TOPIC_SKILL_MAP } from '../utils/skillTopicMap.js';

/**
 * These decide which topics are suggested first on the skill assessment. A
 * role missing from the table does not error — the learner just gets an
 * unsorted list of 29 topics and no suggestion, which looks like the feature
 * was never built rather than like a bug.
 */
test('every supported role has topics to suggest', () => {
  assert.deepEqual(rolesMissingTopics(), [], 'a role was added without giving it topics');
});

test('the table covers the supported roles and nothing else', () => {
  assert.deepEqual(Object.keys(ROLE_TOPICS).sort(), [...CAREER_ROLES].sort());
});

/**
 * Catalogue topics that deliberately have no skill in any role template.
 * Suggesting them is intentional — they are obviously relevant to a track even
 * though the generator has no module for them yet — so they are named here
 * rather than weakening the typo check for everything.
 */
const CATALOGUE_ONLY_TOPICS = ['TypeScript', 'Computer Vision', 'Big Data'];

test('every suggested topic is a real topic name', () => {
  // Suggestions are matched against the catalogue by name, so a typo silently
  // suggests nothing at all rather than erroring.
  const known = new Set([...Object.keys(TOPIC_SKILL_MAP), ...CATALOGUE_ONLY_TOPICS]);
  for (const [role, topics] of Object.entries(ROLE_TOPICS)) {
    for (const topic of topics) {
      assert.ok(known.has(topic), `${role} suggests "${topic}", which is not a topic name`);
    }
  }
});

test('the catalogue-only list stays honest', () => {
  // If one of these gains a template skill, it belongs in the map and should
  // drop out of this list — otherwise the exemption hides a future typo.
  for (const topic of CATALOGUE_ONLY_TOPICS) {
    assert.ok(
      !Object.keys(TOPIC_SKILL_MAP).includes(topic),
      `${topic} now has a template skill and no longer needs an exemption`
    );
  }
});

test('no role suggests the same topic twice', () => {
  for (const [role, topics] of Object.entries(ROLE_TOPICS)) {
    assert.equal(new Set(topics).size, topics.length, `${role} lists a topic more than once`);
  }
});

test('an unset or unknown role suggests nothing rather than guessing', () => {
  for (const role of ['', null, undefined, 'Email Marketer', 'mern developer']) {
    assert.deepEqual(topicsForRole(role), [], `${role} should suggest nothing`);
  }
});
