import { CAREER_ROLES } from './careerRoles.js';

/**
 * Which quiz topics are worth assessing for each career track.
 *
 * This is about relevance, not curriculum membership, and it is deliberately
 * wider than the AI service's role templates. TypeScript, Computer Vision and
 * Big Data have no template skill behind them, but recommending them to the
 * obvious role is more useful than hiding them because the generator has no
 * module for them yet.
 *
 * Used to sort and mark topics, never to filter: someone should always be able
 * to assess something outside their track, and a topic missing from every list
 * here is still offered under "All topics".
 */
export const ROLE_TOPICS = {
  'MERN Developer': [
    'HTML & CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Express.js',
    'MongoDB',
  ],
  'AI/ML Engineer': [
    'Python Basics',
    'Machine Learning',
    'Deep Learning',
    'Natural Language Processing',
    'Computer Vision',
    'Statistics',
    'Data Analysis',
    'Data Visualization',
  ],
  'Data Science Engineer': [
    'Python Basics',
    'Statistics',
    'Data Analysis',
    'Data Visualization',
    'Machine Learning',
    'Big Data',
  ],
  'DevOps Engineer': [
    'Linux',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'AWS',
  ],
  'Mobile Developer': [
    'JavaScript',
    'React Native',
    'Flutter',
    'Android Development',
    'iOS Development',
  ],
  'Cybersecurity Engineer': [
    'Linux',
    'Python Basics',
    'Network Security',
    'Web Security',
    'Cryptography',
    'Ethical Hacking',
  ],
};

/** Topic names recommended for a role; empty when the role is unset or unknown. */
export const topicsForRole = (role) => ROLE_TOPICS[String(role || '').trim()] || [];

/** Every role in CAREER_ROLES has an entry — guards against adding a role and forgetting this. */
export const rolesMissingTopics = () => CAREER_ROLES.filter((role) => !ROLE_TOPICS[role]?.length);

export default ROLE_TOPICS;
