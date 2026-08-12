import test from 'node:test';
import assert from 'node:assert/strict';
import {
  significantWords,
  similarity,
  dropDuplicates,
  difficultyTargets,
  balanceDifficulty,
  DIFFICULTIES,
} from '../utils/questionQuality.js';

/**
 * Questions are written by a model, fresh for every attempt, and nothing used
 * to check what came back. A set of ten could ask the same thing twice in
 * different words, and retaking a topic could hand back the questions just
 * answered — which measures memory of last week's quiz rather than the skill.
 */

const q = (question, difficulty) => ({ question, difficulty });

test('the words that carry meaning survive, the scaffolding does not', () => {
  assert.deepEqual(
    significantWords('What is the purpose of the useState hook?'),
    ['purpose', 'usestate', 'hook']
  );
});

test('names keep the characters that are part of them', () => {
  // Splitting on every non-letter turns one real name into two useless words.
  assert.deepEqual(significantWords('Node.js and async/await'), ['node.js', 'async/await']);
  assert.deepEqual(significantWords('What is C# used for?'), ['c#']);
});

test('a rephrased question is recognised as the same one', () => {
  const a = 'What is the purpose of the useState hook in React?';
  const b = 'In React, what purpose does the useState hook serve?';
  assert.ok(similarity(a, b) >= 0.7, `expected these to match, got ${similarity(a, b)}`);
});

test('different questions about the same subject are not confused', () => {
  // Both are about React hooks. Treating them as duplicates would quietly
  // shrink every quiz on the topic.
  const a = 'What is the purpose of the useState hook?';
  const b = 'Which hook runs after every render by default?';
  assert.ok(similarity(a, b) < 0.7, `expected these to differ, got ${similarity(a, b)}`);
});

test('an empty question matches nothing rather than everything', () => {
  assert.equal(similarity('', 'What is a closure?'), 0);
  assert.equal(similarity('', ''), 0);
});

test('a repeated question inside one set is dropped once, not twice', () => {
  const { kept, dropped } = dropDuplicates([
    q('What is the purpose of the useState hook in React?'),
    q('Which hook runs after every render?'),
    q('In React, what purpose does the useState hook serve?'),
  ]);

  assert.equal(kept.length, 2);
  assert.equal(dropped.length, 1);
  // The first of a duplicated pair is the one kept.
  assert.match(kept[0].question, /purpose of the useState/);
});

test('questions the learner has already been asked are dropped', () => {
  const seen = ['What is the purpose of the useState hook in React?'];
  const { kept, dropped } = dropDuplicates(
    [
      q('In React, what purpose does the useState hook serve?'),
      q('Which hook runs after every render?'),
    ],
    seen
  );

  assert.equal(dropped.length, 1);
  assert.equal(kept.length, 1);
  assert.match(kept[0].question, /every render/);
});

test('nothing is dropped when there is nothing to match against', () => {
  const questions = [q('One?'), q('Two?'), q('Three?')];
  const { kept, dropped } = dropDuplicates(questions, []);
  assert.equal(kept.length, 3);
  assert.equal(dropped.length, 0);
});

test('targets always add up to the number of questions asked for', () => {
  // Rounding three proportions independently is how a "ten question" quiz
  // ends up with nine or eleven.
  for (const chosen of DIFFICULTIES) {
    for (const count of [5, 7, 10, 12, 15, 20, 25]) {
      const targets = difficultyTargets(chosen, count);
      const total = DIFFICULTIES.reduce((sum, level) => sum + targets[level], 0);
      assert.equal(total, count, `${chosen} / ${count} came to ${total}`);
    }
  }
});

test('the level chosen is always the largest share', () => {
  for (const chosen of DIFFICULTIES) {
    const targets = difficultyTargets(chosen, 10);
    for (const other of DIFFICULTIES) {
      if (other === chosen) continue;
      assert.ok(
        targets[chosen] >= targets[other],
        `${chosen} quiz gave ${other} ${targets[other]} against ${targets[chosen]}`
      );
    }
  }
});

test('beginner and advanced lean on the one neighbour they have', () => {
  // There is nothing easier than beginner or harder than advanced, so a mix
  // that reserved a share for them would leave the quiz short.
  assert.equal(difficultyTargets('beginner', 10).advanced, 0);
  assert.equal(difficultyTargets('advanced', 10).beginner, 0);
});

test('a balanced generation is selected to the target spread', () => {
  const questions = [
    ...Array.from({ length: 5 }, (_, i) => q(`easy ${i}`, 'beginner')),
    ...Array.from({ length: 5 }, (_, i) => q(`mid ${i}`, 'intermediate')),
    ...Array.from({ length: 5 }, (_, i) => q(`hard ${i}`, 'advanced')),
  ];

  const { selected, counts, balanced } = balanceDifficulty(questions, 'intermediate', 8);
  assert.equal(selected.length, 8);
  assert.equal(balanced, true);
  assert.deepEqual(counts, difficultyTargets('intermediate', 8));
});

test('a lopsided generation still produces a full quiz', () => {
  // The model returning ten intermediates is not a reason to hand somebody a
  // quiz of four. Balance is a preference, not a size limit.
  const questions = Array.from({ length: 10 }, (_, i) => q(`mid ${i}`, 'intermediate'));

  const { selected, balanced } = balanceDifficulty(questions, 'intermediate', 10);
  assert.equal(selected.length, 10);
  assert.equal(balanced, false, 'should report that the spread was not achieved');
});

test('questions with no difficulty count as the level asked for', () => {
  // The model omits the field often enough that treating those as unusable
  // would throw away most of a generation.
  const questions = Array.from({ length: 6 }, (_, i) => ({ question: `q ${i}` }));
  const { selected } = balanceDifficulty(questions, 'beginner', 6);
  assert.equal(selected.length, 6);
});

test('asking for more than was generated returns what there is', () => {
  const questions = [q('a', 'beginner'), q('b', 'beginner')];
  const { selected } = balanceDifficulty(questions, 'beginner', 10);
  assert.equal(selected.length, 2);
});
