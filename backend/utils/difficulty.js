/**
 * The one difficulty vocabulary results are stored in.
 *
 * QuizResult has always enforced these three. PracticeResult did not enforce
 * anything, so CS Fundamentals — whose picker is labelled Easy / Medium / Hard
 * because the upstream question API is — wrote "Easy" straight through. Those
 * rows then belonged to no bucket the admin screens know about: they showed up
 * as a fourth bar in the difficulty split and were invisible under every
 * filter except "All", while the footer still claimed to have counted them.
 *
 * Easy/Medium/Hard is a real constraint rather than a mistake — the external
 * question provider takes EASY|MEDIUM|HARD and nothing else — so it stays on
 * the request. It just stops being what we save.
 */
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

/** Everything seen in the wild, mapped onto the three we store. */
const ALIASES = {
  easy: 'beginner',
  medium: 'intermediate',
  hard: 'advanced',
  basic: 'beginner',
  expert: 'advanced',
};

export const isDifficulty = (value) => DIFFICULTIES.includes(String(value ?? '').trim().toLowerCase());

/**
 * A stored difficulty, or null if there is nothing usable.
 *
 * Null rather than a default: PracticeResult.difficulty is optional, and
 * guessing "beginner" for a missing value would put invented rows in a chart
 * an admin reads as fact.
 */
export const normalizeDifficulty = (value) => {
  const key = String(value ?? '').trim().toLowerCase();
  if (!key) return null;
  if (DIFFICULTIES.includes(key)) return key;
  return ALIASES[key] || null;
};

export default DIFFICULTIES;
