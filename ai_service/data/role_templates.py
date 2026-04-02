"""
Role templates: defines required skills, dependencies, difficulty,
base hours to learn, and categories for each career path.
"""

ROLE_TEMPLATES = {
    "MERN Developer": {
        "skills": {
            "HTML & CSS Basics": {
                "category": "Frontend",
                "difficulty": "beginner",
                "base_hours": 20,
                "dependencies": [],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "MDN HTML Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML"},
                    {"type": "docs", "title": "MDN CSS Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS"},
                ],
                "mini_project": "Build a personal portfolio static page",
            },
            "JavaScript Basics": {
                "category": "Language",
                "difficulty": "beginner",
                "base_hours": 30,
                "dependencies": ["HTML & CSS Basics"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "javascript.info", "url": "https://javascript.info"},
                ],
                "mini_project": "Build a quiz app using vanilla JS",
            },
            "ES6+ & Modern JS": {
                "category": "Language",
                "difficulty": "intermediate",
                "base_hours": 20,
                "dependencies": ["JavaScript Basics"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "ES6 Features", "url": "https://es6-features.org"},
                ],
                "mini_project": "Refactor quiz app using ES6 modules",
            },
            "Async JS (Promises, async/await)": {
                "category": "Language",
                "difficulty": "intermediate",
                "base_hours": 15,
                "dependencies": ["ES6+ & Modern JS"],
                "priority_weight": 9,
                "resources": [
                    {"type": "article", "title": "Async JS Deep Dive", "url": "https://javascript.info/async"},
                ],
                "mini_project": "Fetch and display GitHub user data",
            },
            "React Basics": {
                "category": "Frontend Framework",
                "difficulty": "intermediate",
                "base_hours": 35,
                "dependencies": ["Async JS (Promises, async/await)"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "React Official Docs", "url": "https://react.dev"},
                ],
                "mini_project": "Build a To-Do app in React",
            },
            "React Hooks & State Management": {
                "category": "Frontend Framework",
                "difficulty": "intermediate",
                "base_hours": 25,
                "dependencies": ["React Basics"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "React Hooks", "url": "https://react.dev/reference/react"},
                ],
                "mini_project": "Build a shopping cart with useContext",
            },
            "React Router": {
                "category": "Frontend Framework",
                "difficulty": "intermediate",
                "base_hours": 10,
                "dependencies": ["React Hooks & State Management"],
                "priority_weight": 8,
                "resources": [
                    {"type": "docs", "title": "React Router v6", "url": "https://reactrouter.com/en/main"},
                ],
                "mini_project": "Add multi-page routing to shopping cart app",
            },
            "Node.js Basics": {
                "category": "Backend",
                "difficulty": "beginner",
                "base_hours": 20,
                "dependencies": ["JavaScript Basics"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "Node.js Docs", "url": "https://nodejs.org/en/docs"},
                ],
                "mini_project": "Build a simple CLI tool",
            },
            "Express.js": {
                "category": "Backend",
                "difficulty": "intermediate",
                "base_hours": 25,
                "dependencies": ["Node.js Basics"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "Express.js Guide", "url": "https://expressjs.com/en/guide/routing.html"},
                ],
                "mini_project": "Build REST API for a blog",
            },
            "MongoDB & Mongoose": {
                "category": "Database",
                "difficulty": "intermediate",
                "base_hours": 25,
                "dependencies": ["Express.js"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "Mongoose Docs", "url": "https://mongoosejs.com/docs"},
                ],
                "mini_project": "Add MongoDB persistence to blog REST API",
            },
            "REST API Design": {
                "category": "Backend",
                "difficulty": "intermediate",
                "base_hours": 15,
                "dependencies": ["MongoDB & Mongoose"],
                "priority_weight": 8,
                "resources": [
                    {"type": "article", "title": "REST API Best Practices", "url": "https://restfulapi.net"},
                ],
                "mini_project": "Design and document a full CRUD API",
            },
            "JWT Authentication": {
                "category": "Security",
                "difficulty": "intermediate",
                "base_hours": 15,
                "dependencies": ["REST API Design"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "JWT Introduction", "url": "https://jwt.io/introduction"},
                ],
                "mini_project": "Add auth to blog API with protected routes",
            },
            "Full Stack Integration": {
                "category": "Integration",
                "difficulty": "advanced",
                "base_hours": 30,
                "dependencies": ["React Router", "JWT Authentication"],
                "priority_weight": 10,
                "resources": [],
                "mini_project": "Build a full-stack MERN blog with auth",
            },
            "Deployment (Vercel + Render)": {
                "category": "DevOps",
                "difficulty": "intermediate",
                "base_hours": 10,
                "dependencies": ["Full Stack Integration"],
                "priority_weight": 7,
                "resources": [
                    {"type": "docs", "title": "Render Deploy Guide", "url": "https://render.com/docs"},
                ],
                "mini_project": "Deploy MERN blog app live",
            },
        }
    },

    "AI/ML Engineer": {
        "skills": {
            "Python Basics": {
                "category": "Language",
                "difficulty": "beginner",
                "base_hours": 25,
                "dependencies": [],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "Python Official Tutorial", "url": "https://docs.python.org/3/tutorial"},
                ],
                "mini_project": "Build a number guessing game",
            },
            "NumPy & Pandas": {
                "category": "Data Processing",
                "difficulty": "beginner",
                "base_hours": 25,
                "dependencies": ["Python Basics"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "NumPy Quickstart", "url": "https://numpy.org/doc/stable/user/quickstart.html"},
                    {"type": "docs", "title": "Pandas User Guide", "url": "https://pandas.pydata.org/docs/user_guide"},
                ],
                "mini_project": "Analyze a Kaggle CSV dataset",
            },
            "Data Visualization": {
                "category": "Data Processing",
                "difficulty": "beginner",
                "base_hours": 15,
                "dependencies": ["NumPy & Pandas"],
                "priority_weight": 8,
                "resources": [
                    {"type": "docs", "title": "Matplotlib Docs", "url": "https://matplotlib.org/stable/tutorials"},
                ],
                "mini_project": "Visualize dataset insights with charts",
            },
            "Statistics & Probability": {
                "category": "Mathematics",
                "difficulty": "intermediate",
                "base_hours": 20,
                "dependencies": ["NumPy & Pandas"],
                "priority_weight": 9,
                "resources": [
                    {"type": "article", "title": "Statistics for ML", "url": "https://towardsdatascience.com/statistics-for-machine-learning"},
                ],
                "mini_project": "Hypothesis testing on real dataset",
            },
            "ML Fundamentals (Scikit-learn)": {
                "category": "Machine Learning",
                "difficulty": "intermediate",
                "base_hours": 35,
                "dependencies": ["Statistics & Probability"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html"},
                ],
                "mini_project": "Build a house price prediction model",
            },
            "Deep Learning (PyTorch/TensorFlow)": {
                "category": "Deep Learning",
                "difficulty": "advanced",
                "base_hours": 45,
                "dependencies": ["ML Fundamentals (Scikit-learn)"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "PyTorch Tutorials", "url": "https://pytorch.org/tutorials"},
                ],
                "mini_project": "Build an image classifier with CNN",
            },
            "NLP Basics": {
                "category": "NLP",
                "difficulty": "advanced",
                "base_hours": 30,
                "dependencies": ["Deep Learning (PyTorch/TensorFlow)"],
                "priority_weight": 8,
                "resources": [
                    {"type": "docs", "title": "Hugging Face NLP Course", "url": "https://huggingface.co/learn/nlp-course"},
                ],
                "mini_project": "Build a sentiment analysis classifier",
            },
            "LLMs & Prompt Engineering": {
                "category": "Generative AI",
                "difficulty": "advanced",
                "base_hours": 25,
                "dependencies": ["NLP Basics"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "OpenAI API Docs", "url": "https://platform.openai.com/docs"},
                ],
                "mini_project": "Build a RAG-based Q&A chatbot",
            },
            "MLOps Basics": {
                "category": "DevOps",
                "difficulty": "intermediate",
                "base_hours": 20,
                "dependencies": ["ML Fundamentals (Scikit-learn)"],
                "priority_weight": 7,
                "resources": [
                    {"type": "docs", "title": "MLflow Docs", "url": "https://mlflow.org/docs/latest/index.html"},
                ],
                "mini_project": "Track and version ML experiments with MLflow",
            },
        }
    },

    "Cybersecurity Engineer": {
        "skills": {
            "Networking Fundamentals": {
                "category": "Networking",
                "difficulty": "beginner",
                "base_hours": 25,
                "dependencies": [],
                "priority_weight": 10,
                "resources": [
                    {"type": "article", "title": "Computer Networking - A Top Down Approach summary", "url": "https://gaia.cs.umass.edu/kurose_ross/index.html"},
                ],
                "mini_project": "Configure a simulated home network in Packet Tracer",
            },
            "Linux Basics": {
                "category": "OS",
                "difficulty": "beginner",
                "base_hours": 20,
                "dependencies": [],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "Linux Command Line Basics", "url": "https://linuxcommand.org/tlcl.php"},
                ],
                "mini_project": "Automate a system task with bash script",
            },
            "Python for Security": {
                "category": "Language",
                "difficulty": "beginner",
                "base_hours": 20,
                "dependencies": ["Linux Basics"],
                "priority_weight": 9,
                "resources": [],
                "mini_project": "Build a port scanner in Python",
            },
            "Cryptography Basics": {
                "category": "Core Security",
                "difficulty": "intermediate",
                "base_hours": 20,
                "dependencies": ["Networking Fundamentals"],
                "priority_weight": 9,
                "resources": [
                    {"type": "article", "title": "Cryptography Basics", "url": "https://www.cloudflare.com/learning/ssl/what-is-cryptography"},
                ],
                "mini_project": "Implement basic encryption/decryption in Python",
            },
            "Web Security (OWASP Top 10)": {
                "category": "Web Security",
                "difficulty": "intermediate",
                "base_hours": 30,
                "dependencies": ["Cryptography Basics"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "OWASP Top 10", "url": "https://owasp.org/www-project-top-ten"},
                ],
                "mini_project": "Pen-test a deliberately vulnerable web app (DVWA)",
            },
            "Ethical Hacking & Penetration Testing": {
                "category": "Offensive Security",
                "difficulty": "advanced",
                "base_hours": 40,
                "dependencies": ["Web Security (OWASP Top 10)", "Python for Security"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "TryHackMe Learning Paths", "url": "https://tryhackme.com"},
                ],
                "mini_project": "Complete a TryHackMe CTF room",
            },
            "SIEM & Incident Response": {
                "category": "Defensive Security",
                "difficulty": "advanced",
                "base_hours": 30,
                "dependencies": ["Ethical Hacking & Penetration Testing"],
                "priority_weight": 8,
                "resources": [],
                "mini_project": "Analyze logs and write an incident response report",
            },
        }
    },

    "Data Science Engineer": {
        "skills": {
            "Python for Data Science": {
                "category": "Language",
                "difficulty": "beginner",
                "base_hours": 20,
                "dependencies": [],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "Python Official Tutorial", "url": "https://docs.python.org/3/tutorial"},
                ],
                "mini_project": "Build a data cleaning script for CSV files",
            },
            "SQL Fundamentals": {
                "category": "Database",
                "difficulty": "beginner",
                "base_hours": 20,
                "dependencies": [],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "PostgreSQL Tutorial", "url": "https://www.postgresql.org/docs/current/tutorial.html"},
                ],
                "mini_project": "Write analytical queries for a sales dataset",
            },
            "NumPy & Pandas": {
                "category": "Data Processing",
                "difficulty": "beginner",
                "base_hours": 25,
                "dependencies": ["Python for Data Science"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "NumPy Quickstart", "url": "https://numpy.org/doc/stable/user/quickstart.html"},
                    {"type": "docs", "title": "Pandas User Guide", "url": "https://pandas.pydata.org/docs/user_guide"},
                ],
                "mini_project": "Perform EDA on a real-world dataset",
            },
            "Data Visualization": {
                "category": "Data Processing",
                "difficulty": "intermediate",
                "base_hours": 18,
                "dependencies": ["NumPy & Pandas"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "Matplotlib Docs", "url": "https://matplotlib.org/stable/tutorials"},
                ],
                "mini_project": "Create a KPI dashboard notebook",
            },
            "Statistics & Probability": {
                "category": "Mathematics",
                "difficulty": "intermediate",
                "base_hours": 25,
                "dependencies": ["NumPy & Pandas"],
                "priority_weight": 9,
                "resources": [
                    {"type": "article", "title": "Statistics for ML", "url": "https://towardsdatascience.com/statistics-for-machine-learning"},
                ],
                "mini_project": "A/B testing analysis on sample experiment data",
            },
            "Machine Learning Fundamentals": {
                "category": "Machine Learning",
                "difficulty": "intermediate",
                "base_hours": 35,
                "dependencies": ["Statistics & Probability"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html"},
                ],
                "mini_project": "Build and compare 3 classification models",
            },
            "Feature Engineering & Model Evaluation": {
                "category": "Machine Learning",
                "difficulty": "intermediate",
                "base_hours": 22,
                "dependencies": ["Machine Learning Fundamentals"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "Scikit-learn Model Evaluation", "url": "https://scikit-learn.org/stable/modules/model_evaluation.html"},
                ],
                "mini_project": "Improve model performance with engineered features",
            },
            "Model Deployment Basics": {
                "category": "MLOps",
                "difficulty": "advanced",
                "base_hours": 20,
                "dependencies": ["Feature Engineering & Model Evaluation"],
                "priority_weight": 8,
                "resources": [
                    {"type": "docs", "title": "FastAPI Docs", "url": "https://fastapi.tiangolo.com"},
                ],
                "mini_project": "Deploy a prediction API with FastAPI",
            },
        }
    },

    "DevOps Engineer": {
        "skills": {
            "Linux & Shell Scripting": {
                "category": "OS",
                "difficulty": "beginner",
                "base_hours": 25,
                "dependencies": [],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "Linux Command Line Basics", "url": "https://linuxcommand.org/tlcl.php"},
                ],
                "mini_project": "Automate server setup tasks with bash",
            },
            "Git & GitHub Workflows": {
                "category": "Version Control",
                "difficulty": "beginner",
                "base_hours": 12,
                "dependencies": [],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "Pro Git Book", "url": "https://git-scm.com/book/en/v2"},
                ],
                "mini_project": "Set up branch-based CI workflow in a sample repo",
            },
            "Docker Fundamentals": {
                "category": "Containers",
                "difficulty": "intermediate",
                "base_hours": 22,
                "dependencies": ["Linux & Shell Scripting"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "Docker Docs", "url": "https://docs.docker.com"},
                ],
                "mini_project": "Containerize a Node + Python app",
            },
            "CI/CD Pipelines": {
                "category": "Automation",
                "difficulty": "intermediate",
                "base_hours": 20,
                "dependencies": ["Git & GitHub Workflows", "Docker Fundamentals"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "GitHub Actions Docs", "url": "https://docs.github.com/actions"},
                ],
                "mini_project": "Build CI pipeline with lint, test, and deploy stages",
            },
            "Cloud Fundamentals (AWS/Azure/GCP)": {
                "category": "Cloud",
                "difficulty": "intermediate",
                "base_hours": 25,
                "dependencies": ["Docker Fundamentals"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "AWS Training", "url": "https://aws.amazon.com/training"},
                ],
                "mini_project": "Deploy a multi-service app on cloud VM",
            },
            "Kubernetes Basics": {
                "category": "Containers",
                "difficulty": "advanced",
                "base_hours": 28,
                "dependencies": ["Docker Fundamentals", "Cloud Fundamentals (AWS/Azure/GCP)"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "Kubernetes Docs", "url": "https://kubernetes.io/docs/home"},
                ],
                "mini_project": "Deploy and scale an app on Kubernetes",
            },
            "Infrastructure as Code (Terraform)": {
                "category": "Automation",
                "difficulty": "advanced",
                "base_hours": 24,
                "dependencies": ["Cloud Fundamentals (AWS/Azure/GCP)"],
                "priority_weight": 8,
                "resources": [
                    {"type": "docs", "title": "Terraform Docs", "url": "https://developer.hashicorp.com/terraform/docs"},
                ],
                "mini_project": "Provision cloud infrastructure using Terraform",
            },
            "Monitoring & Observability": {
                "category": "Reliability",
                "difficulty": "advanced",
                "base_hours": 20,
                "dependencies": ["CI/CD Pipelines", "Kubernetes Basics"],
                "priority_weight": 8,
                "resources": [
                    {"type": "docs", "title": "Prometheus Docs", "url": "https://prometheus.io/docs"},
                ],
                "mini_project": "Set up metrics and alerts for production service",
            },
        }
    },

    "Mobile Developer": {
        "skills": {
            "Programming Fundamentals": {
                "category": "Language",
                "difficulty": "beginner",
                "base_hours": 20,
                "dependencies": [],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"},
                ],
                "mini_project": "Build utility apps and algorithm exercises",
            },
            "OOP & App Architecture": {
                "category": "Engineering",
                "difficulty": "intermediate",
                "base_hours": 18,
                "dependencies": ["Programming Fundamentals"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "Refactoring Guru Design Patterns", "url": "https://refactoring.guru/design-patterns"},
                ],
                "mini_project": "Design MVVM-based sample app architecture",
            },
            "Mobile UI/UX Basics": {
                "category": "Design",
                "difficulty": "beginner",
                "base_hours": 15,
                "dependencies": [],
                "priority_weight": 8,
                "resources": [
                    {"type": "docs", "title": "Material Design", "url": "https://m3.material.io"},
                ],
                "mini_project": "Create reusable UI component library for mobile",
            },
            "Android Development (Kotlin)": {
                "category": "Platform",
                "difficulty": "intermediate",
                "base_hours": 30,
                "dependencies": ["OOP & App Architecture"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "Android Developers", "url": "https://developer.android.com/docs"},
                ],
                "mini_project": "Build a notes app with local storage",
            },
            "iOS Development (Swift)": {
                "category": "Platform",
                "difficulty": "intermediate",
                "base_hours": 30,
                "dependencies": ["OOP & App Architecture"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "Apple Developer Documentation", "url": "https://developer.apple.com/documentation"},
                ],
                "mini_project": "Build a task manager app using SwiftUI",
            },
            "Cross-Platform Development (React Native/Flutter)": {
                "category": "Framework",
                "difficulty": "intermediate",
                "base_hours": 28,
                "dependencies": ["Programming Fundamentals", "Mobile UI/UX Basics"],
                "priority_weight": 10,
                "resources": [
                    {"type": "docs", "title": "React Native Docs", "url": "https://reactnative.dev/docs/getting-started"},
                ],
                "mini_project": "Ship a cross-platform weather app",
            },
            "API Integration & State Management": {
                "category": "Integration",
                "difficulty": "intermediate",
                "base_hours": 18,
                "dependencies": ["Cross-Platform Development (React Native/Flutter)"],
                "priority_weight": 9,
                "resources": [
                    {"type": "docs", "title": "REST API Best Practices", "url": "https://restfulapi.net"},
                ],
                "mini_project": "Integrate auth and data APIs in mobile app",
            },
            "Testing & App Deployment": {
                "category": "Release",
                "difficulty": "advanced",
                "base_hours": 16,
                "dependencies": ["API Integration & State Management"],
                "priority_weight": 8,
                "resources": [
                    {"type": "docs", "title": "Firebase App Distribution", "url": "https://firebase.google.com/docs/app-distribution"},
                ],
                "mini_project": "Publish app beta build to testers",
            },
        }
    },
}

# Aliases to support role names used across backend/profile/resume flows.
ROLE_TEMPLATES["MERN"] = ROLE_TEMPLATES["MERN Developer"]
ROLE_TEMPLATES["AI"] = ROLE_TEMPLATES["AI/ML Engineer"]
ROLE_TEMPLATES["Cyber"] = ROLE_TEMPLATES["Cybersecurity Engineer"]
ROLE_TEMPLATES["Data Science"] = ROLE_TEMPLATES["Data Science Engineer"]
ROLE_TEMPLATES["DevOps"] = ROLE_TEMPLATES["DevOps Engineer"]
ROLE_TEMPLATES["Mobile"] = ROLE_TEMPLATES["Mobile Developer"]
ROLE_TEMPLATES["Data Scientist"] = ROLE_TEMPLATES["Data Science Engineer"]
ROLE_TEMPLATES["Cybersecurity"] = ROLE_TEMPLATES["Cybersecurity Engineer"]
ROLE_TEMPLATES["Mobile Development"] = ROLE_TEMPLATES["Mobile Developer"]
ROLE_TEMPLATES["Cloud Computing"] = ROLE_TEMPLATES["DevOps Engineer"]
ROLE_TEMPLATES["Web Development"] = ROLE_TEMPLATES["MERN Developer"]
ROLE_TEMPLATES["Machine Learning"] = ROLE_TEMPLATES["AI/ML Engineer"]

# Difficulty multipliers for time estimation
DIFFICULTY_MULTIPLIER = {
    "beginner": 1.0,
    "intermediate": 1.3,
    "advanced": 1.6,
}

# Experience level adjustments (how much faster/slower they learn)
EXPERIENCE_ADJUSTMENT = {
    "beginner": 1.3,     # takes 30% longer
    "intermediate": 1.0,
    "advanced": 0.75,    # learns 25% faster
}