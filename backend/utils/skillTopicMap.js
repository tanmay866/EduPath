/**
 * Maps Skill Assessment quiz Topics to the canonical skill names the AI
 * service's role templates match on (ai_service/data/role_templates.py).
 *
 * The two taxonomies were built independently — quiz topics are coarse
 * ("React"), role-template skills are fine-grained ("React Hooks & State
 * Management") — and the roadmap generator filters by exact string match
 * against those canonical names. So a single quiz score has to fan out to
 * every canonical skill it covers, spelled exactly as the AI service has
 * them.
 *
 * A few topics (TypeScript, Computer Vision, Big Data) have no canonical
 * skill in any role template and are left unmapped on purpose — inventing a
 * match would misrepresent a gap that was never actually assessed.
 */
export const TOPIC_SKILL_MAP = {
  'JavaScript': ['JavaScript Basics', 'ES6+ & Modern JS', 'Async JS (Promises, async/await)'],
  'React': ['React Basics', 'React Hooks & State Management', 'React Router'],
  'Node.js': ['Node.js Basics'],
  'HTML & CSS': ['HTML & CSS Basics'],
  'Express.js': ['Express.js'],
  'MongoDB': ['MongoDB & Mongoose'],
  'Python Basics': ['Python Basics', 'Python for Security', 'Python for Data Science'],
  'Machine Learning': ['ML Fundamentals (Scikit-learn)', 'Machine Learning Fundamentals'],
  'Deep Learning': ['Deep Learning (PyTorch/TensorFlow)'],
  'Natural Language Processing': ['NLP Basics'],
  'Network Security': ['Networking Fundamentals'],
  'Ethical Hacking': ['Ethical Hacking & Penetration Testing'],
  'Cryptography': ['Cryptography Basics'],
  'Web Security': ['Web Security (OWASP Top 10)'],
  'React Native': ['Cross-Platform Development (React Native/Flutter)'],
  'Flutter': ['Cross-Platform Development (React Native/Flutter)'],
  'iOS Development': ['iOS Development (Swift)'],
  'Android Development': ['Android Development (Kotlin)'],
  'Docker': ['Docker Fundamentals'],
  'Kubernetes': ['Kubernetes Basics'],
  'AWS': ['Cloud Fundamentals (AWS/Azure/GCP)'],
  'CI/CD': ['CI/CD Pipelines'],
  'Linux': ['Linux Basics', 'Linux & Shell Scripting'],
  'Data Analysis': ['NumPy & Pandas', 'Feature Engineering & Model Evaluation'],
  'Data Visualization': ['Data Visualization'],
  'Statistics': ['Statistics & Probability'],
};
