/**
 * How much a quiz score is actually worth as evidence.
 *
 * A percentage hides the thing that matters most about it. Four out of five
 * and sixteen out of twenty are both 80%, and they are not the same claim:
 * one more question going the other way moves the first by twenty points and
 * the second by five. The app showed them identically, wrote both into the
 * skill profile with equal weight, and let either drop a skill from the
 * roadmap.
 *
 * This does not change the score. It says how firmly it is known, so a result
 * from five questions can be read as the rough indication it is.
 */

/**
 * The Wilson score interval, at roughly 95%.
 *
 * Chosen over the textbook normal approximation because that one misbehaves
 * exactly where quizzes live: at small n and at scores near 0 or 100 it
 * produces intervals running past the ends of the scale, so a perfect score
 * on five questions would come back as "100% give or take 0", which is the
 * opposite of the truth. Wilson stays inside the bounds and stays wide when
 * the evidence is thin.
 */
const Z = 1.96;

export const wilsonInterval = (correct, total) => {
  if (!Number.isFinite(total) || total <= 0) return { low: 0, high: 100 };

  const p = Math.min(Math.max(correct / total, 0), 1);
  const z2 = Z * Z;
  const denominator = 1 + z2 / total;
  const centre = (p + z2 / (2 * total)) / denominator;
  const spread = (Z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / denominator;

  return {
    low: Math.max(0, Math.round((centre - spread) * 100)),
    high: Math.min(100, Math.round((centre + spread) * 100)),
  };
};

/**
 * Question counts at which a score starts to mean something.
 *
 * Not arbitrary: with fewer than five questions a single answer moves the
 * result by at least twenty points, which is wider than the gap between the
 * pass mark and a comfortable pass. Ten is where one answer stops being able
 * to change the verdict on its own.
 */
export const CONFIDENCE_BANDS = [
  { level: 'low', minQuestions: 0 },
  { level: 'moderate', minQuestions: 5 },
  { level: 'good', minQuestions: 10 },
  { level: 'high', minQuestions: 20 },
];

export const confidenceLevel = (total) =>
  [...CONFIDENCE_BANDS].reverse().find((band) => total >= band.minQuestions)?.level || 'low';

/**
 * What one more answer either way would do to the percentage.
 *
 * The most direct way to show that a short quiz is a rough measure: on five
 * questions it is twenty points, and nobody needs statistics explained to
 * understand what that means.
 */
export const swingPerQuestion = (total) =>
  total > 0 ? Math.round((100 / total) * 10) / 10 : 0;

/**
 * Whether a result is firm enough to act on by itself.
 *
 * Used for the offer to tick a roadmap skill off. Passing on four questions
 * is not nothing, but it is not grounds for removing a skill from a plan
 * without asking — so the offer is still made, and the thinness is said out
 * loud rather than left for the learner to work out.
 */
export const MIN_QUESTIONS_TO_SETTLE = 5;

/**
 * The full picture for one result.
 *
 * @param {number} correct
 * @param {number} total
 * @returns {{ percentage: number, level: string, interval: {low:number,high:number},
 *             swing: number, reliable: boolean, note: string }}
 */
/**
 * Above this many points of uncertainty, a score should not be stated
 * plainly.
 *
 * The count on its own is not enough to decide the wording, which is a
 * mistake worth recording: five questions reads as a reasonable quiz and
 * lands in the middle band, but four out of five carries a true range of
 * 38–96%. Describing that as "based on 5 questions" is confident phrasing
 * wrapped around a fifty-eight point spread. The interval is the honest
 * measure, so it is what chooses the sentence.
 */
const WIDE_INTERVAL = 30;

/**
 * Below this many questions, the length is the story.
 *
 * Kept separate from MIN_QUESTIONS_TO_SETTLE, which answers a different
 * question — whether a result is firm enough to tick a roadmap skill off.
 * Five questions clears that bar and is still plainly a short quiz, so one
 * constant serving both produced a five-question result described as though
 * its length were not worth mentioning.
 */
const SHORT_QUIZ = 10;

export const scoreConfidence = (correct, total) => {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const interval = wilsonInterval(correct, total);
  const level = confidenceLevel(total);
  const swing = swingPerQuestion(total);
  const reliable = total >= MIN_QUESTIONS_TO_SETTLE;
  const width = interval.high - interval.low;

  // Two separate facts, and conflating them produced a sentence that was
  // wrong either way. A short quiz is uncertain *because* it is short, and
  // saying so is useful. Twenty questions is a proper quiz that can still
  // carry a wide range — calling that "only 20 questions" misdescribes it,
  // but stating the score flatly hides the spread. So the count explains
  // itself when it is the problem, and the range speaks for itself when it
  // is not.
  let note;
  if (total === 0) {
    note = 'No questions were answered, so there is nothing to measure.';
  } else if (total < SHORT_QUIZ) {
    note = `Only ${total} question${total === 1 ? '' : 's'}, so treat this as a rough indication — a single answer moves it by ${swing} points.`;
  } else if (width > WIDE_INTERVAL) {
    note = `Based on ${total} questions, though this is not a precise measure: the true level is somewhere between ${interval.low}% and ${interval.high}%.`;
  } else {
    note = `Based on ${total} questions. One more either way would move this by ${swing} points.`;
  }

  return { percentage, level, interval, swing, reliable, width, note };
};
