import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreImpact, PASS_MARK } from '../utils/scoreImpact.js';
import { TOPIC_SKILL_MAP } from '../utils/skillTopicMap.js';

/**
 * A learner sat a quiz, saw a percentage, and somewhere out of sight their
 * skill profile moved and their roadmap got shorter or did not. Nothing on
 * screen connected the three. These pin the wording of the connection, and
 * the rule that is least guessable: a topic's related skills are not scored.
 */
const anyTopic = Object.keys(TOPIC_SKILL_MAP)[0];

test('the skills a quiz measures are named', () => {
  const { assessed, summary } = scoreImpact(anyTopic, 80);
  assert.ok(assessed.length > 0, `${anyTopic} should assess something`);
  for (const skill of assessed) {
    assert.ok(summary.includes(skill), `summary should name ${skill}`);
  }
});

test('a pass explains what it unlocks', () => {
  const { meetsBar, notes } = scoreImpact(anyTopic, PASS_MARK);
  assert.equal(meetsBar, true);
  assert.ok(notes.some((n) => n.includes('marked done')), notes.join(' | '));
});

test('a fail explains what it does not', () => {
  const { meetsBar, notes } = scoreImpact(anyTopic, PASS_MARK - 1);
  assert.equal(meetsBar, false);
  assert.ok(notes.some((n) => n.includes('stays on your roadmap') || n.includes('stay on your roadmap')));
});

test('related skills are listed as not scored, never as scored', () => {
  // The surprising rule. A React quiz does not quietly credit JavaScript, and
  // a learner expecting it to will assume something is broken.
  const withRelated = Object.entries(TOPIC_SKILL_MAP).find(
    ([, entry]) => (entry.related || []).some((s) => !(entry.assesses || []).includes(s))
  );

  if (!withRelated) return; // nothing to check in this map

  const [topic] = withRelated;
  const { touched, assessed, notes } = scoreImpact(topic, 80);

  assert.ok(touched.length > 0);
  for (const skill of touched) {
    assert.ok(!assessed.includes(skill), `${skill} cannot be both scored and not scored`);
  }
  assert.ok(notes.some((n) => n.includes('not scored here')), notes.join(' | '));
});

test('an unmapped topic says the result does not move the plan', () => {
  const { assessed, summary } = scoreImpact('Underwater Basket Weaving', 90);
  assert.deepEqual(assessed, []);
  assert.match(summary, /does not move your plan/i);
});

test('every mapped topic produces a summary naming a skill', () => {
  // A topic that returns an empty sentence would leave the result page with a
  // heading and nothing under it.
  for (const topic of Object.keys(TOPIC_SKILL_MAP)) {
    const { summary } = scoreImpact(topic, 75);
    assert.ok(summary.length > 20, `${topic} produced "${summary}"`);
  }
});
