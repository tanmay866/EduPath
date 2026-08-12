import { skillsAssessedBy, skillsRelatedTo } from './skillTopicMap.js';

/**
 * What a quiz result actually changed, in words.
 *
 * A learner sat a quiz, saw a percentage, and somewhere out of sight their
 * skill profile moved and their roadmap got shorter or did not. Nothing on
 * screen connected the three. The rules are not complicated — they were
 * simply never stated:
 *
 *   - a topic maps to one or more canonical skills (utils/skillTopicMap.js)
 *   - the score is written against those skills, replacing what was there
 *   - at or above the required score, a skill can come off the roadmap
 *   - skills the topic merely touches are deliberately not recorded
 *
 * That last one is the least guessable and the most surprising: a React quiz
 * does not quietly credit JavaScript. It is worth saying, because a learner
 * who expects it to and sees it not happen will assume something is broken.
 */

export const PASS_MARK = 70;

/**
 * @param {string} topicName
 * @param {number} percentage
 * @returns {{ assessed: string[], touched: string[], meetsBar: boolean,
 *             passMark: number, summary: string, notes: string[] }}
 */
export const scoreImpact = (topicName, percentage) => {
  const assessed = skillsAssessedBy(topicName);
  const related = skillsRelatedTo(topicName);
  // Anything both assessed and merely related is assessed — the stronger of
  // the two claims wins, and listing it twice would read as a contradiction.
  const touched = related.filter((skill) => !assessed.includes(skill));
  const meetsBar = percentage >= PASS_MARK;

  const notes = [];

  if (assessed.length === 0) {
    return {
      assessed: [],
      touched,
      meetsBar,
      passMark: PASS_MARK,
      summary: 'This topic is not yet mapped to a roadmap skill, so the result is kept as a record but does not move your plan.',
      notes,
    };
  }

  const list = assessed.length === 1
    ? assessed[0]
    : `${assessed.slice(0, -1).join(', ')} and ${assessed[assessed.length - 1]}`;

  const summary = `This quiz measures ${list}. Your score is recorded against ${assessed.length === 1 ? 'it' : 'each of them'}.`;

  notes.push(
    meetsBar
      ? `At ${PASS_MARK}% or above, ${assessed.length === 1 ? 'this skill' : 'these skills'} can be marked done on your roadmap.`
      : `The bar for marking a skill done is ${PASS_MARK}%, so ${assessed.length === 1 ? 'it stays' : 'they stay'} on your roadmap for now.`
  );

  if (touched.length > 0) {
    notes.push(
      `${touched.join(', ')} ${touched.length === 1 ? 'comes' : 'come'} up in these questions but ${touched.length === 1 ? 'is' : 'are'} not scored here — you were not asked about ${touched.length === 1 ? 'it' : 'them'} directly.`
    );
  }

  return { assessed, touched, meetsBar, passMark: PASS_MARK, summary, notes };
};
