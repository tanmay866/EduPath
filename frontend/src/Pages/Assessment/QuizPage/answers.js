/**
 * Translating between how the quiz page holds answers and how they are sent.
 *
 * These are two different shapes and the difference is easy to miss, which is
 * exactly what happened: the page keeps a list of objects,
 *
 *     [{ questionIndex: 0, selectedOptionIndex: 3 }, …]
 *
 * unordered and holding only the questions actually answered, while the API
 * takes one slot per question with the chosen option in it,
 *
 *     [3, null, 1, null, null]
 *
 * Sending the first shape where the second was expected stored nothing — the
 * server checks each entry is an integer and an object is not — and reading
 * the second back where the first was expected put bare numbers into a list
 * everything else searches with `.find(a => a.questionIndex === …)`, which
 * throws on the first `undefined` it meets. The quiz crashed on resume and
 * had saved nothing to resume from.
 */

/** Page shape to wire shape: one slot per question, null where unanswered. */
export const toPositional = (answers = [], totalQuestions = 0) => {
  const slots = new Array(totalQuestions).fill(null);

  for (const answer of answers) {
    // Guard the shape rather than assume it. A stray number or undefined in
    // the list is what this whole module exists because of.
    if (!answer || typeof answer !== 'object') continue;
    const { questionIndex, selectedOptionIndex } = answer;
    if (!Number.isInteger(questionIndex)) continue;
    if (questionIndex < 0 || questionIndex >= totalQuestions) continue;
    if (!Number.isInteger(selectedOptionIndex)) continue;
    slots[questionIndex] = selectedOptionIndex;
  }

  return slots;
};

/**
 * Wire shape back to page shape.
 *
 * Unanswered questions are left out entirely rather than included as holes,
 * because the page counts answers by length and searches by questionIndex —
 * a placeholder would be counted as an answer and matched as none.
 */
export const fromPositional = (savedAnswers = []) => {
  const answers = [];

  savedAnswers.forEach((selectedOptionIndex, questionIndex) => {
    if (!Number.isInteger(selectedOptionIndex)) return;
    answers.push({ questionIndex, selectedOptionIndex });
  });

  return answers;
};
