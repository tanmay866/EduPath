/**
 * Quiz catalog: the categories and topics the assessment features are built on.
 *
 * This is reference data, not user data. It previously existed only inside one
 * Atlas cluster with no way to recreate it — wiping that database left the quiz
 * feature with nothing to serve and no path back. Keeping it in git makes any
 * environment reproducible with `npm run seed`.
 *
 * _id values are fixed on purpose: topics reference categories by _id, and
 * existing quiz results reference topics the same way.
 */

export const CATEGORIES = [
  {
    "_id": "6997e34b1a187c8ce3375081",
    "name": "Web Development",
    "description": "Frontend and backend web development technologies",
    "icon": "🌐",
    "color": "#3B82F6",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "6997e34b1a187c8ce3375082",
    "name": "Artificial Intelligence & Machine Learning",
    "description": "AI, ML, Deep Learning, and Data Science",
    "icon": "🤖",
    "color": "#8B5CF6",
    "isActive": true,
    "order": 2
  },
  {
    "_id": "6997e34b1a187c8ce3375083",
    "name": "Cybersecurity",
    "description": "Security fundamentals, ethical hacking, and network security",
    "icon": "🔒",
    "color": "#EF4444",
    "isActive": true,
    "order": 3
  },
  {
    "_id": "6997e34b1a187c8ce3375084",
    "name": "Mobile Development",
    "description": "iOS, Android, and cross-platform mobile development",
    "icon": "📱",
    "color": "#10B981",
    "isActive": true,
    "order": 4
  },
  {
    "_id": "6997e34b1a187c8ce3375085",
    "name": "DevOps & Cloud",
    "description": "CI/CD, containerization, and cloud platforms",
    "icon": "☁️",
    "color": "#F59E0B",
    "isActive": true,
    "order": 5
  },
  {
    "_id": "6997e34b1a187c8ce3375086",
    "name": "Data Science",
    "description": "Data analysis, visualization, and statistical methods",
    "icon": "📊",
    "color": "#06B6D4",
    "isActive": true,
    "order": 6
  }
];

export const TOPICS = [
  {
    "_id": "6997e34b1a187c8ce3375088",
    "name": "JavaScript",
    "categoryId": "6997e34b1a187c8ce3375081",
    "description": "Core JavaScript programming language",
    "icon": "⚡",
    "difficulty": "beginner",
    "tags": [
      "frontend",
      "backend",
      "programming"
    ],
    "isActive": true,
    "order": 1
  },
  {
    "_id": "6997e34b1a187c8ce3375089",
    "name": "React",
    "categoryId": "6997e34b1a187c8ce3375081",
    "description": "Popular JavaScript library for building UIs",
    "icon": "⚛️",
    "difficulty": "intermediate",
    "tags": [
      "frontend",
      "library",
      "spa"
    ],
    "isActive": true,
    "order": 2
  },
  {
    "_id": "6997e34b1a187c8ce337508a",
    "name": "Node.js",
    "categoryId": "6997e34b1a187c8ce3375081",
    "description": "JavaScript runtime for server-side development",
    "icon": "🟢",
    "difficulty": "intermediate",
    "tags": [
      "backend",
      "runtime",
      "server"
    ],
    "isActive": true,
    "order": 3
  },
  {
    "_id": "6997e34b1a187c8ce337508b",
    "name": "HTML & CSS",
    "categoryId": "6997e34b1a187c8ce3375081",
    "description": "Fundamental web markup and styling",
    "icon": "🎨",
    "difficulty": "beginner",
    "tags": [
      "frontend",
      "markup",
      "styling"
    ],
    "isActive": true,
    "order": 4
  },
  {
    "_id": "6997e34b1a187c8ce337508c",
    "name": "TypeScript",
    "categoryId": "6997e34b1a187c8ce3375081",
    "description": "Typed superset of JavaScript",
    "icon": "🔷",
    "difficulty": "intermediate",
    "tags": [
      "frontend",
      "backend",
      "programming"
    ],
    "isActive": true,
    "order": 5
  },
  {
    "_id": "6997e34b1a187c8ce337508d",
    "name": "Express.js",
    "categoryId": "6997e34b1a187c8ce3375081",
    "description": "Fast web framework for Node.js",
    "icon": "🚂",
    "difficulty": "intermediate",
    "tags": [
      "backend",
      "framework",
      "api"
    ],
    "isActive": true,
    "order": 6
  },
  {
    "_id": "6997e34b1a187c8ce337508e",
    "name": "MongoDB",
    "categoryId": "6997e34b1a187c8ce3375081",
    "description": "NoSQL document database",
    "icon": "🍃",
    "difficulty": "intermediate",
    "tags": [
      "database",
      "nosql",
      "backend"
    ],
    "isActive": true,
    "order": 7
  },
  {
    "_id": "6997e34b1a187c8ce3375092",
    "name": "Python Basics",
    "categoryId": "6997e34b1a187c8ce3375082",
    "description": "Python programming fundamentals",
    "icon": "🐍",
    "difficulty": "beginner",
    "tags": [
      "programming",
      "python",
      "basics"
    ],
    "isActive": true,
    "order": 1
  },
  {
    "_id": "6997e34b1a187c8ce3375093",
    "name": "Machine Learning",
    "categoryId": "6997e34b1a187c8ce3375082",
    "description": "ML algorithms and concepts",
    "icon": "🧠",
    "difficulty": "advanced",
    "tags": [
      "ml",
      "algorithms",
      "ai"
    ],
    "isActive": true,
    "order": 2
  },
  {
    "_id": "6997e34b1a187c8ce3375094",
    "name": "Deep Learning",
    "categoryId": "6997e34b1a187c8ce3375082",
    "description": "Neural networks and deep learning",
    "icon": "🔬",
    "difficulty": "advanced",
    "tags": [
      "dl",
      "neural-networks",
      "ai"
    ],
    "isActive": true,
    "order": 3
  },
  {
    "_id": "6997e34b1a187c8ce3375095",
    "name": "Natural Language Processing",
    "categoryId": "6997e34b1a187c8ce3375082",
    "description": "NLP techniques and applications",
    "icon": "💬",
    "difficulty": "advanced",
    "tags": [
      "nlp",
      "text",
      "ai"
    ],
    "isActive": true,
    "order": 4
  },
  {
    "_id": "6997e34b1a187c8ce3375096",
    "name": "Computer Vision",
    "categoryId": "6997e34b1a187c8ce3375082",
    "description": "Image and video processing with AI",
    "icon": "👁️",
    "difficulty": "advanced",
    "tags": [
      "cv",
      "image",
      "ai"
    ],
    "isActive": true,
    "order": 5
  },
  {
    "_id": "6997e34b1a187c8ce3375098",
    "name": "Network Security",
    "categoryId": "6997e34b1a187c8ce3375083",
    "description": "Securing networks and communications",
    "icon": "🌐",
    "difficulty": "intermediate",
    "tags": [
      "network",
      "security",
      "encryption"
    ],
    "isActive": true,
    "order": 1
  },
  {
    "_id": "6997e34b1a187c8ce3375099",
    "name": "Ethical Hacking",
    "categoryId": "6997e34b1a187c8ce3375083",
    "description": "Penetration testing and vulnerability assessment",
    "icon": "🎯",
    "difficulty": "advanced",
    "tags": [
      "hacking",
      "pentesting",
      "security"
    ],
    "isActive": true,
    "order": 2
  },
  {
    "_id": "6997e34b1a187c8ce337509a",
    "name": "Cryptography",
    "categoryId": "6997e34b1a187c8ce3375083",
    "description": "Encryption and cryptographic principles",
    "icon": "🔐",
    "difficulty": "advanced",
    "tags": [
      "encryption",
      "crypto",
      "security"
    ],
    "isActive": true,
    "order": 3
  },
  {
    "_id": "6997e34b1a187c8ce337509b",
    "name": "Web Security",
    "categoryId": "6997e34b1a187c8ce3375083",
    "description": "Securing web applications",
    "icon": "🛡️",
    "difficulty": "intermediate",
    "tags": [
      "web",
      "security",
      "xss"
    ],
    "isActive": true,
    "order": 4
  },
  {
    "_id": "6997e34b1a187c8ce337509d",
    "name": "React Native",
    "categoryId": "6997e34b1a187c8ce3375084",
    "description": "Cross-platform mobile development",
    "icon": "📱",
    "difficulty": "intermediate",
    "tags": [
      "mobile",
      "react",
      "cross-platform"
    ],
    "isActive": true,
    "order": 1
  },
  {
    "_id": "6997e34b1a187c8ce337509e",
    "name": "Flutter",
    "categoryId": "6997e34b1a187c8ce3375084",
    "description": "Google's UI toolkit for mobile apps",
    "icon": "🦋",
    "difficulty": "intermediate",
    "tags": [
      "mobile",
      "dart",
      "cross-platform"
    ],
    "isActive": true,
    "order": 2
  },
  {
    "_id": "6997e34b1a187c8ce337509f",
    "name": "iOS Development",
    "categoryId": "6997e34b1a187c8ce3375084",
    "description": "Native iOS app development",
    "icon": "🍎",
    "difficulty": "advanced",
    "tags": [
      "mobile",
      "ios",
      "swift"
    ],
    "isActive": true,
    "order": 3
  },
  {
    "_id": "6997e34b1a187c8ce33750a0",
    "name": "Android Development",
    "categoryId": "6997e34b1a187c8ce3375084",
    "description": "Native Android app development",
    "icon": "🤖",
    "difficulty": "advanced",
    "tags": [
      "mobile",
      "android",
      "kotlin"
    ],
    "isActive": true,
    "order": 4
  },
  {
    "_id": "6997e34b1a187c8ce33750a3",
    "name": "Docker",
    "categoryId": "6997e34b1a187c8ce3375085",
    "description": "Containerization platform",
    "icon": "🐳",
    "difficulty": "intermediate",
    "tags": [
      "devops",
      "containers",
      "deployment"
    ],
    "isActive": true,
    "order": 1
  },
  {
    "_id": "6997e34b1a187c8ce33750a4",
    "name": "Kubernetes",
    "categoryId": "6997e34b1a187c8ce3375085",
    "description": "Container orchestration system",
    "icon": "☸️",
    "difficulty": "advanced",
    "tags": [
      "devops",
      "orchestration",
      "cloud"
    ],
    "isActive": true,
    "order": 2
  },
  {
    "_id": "6997e34b1a187c8ce33750a5",
    "name": "AWS",
    "categoryId": "6997e34b1a187c8ce3375085",
    "description": "Amazon Web Services cloud platform",
    "icon": "☁️",
    "difficulty": "intermediate",
    "tags": [
      "cloud",
      "aws",
      "infrastructure"
    ],
    "isActive": true,
    "order": 3
  },
  {
    "_id": "6997e34b1a187c8ce33750a6",
    "name": "CI/CD",
    "categoryId": "6997e34b1a187c8ce3375085",
    "description": "Continuous Integration and Deployment",
    "icon": "🔄",
    "difficulty": "intermediate",
    "tags": [
      "devops",
      "automation",
      "pipeline"
    ],
    "isActive": true,
    "order": 4
  },
  {
    "_id": "6997e34b1a187c8ce33750a7",
    "name": "Linux",
    "categoryId": "6997e34b1a187c8ce3375085",
    "description": "Linux system administration",
    "icon": "🐧",
    "difficulty": "intermediate",
    "tags": [
      "os",
      "linux",
      "server"
    ],
    "isActive": true,
    "order": 5
  },
  {
    "_id": "6997e34b1a187c8ce33750a9",
    "name": "Data Analysis",
    "categoryId": "6997e34b1a187c8ce3375086",
    "description": "Analyzing and interpreting data",
    "icon": "📈",
    "difficulty": "intermediate",
    "tags": [
      "data",
      "analysis",
      "statistics"
    ],
    "isActive": true,
    "order": 1
  },
  {
    "_id": "6997e34b1a187c8ce33750aa",
    "name": "Data Visualization",
    "categoryId": "6997e34b1a187c8ce3375086",
    "description": "Creating visual representations of data",
    "icon": "📊",
    "difficulty": "beginner",
    "tags": [
      "data",
      "visualization",
      "charts"
    ],
    "isActive": true,
    "order": 2
  },
  {
    "_id": "6997e34b1a187c8ce33750ab",
    "name": "Statistics",
    "categoryId": "6997e34b1a187c8ce3375086",
    "description": "Statistical methods and analysis",
    "icon": "📉",
    "difficulty": "intermediate",
    "tags": [
      "stats",
      "mathematics",
      "analysis"
    ],
    "isActive": true,
    "order": 3
  },
  {
    "_id": "6997e34b1a187c8ce33750ac",
    "name": "Big Data",
    "categoryId": "6997e34b1a187c8ce3375086",
    "description": "Processing and analyzing large datasets",
    "icon": "💾",
    "difficulty": "advanced",
    "tags": [
      "bigdata",
      "hadoop",
      "spark"
    ],
    "isActive": true,
    "order": 4
  }
];
