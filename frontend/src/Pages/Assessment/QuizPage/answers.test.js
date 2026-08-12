import { describe, test, expect } from 'vitest';

import { toPositional, fromPositional } from './answers';

/**
 * These exist because of a bug that every unit test missed and the browser
 * found in one refresh.
 *
 * The quiz page holds answers as objects and the API takes one slot per
 * question. Sending the page's shape stored nothing — the server checks each
 * entry is an integer and an object is not — and reading the API's shape back
 * into the page put bare numbers into a list that is searched with
 * `.find(a => a.questionIndex === …)`, which throws on the first undefined.
 * So the quiz crashed on resume, with nothing saved to resume from.
 *
 * The round-trip is the case worth guarding, because either direction alone
 * looks correct.
 */
const PAGE_SHAPE = [
  { questionIndex: 0, selectedOptionIndex: 3 },
  { questionIndex: 2, selectedOptionIndex: 1 },
];

describe('page shape to wire shape', () => {
  test('answers land in their own slots, gaps stay null', () => {
    expect(toPositional(PAGE_SHAPE, 5)).toEqual([3, null, 1, null, null]);
  });

  test('order in the list does not matter, position does', () => {
    // The page pushes answers in the order they were given, not by question.
    const reversed = [...PAGE_SHAPE].reverse();
    expect(toPositional(reversed, 5)).toEqual([3, null, 1, null, null]);
  });

  test('an unanswered quiz is all gaps, not an empty array', () => {
    // Length carries the question count, which the server uses to bound what
    // it accepts.
    expect(toPositional([], 3)).toEqual([null, null, null]);
  });

  test('answers beyond the end of the quiz are dropped', () => {
    expect(toPositional([{ questionIndex: 9, selectedOptionIndex: 1 }], 3))
      .toEqual([null, null, null]);
  });

  test('junk in the list cannot throw', () => {
    // A bare number in this list is exactly the bug that crashed the resume.
    const messy = [undefined, null, 7, { questionIndex: 1, selectedOptionIndex: 2 }];
    expect(() => toPositional(messy, 3)).not.toThrow();
    expect(toPositional(messy, 3)).toEqual([null, 2, null]);
  });
});

describe('wire shape to page shape', () => {
  test('gaps are left out rather than kept as holes', () => {
    // A placeholder would be counted as an answer by length and matched as
    // none by questionIndex.
    expect(fromPositional([3, null, 1, null, null])).toEqual(PAGE_SHAPE);
  });

  test('every entry is an object the page can search', () => {
    for (const answer of fromPositional([0, 1, 2])) {
      expect(typeof answer).toBe('object');
      expect(Number.isInteger(answer.questionIndex)).toBe(true);
      expect(Number.isInteger(answer.selectedOptionIndex)).toBe(true);
    }
  });

  test('option zero is an answer, not a gap', () => {
    // The falsy trap: choosing option A must not read as unanswered.
    expect(fromPositional([0, null])).toEqual([{ questionIndex: 0, selectedOptionIndex: 0 }]);
  });

  test('nothing saved yields nothing restored', () => {
    expect(fromPositional([])).toEqual([]);
    expect(fromPositional([null, null])).toEqual([]);
  });
});

describe('the round trip', () => {
  test('survives a save and a reload unchanged', () => {
    expect(fromPositional(toPositional(PAGE_SHAPE, 5))).toEqual(PAGE_SHAPE);
  });

  test('survives when the first option was chosen everywhere', () => {
    const allA = [0, 1, 2].map((questionIndex) => ({ questionIndex, selectedOptionIndex: 0 }));
    expect(fromPositional(toPositional(allA, 3))).toEqual(allA);
  });

  test('the result is searchable the way the quiz page searches it', () => {
    // The exact call that threw: answers.find(a => a.questionIndex === n).
    const restored = fromPositional(toPositional(PAGE_SHAPE, 5));
    expect(() => restored.find((a) => a.questionIndex === 2)).not.toThrow();
    expect(restored.find((a) => a.questionIndex === 2).selectedOptionIndex).toBe(1);
    expect(restored.find((a) => a.questionIndex === 1)).toBeUndefined();
  });
});
