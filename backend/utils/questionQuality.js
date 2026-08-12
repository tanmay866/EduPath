/**
 * Keeps a generated quiz from repeating itself.
 *
 * Questions are written by a model, fresh for every attempt, with nothing
 * checking what came back. Two things went wrong as a result and neither was
 * visible to anyone: a set of ten could contain the same question twice in
 * slightly different words, and retaking a topic could hand back the very
 * questions just answered — which measures memory of last week's quiz rather
 * than the skill.
 *
 * Everything here is a pure function over the generated array, so the rules
 * can be tested without a model, a database or a network.
 */

/**
 * Reduce a question to the words that carry its meaning.
 *
 * Comparing raw strings catches nothing: "What is a React hook?" and "What is
 * a React Hook?" are different strings and the same question. Punctuation,
 * case and the handful of words every question is built from are dropped, so
 * what is left is the subject being asked about.
 */
const FILLER = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'what', 'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how',
  'does', 'do', 'did', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
  'from', 'as', 'and', 'or', 'not', 'you', 'your', 'it', 'its', 'this',
  'that', 'these', 'those', 'following', 'best', 'describes', 'correct',
  'true', 'false', 'about', 'used', 'use', 'will', 'would', 'can', 'could',
]);

export const significantWords = (text) =>
  String(text || '')
    .toLowerCase()
    // Keep alphanumerics and the characters that live inside real names —
    // "node.js" and "async/await" must not become two words each.
    .replace(/[^a-z0-9.+#/\s-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.replace(/^[.\-/]+|[.\-/]+$/g, ''))
    .filter((word) => word.length > 1 && !FILLER.has(word));

/**
 * How alike two questions are, from 0 to 1.
 *
 * Jaccard overlap of the significant words. Word order does not matter, which
 * is the point: a model rephrasing a question usually keeps the nouns and
 * moves everything else around.
 */
export const similarity = (a, b) => {
  const left = new Set(significantWords(a));
  const right = new Set(significantWords(b));
  if (left.size === 0 || right.size === 0) return 0;

  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;

  return shared / (left.size + right.size - shared);
};

/**
 * Above this, two questions are treated as the same one.
 *
 * Chosen to sit above genuine near-misses and below rephrasings. Two
 * questions about different hooks share "react" and "hook" and little else,
 * which lands well under it; the same question reworded shares nearly
 * everything. It is deliberately not 1.0 — exact-match deduplication would
 * catch almost nothing, because a model rarely repeats itself word for word.
 */
export const DUPLICATE_THRESHOLD = 0.7;

/**
 * Drop questions that repeat something already asked.
 *
 * `seen` carries the questions this learner has already been given on this
 * topic, so a retake is a new quiz rather than the same one again. The first
 * of any duplicated pair is kept, since order is otherwise meaningless.
 *
 * @param {Array} questions - generated questions
 * @param {string[]} seen - question text from earlier attempts
 * @returns {{ kept: Array, dropped: Array }}
 */
export const dropDuplicates = (questions = [], seen = []) => {
  const kept = [];
  const dropped = [];
  const keptWords = [];
  const seenWords = seen.map((text) => new Set(significantWords(text)));

  const overlaps = (words, others) =>
    others.some((other) => {
      if (words.size === 0 || other.size === 0) return false;
      let shared = 0;
      for (const word of words) if (other.has(word)) shared += 1;
      return shared / (words.size + other.size - shared) >= DUPLICATE_THRESHOLD;
    });

  for (const question of questions) {
    const words = new Set(significantWords(question?.question));

    if (overlaps(words, seenWords) || overlaps(words, keptWords)) {
      dropped.push(question);
      continue;
    }

    kept.push(question);
    keptWords.push(words);
  }

  return { kept, dropped };
};

/**
 * The spread of difficulties a quiz should aim for.
 *
 * A quiz that is all one difficulty cannot tell "knows the basics" apart from
 * "knows this well" — everyone who passes looks alike. The chosen level is
 * the centre of gravity rather than the whole quiz: most questions sit at it,
 * with a tail either side so a score has somewhere to move.
 *
 * Beginner has no easier neighbour and advanced no harder one, so those lean
 * on the one side available to them.
 */
const MIX = {
  beginner: { beginner: 0.7, intermediate: 0.3, advanced: 0 },
  intermediate: { beginner: 0.25, intermediate: 0.5, advanced: 0.25 },
  advanced: { beginner: 0, intermediate: 0.3, advanced: 0.7 },
};

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

/**
 * How many questions of each difficulty a quiz of this size should hold.
 *
 * Rounding is settled by giving any remainder to the chosen level, so the
 * counts always add up to exactly `count` and the level asked for is never
 * the one shortchanged.
 */
export const difficultyTargets = (chosen, count) => {
  const mix = MIX[chosen] || MIX.intermediate;
  const targets = {};
  let allocated = 0;

  for (const level of DIFFICULTIES) {
    if (level === chosen) continue;
    const n = Math.round((mix[level] || 0) * count);
    targets[level] = n;
    allocated += n;
  }

  // Whatever is left, including any rounding drift, belongs to the level the
  // learner actually picked.
  targets[chosen] = Math.max(0, count - allocated);
  return targets;
};

const levelOf = (question, fallback) =>
  DIFFICULTIES.includes(question?.difficulty) ? question.difficulty : fallback;

/**
 * Choose a set that matches the target spread as closely as the questions
 * allow.
 *
 * The model is asked for a mix but does not always return one, and a short
 * generation must still produce a usable quiz — so this fills each level up
 * to its target, then tops up from whatever is left over rather than
 * returning fewer questions than asked for. Balancing is a preference, not a
 * reason to hand somebody a quiz of four questions.
 *
 * @returns {{ selected: Array, counts: Object, balanced: boolean }}
 */
export const balanceDifficulty = (questions = [], chosen = 'intermediate', count = questions.length) => {
  const targets = difficultyTargets(chosen, count);
  const pools = { beginner: [], intermediate: [], advanced: [] };

  for (const question of questions) pools[levelOf(question, chosen)].push(question);

  const selected = [];
  const counts = { beginner: 0, intermediate: 0, advanced: 0 };

  for (const level of DIFFICULTIES) {
    const take = pools[level].splice(0, targets[level]);
    selected.push(...take);
    counts[level] = take.length;
  }

  // Short of the target spread — take anything still unused rather than
  // shrinking the quiz.
  const balanced = selected.length === count;
  if (!balanced) {
    const leftovers = DIFFICULTIES.flatMap((level) => pools[level]);
    for (const question of leftovers.slice(0, count - selected.length)) {
      selected.push(question);
      counts[levelOf(question, chosen)] += 1;
    }
  }

  return { selected, counts, balanced };
};
