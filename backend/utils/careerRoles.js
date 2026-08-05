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

export default CAREER_ROLES;
