/**
 * Maps Skill Assessment quiz Topics to the canonical skill names the AI
 * service's role templates match on (ai_service/data/role_templates.py).
 *
 * The two taxonomies were built independently — quiz topics are coarse
 * ("React"), role-template skills are fine-grained ("React Hooks & State
 * Management") — and the roadmap generator matches by exact name.
 *
 * Each topic therefore says two different things, and conflating them was a
 * real bug. `assesses` is what sitting the quiz actually demonstrates.
 * `related` is what the topic touches on without testing it properly.
 *
 * The distinction only started to matter when a passing score began removing
 * a skill from a roadmap. Before that an unproven skill and a wrongly proven
 * one both ended up on the plan, so the over-reach was invisible; afterwards,
 * ten questions on "Python Basics" would excuse a Cybersecurity learner from
 * "Python for Security" — a different subject that happens to share a word.
 *
 * The rule is that a topic proves a skill only where it covers the same
 * subject at the same or wider scope. It never proves a skill whose name
 * points at a narrower specialism: "React" does not prove "React Router",
 * because React Router is a separate library a React quiz need not touch.
 *
 * Two names for one skill are both proven, because they are one skill. The
 * templates spell the same material differently per track — AI/ML has "ML
 * Fundamentals (Scikit-learn)" where Data Science has "Machine Learning
 * Fundamentals" — and a machine learning quiz is an equally fair test of
 * either.
 *
 * The cost is that skills with no topic of their own can no longer be tested
 * out of at all: "Python for Security", "Linux & Shell Scripting" and
 * "Feature Engineering & Model Evaluation" stay on a plan until the learner
 * marks them done. That is the honest answer while the catalogue has no topic
 * for them, and the fix is to add those topics rather than to accept a
 * neighbouring quiz as proof.
 *
 * A few topics (TypeScript, Computer Vision, Big Data) have no canonical
 * skill in any role template and are left unmapped on purpose — inventing a
 * match would misrepresent a gap that was never actually assessed.
 */
export const TOPIC_SKILL_MAP = {
  'JavaScript': {
    assesses: ['JavaScript Basics'],
    related: ['ES6+ & Modern JS', 'Async JS (Promises, async/await)'],
  },
  'React': {
    assesses: ['React Basics'],
    related: ['React Hooks & State Management', 'React Router'],
  },
  'Node.js': { assesses: ['Node.js Basics'], related: [] },
  'HTML & CSS': { assesses: ['HTML & CSS Basics'], related: [] },
  'Express.js': { assesses: ['Express.js'], related: [] },
  'MongoDB': { assesses: ['MongoDB & Mongoose'], related: [] },
  'Python Basics': {
    assesses: ['Python Basics'],
    // Same language, different subject: one is security tooling, the other is
    // the scientific stack. Neither is demonstrated by a basics quiz.
    related: ['Python for Security', 'Python for Data Science'],
  },
  'Machine Learning': {
    // One skill under two spellings, one per track.
    assesses: ['ML Fundamentals (Scikit-learn)', 'Machine Learning Fundamentals'],
    related: [],
  },
  'Deep Learning': { assesses: ['Deep Learning (PyTorch/TensorFlow)'], related: [] },
  'Natural Language Processing': { assesses: ['NLP Basics'], related: [] },
  'Network Security': { assesses: ['Networking Fundamentals'], related: [] },
  'Ethical Hacking': { assesses: ['Ethical Hacking & Penetration Testing'], related: [] },
  'Cryptography': { assesses: ['Cryptography Basics'], related: [] },
  'Web Security': { assesses: ['Web Security (OWASP Top 10)'], related: [] },
  'React Native': { assesses: ['Cross-Platform Development (React Native/Flutter)'], related: [] },
  'Flutter': { assesses: ['Cross-Platform Development (React Native/Flutter)'], related: [] },
  'iOS Development': { assesses: ['iOS Development (Swift)'], related: [] },
  'Android Development': { assesses: ['Android Development (Kotlin)'], related: [] },
  'Docker': { assesses: ['Docker Fundamentals'], related: [] },
  'Kubernetes': { assesses: ['Kubernetes Basics'], related: [] },
  'AWS': { assesses: ['Cloud Fundamentals (AWS/Azure/GCP)'], related: [] },
  'CI/CD': { assesses: ['CI/CD Pipelines'], related: [] },
  'Linux': {
    assesses: ['Linux Basics'],
    // Shell scripting is its own discipline; a Linux quiz need never ask you
    // to write one.
    related: ['Linux & Shell Scripting'],
  },
  'Data Analysis': {
    assesses: ['NumPy & Pandas'],
    related: ['Feature Engineering & Model Evaluation'],
  },
  'Data Visualization': { assesses: ['Data Visualization'], related: [] },
  'Statistics': { assesses: ['Statistics & Probability'], related: [] },

  // Added so the curriculum can actually be tested. Half of it had no quiz
  // behind it, which meant those skills could never be shown as known and
  // never came off a plan however much the learner already knew. The topic
  // is named exactly as the skill is, so the two cover the same ground by
  // construction rather than by a judgement someone has to keep making.
  'ES6+ & Modern JS': { assesses: ['ES6+ & Modern JS'], related: [] },
  'Async JS (Promises, async/await)': { assesses: ['Async JS (Promises, async/await)'], related: [] },
  'React Hooks & State Management': { assesses: ['React Hooks & State Management'], related: [] },
  'React Router': { assesses: ['React Router'], related: [] },
  'REST API Design': { assesses: ['REST API Design'], related: [] },
  'JWT Authentication': { assesses: ['JWT Authentication'], related: [] },
  'Full Stack Integration': { assesses: ['Full Stack Integration'], related: [] },
  'Deployment (Vercel + Render)': { assesses: ['Deployment (Vercel + Render)'], related: [] },
  'LLMs & Prompt Engineering': { assesses: ['LLMs & Prompt Engineering'], related: [] },
  'MLOps Basics': { assesses: ['MLOps Basics'], related: [] },
  'Python for Data Science': { assesses: ['Python for Data Science'], related: [] },
  'SQL Fundamentals': { assesses: ['SQL Fundamentals'], related: [] },
  'Feature Engineering & Model Evaluation': { assesses: ['Feature Engineering & Model Evaluation'], related: [] },
  'Model Deployment Basics': { assesses: ['Model Deployment Basics'], related: [] },
  'Linux & Shell Scripting': { assesses: ['Linux & Shell Scripting'], related: [] },
  'Git & GitHub Workflows': { assesses: ['Git & GitHub Workflows'], related: [] },
  'Infrastructure as Code (Terraform)': { assesses: ['Infrastructure as Code (Terraform)'], related: [] },
  'Monitoring & Observability': { assesses: ['Monitoring & Observability'], related: [] },
  'Programming Fundamentals': { assesses: ['Programming Fundamentals'], related: [] },
  'OOP & App Architecture': { assesses: ['OOP & App Architecture'], related: [] },
  'Mobile UI/UX Basics': { assesses: ['Mobile UI/UX Basics'], related: [] },
  'API Integration & State Management': { assesses: ['API Integration & State Management'], related: [] },
  'Testing & App Deployment': { assesses: ['Testing & App Deployment'], related: [] },
  'Python for Security': { assesses: ['Python for Security'], related: [] },
  'SIEM & Incident Response': { assesses: ['SIEM & Incident Response'], related: [] },
};

/**
 * The skills a score on this topic may be recorded against.
 *
 * Only what the quiz demonstrates. Writing the related skills too is what let
 * one quiz clear three skills off a plan, and it bought nothing: a skill that
 * is merely recorded and not proven is kept on the roadmap anyway.
 */
export const skillsAssessedBy = (topicName) =>
  TOPIC_SKILL_MAP[String(topicName || '').trim()]?.assesses || [];

/** What the topic touches without testing. Kept so the relationship is
 *  written down somewhere rather than lost, and so nothing has to guess at it
 *  later. */
export const skillsRelatedTo = (topicName) =>
  TOPIC_SKILL_MAP[String(topicName || '').trim()]?.related || [];

/**
 * The same mapping read backwards: which topic can be sat to test a roadmap
 * skill. Derived from the table above rather than written out again, so the
 * two can never disagree.
 *
 * Built from `assesses` only. A skill that is merely related has no fair test
 * in the catalogue, and offering a neighbouring quiz would send the learner
 * somewhere that cannot settle the question. Those return undefined, as do
 * real roadmap steps like "REST API Design" that have no topic at all.
 */
const SKILL_TO_TOPIC = Object.entries(TOPIC_SKILL_MAP).reduce((acc, [topic, entry]) => {
  for (const skill of entry.assesses) {
    // Some skills are genuinely covered by more than one topic: the template
    // has a single "Cross-Platform Development (React Native/Flutter)" that
    // both the React Native and Flutter topics assess. Either is a fair test
    // of it, so the first listed wins rather than the skill being untestable.
    if (!acc[skill]) acc[skill] = topic;
  }
  return acc;
}, {});

export const topicForSkill = (skill) => SKILL_TO_TOPIC[String(skill || '').trim()];
