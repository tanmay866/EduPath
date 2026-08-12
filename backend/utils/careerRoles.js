/**
 * The career roles EduPath can actually build a plan for.
 *
 * These strings are matched verbatim by the AI service's roadmap templates
 * (ai_service/data/role_templates.py), so they are not free labels — a value
 * that is not on this list has no curriculum behind it and roadmap generation
 * will reject it.
 *
 * Kept here rather than inline so the model, the profile endpoint and the
 * onboarding screen all agree on one list.
 */
export const CAREER_ROLES = [
  'MERN Developer',
  'AI/ML Engineer',
  'Data Science Engineer',
  'DevOps Engineer',
  'Mobile Developer',
  'Cybersecurity Engineer',
];

export const isCareerRole = (value) => CAREER_ROLES.includes(String(value || '').trim());

/**
 * The same six roles under the names the skill-assessment agent knows them by.
 *
 * Two vocabularies exist because two parts of the AI service were written
 * against different lists: the roadmap templates key off the full role name
 * above, while CAREER_SKILL_MAPPING in ai_service/config/settings.py keys off
 * these short forms. Sending a full name to the assessment agent finds no
 * entry, so it falls back to generic advice — which is the quiet half of the
 * failure this map exists to prevent.
 */
const AI_CAREER_PATHS = {
  'MERN Developer': 'MERN',
  'AI/ML Engineer': 'AI',
  'Data Science Engineer': 'Data Science',
  'DevOps Engineer': 'DevOps',
  'Mobile Developer': 'Mobile',
  'Cybersecurity Engineer': 'Cyber',
};

/**
 * The career path to assess a quiz result against.
 *
 * Quiz submission used to send 'MERN' for everybody, so a learner on the
 * Cybersecurity track had their result read — and their next steps written —
 * by an agent told they were building React apps. A learner who has not
 * picked a role yet still gets the old default, because the agent requires
 * some path and MERN is the one its prompts read least strangely against a
 * general web quiz.
 */
export const careerPathFor = (targetRole) =>
  AI_CAREER_PATHS[String(targetRole || '').trim()] || 'MERN';

export default CAREER_ROLES;
