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
    // The track's own curriculum skills, each with a topic of its own.
    'ES6+ & Modern JS',
    'Async JS (Promises, async/await)',
    'React Hooks & State Management',
    'React Router',
    'REST API Design',
    'JWT Authentication',
    'Full Stack Integration',
    'Deployment (Vercel + Render)',
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
    // The track's own curriculum skills, each with a topic of its own.
    'LLMs & Prompt Engineering',
    'MLOps Basics',
  ],
  'Data Science Engineer': [
    'Python Basics',
    'Statistics',
    'Data Analysis',
    'Data Visualization',
    'Machine Learning',
    'Big Data',
    // The track's own curriculum skills, each with a topic of its own.
    'Python for Data Science',
    'SQL Fundamentals',
    'Feature Engineering & Model Evaluation',
    'Model Deployment Basics',
  ],
  'DevOps Engineer': [
    'Linux',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'AWS',
    // The track's own curriculum skills, each with a topic of its own.
    'Linux & Shell Scripting',
    'Git & GitHub Workflows',
    'Infrastructure as Code (Terraform)',
    'Monitoring & Observability',
  ],
  'Mobile Developer': [
    'JavaScript',
    'React Native',
    'Flutter',
    'Android Development',
    'iOS Development',
    // The track's own curriculum skills, each with a topic of its own.
    'Programming Fundamentals',
    'OOP & App Architecture',
    'Mobile UI/UX Basics',
    'API Integration & State Management',
    'Testing & App Deployment',
  ],
  'Cybersecurity Engineer': [
    'Linux',
    'Python Basics',
    'Network Security',
    'Web Security',
    'Cryptography',
    'Ethical Hacking',
    // The track's own curriculum skills, each with a topic of its own.
    'Python for Security',
    'SIEM & Incident Response',
  ],
};

/** Topic names recommended for a role; empty when the role is unset or unknown. */
export const topicsForRole = (role) => ROLE_TOPICS[String(role || '').trim()] || [];

/** Every role in CAREER_ROLES has an entry — guards against adding a role and forgetting this. */
export const rolesMissingTopics = () => CAREER_ROLES.filter((role) => !ROLE_TOPICS[role]?.length);

export default ROLE_TOPICS;
