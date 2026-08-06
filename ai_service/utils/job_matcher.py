"""
Reads a job posting against the curriculum.

The product already knew how to parse a job description — the ATS check does it
to score a CV — but it only ever used that to say "add this word to your
resume". This aims the same question at the plan instead: given this posting,
which track is it, what does it want, what is missing, and how long is that.

Matching runs from the curriculum outwards rather than extracting skills from
the text and hoping they line up. The 54 skills are known; a posting is
unbounded prose. Asking "does this posting mention Express.js" is answerable.
Asking "what skills does this posting contain" is not, and the extract-then-
fuzzy-match route mistakes 'React' for 'REST API Design' at a 0.7 threshold.
"""

import re
from typing import Dict, List, Optional

from data.role_templates import ROLE_TEMPLATES, CANONICAL_ROLES

# Words that carry no signal on their own. "Basics" appears in nine skill
# names; a posting containing the word basics means nothing.
FILLER = {
    "basics", "fundamentals", "development", "design", "engineering",
    "modern", "advanced", "introduction", "intro", "and", "the", "for",
    "with", "using", "app", "architecture", "workflows", "pipelines",
    "integration", "management", "state", "top",
}

# What postings actually write, where it differs from the curriculum's name.
# Only entries that a posting would plausibly use and the derived aliases would
# otherwise miss.
EXTRA_ALIASES = {
    "MongoDB & Mongoose": ["mongo", "mongodb", "mongoose", "nosql"],
    "Node.js Basics": ["node", "nodejs", "node.js"],
    "Express.js": ["express", "expressjs", "express.js"],
    "React Basics": ["react", "reactjs", "react.js"],
    "React Hooks & State Management": ["hooks", "redux", "zustand", "context api"],
    "REST API Design": ["rest", "restful", "api design", "web api"],
    "JWT Authentication": ["jwt", "auth", "authentication", "oauth"],
    "ES6+ & Modern JS": ["es6", "es2015", "esnext", "javascript"],
    "Async JS (Promises, async/await)": ["async", "promises", "async/await"],
    "HTML & CSS Basics": ["html", "css", "tailwind", "scss", "sass"],
    "SQL Fundamentals": ["sql", "postgres", "postgresql", "mysql", "queries"],
    "NumPy & Pandas": ["numpy", "pandas", "dataframe"],
    "Deep Learning (PyTorch/TensorFlow)": ["pytorch", "tensorflow", "keras", "deep learning", "neural network"],
    "ML Fundamentals (Scikit-learn)": ["scikit-learn", "sklearn", "machine learning", "ml"],
    "Machine Learning Fundamentals": ["scikit-learn", "sklearn", "machine learning", "ml"],
    "LLMs & Prompt Engineering": ["llm", "llms", "prompt engineering", "gpt", "openai", "rag"],
    "NLP Basics": ["nlp", "natural language"],
    "MLOps Basics": ["mlops", "model serving"],
    "Docker Fundamentals": ["docker", "container", "containers", "containerisation", "containerization"],
    "Kubernetes Basics": ["kubernetes", "k8s"],
    "CI/CD Pipelines": ["ci/cd", "cicd", "continuous integration", "continuous delivery", "jenkins", "github actions"],
    "Infrastructure as Code (Terraform)": ["terraform", "iac", "infrastructure as code", "pulumi", "cloudformation"],
    "Cloud Fundamentals (AWS/Azure/GCP)": ["aws", "azure", "gcp", "cloud"],
    "Linux & Shell Scripting": ["linux", "bash", "shell", "unix"],
    "Linux Basics": ["linux", "unix"],
    "Git & GitHub Workflows": ["git", "github", "gitlab", "version control"],
    "Monitoring & Observability": ["monitoring", "observability", "prometheus", "grafana", "datadog"],
    "Android Development (Kotlin)": ["android", "kotlin", "jetpack"],
    "iOS Development (Swift)": ["ios", "swift", "swiftui"],
    "Cross-Platform Development (React Native/Flutter)": ["react native", "flutter", "dart", "cross-platform"],
    "Web Security (OWASP Top 10)": ["owasp", "web security", "xss", "sql injection"],
    "Ethical Hacking & Penetration Testing": ["penetration testing", "pentest", "pen testing", "ethical hacking"],
    "Cryptography Basics": ["cryptography", "encryption", "tls", "pki"],
    "Networking Fundamentals": ["networking", "tcp/ip", "dns", "http"],
    "SIEM & Incident Response": ["siem", "incident response", "splunk", "soc"],
    "Python Basics": ["python"],
    "Python for Data Science": ["python"],
    "Python for Security": ["python"],
    "Data Visualization": ["visualization", "visualisation", "matplotlib", "seaborn", "tableau", "power bi"],
    "Statistics & Probability": ["statistics", "statistical", "probability", "a/b test"],
    "Feature Engineering & Model Evaluation": ["feature engineering", "model evaluation", "cross validation"],
    "Model Deployment Basics": ["model deployment", "inference", "serving"],
    "Deployment (Vercel + Render)": ["vercel", "render", "netlify", "deployment", "deploy"],
    "React Router": ["react router", "routing"],
    "Full Stack Integration": ["full stack", "fullstack", "full-stack"],
    "Programming Fundamentals": ["programming"],
    "OOP & App Architecture": ["oop", "object oriented", "object-oriented", "mvvm", "mvc"],
    "Mobile UI/UX Basics": ["ui/ux", "mobile ui"],
    "API Integration & State Management": ["api integration", "state management"],
    "Testing & App Deployment": ["testing", "unit test", "espresso", "xctest"],
}


def _derive_aliases(skill: str) -> List[str]:
    """
    Terms that mean this skill, read out of its own name.

    The parentheticals are the useful part: "Cloud Fundamentals (AWS/Azure/GCP)"
    names the three things a posting will actually say, and "ML Fundamentals
    (Scikit-learn)" names the library rather than the concept.
    """
    aliases = set()

    inner = re.findall(r"\(([^)]*)\)", skill)
    outer = re.sub(r"\([^)]*\)", " ", skill)

    for chunk in inner:
        for part in re.split(r"[/,+]| or ", chunk):
            part = part.strip().lower()
            if part and part not in FILLER:
                aliases.add(part)

    for part in re.split(r"[&/,+]", outer):
        part = part.strip().lower()
        if not part:
            continue
        words = [w for w in re.split(r"\s+", part) if w and w not in FILLER]
        if words:
            aliases.add(" ".join(words))

    aliases.update(a.lower() for a in EXTRA_ALIASES.get(skill, []))
    return sorted(a for a in aliases if len(a) > 1)


def _mentions(text_lower: str, alias: str) -> bool:
    """
    Whole-token match, so "r" does not fire on every word containing it and
    "go" does not fire on "going". Punctuation in an alias is escaped, and the
    boundaries allow for the dots and slashes real technology names carry.
    """
    pattern = r"(?<![a-z0-9+#.])" + re.escape(alias) + r"(?![a-z0-9+#])"
    return re.search(pattern, text_lower) is not None


def skill_aliases() -> Dict[str, List[str]]:
    """Every curriculum skill mapped to the terms that mean it."""
    seen = {}
    for template in ROLE_TEMPLATES.values():
        for skill in template.get("skills", {}):
            if skill not in seen:
                seen[skill] = _derive_aliases(skill)
    return seen


def match_role(job_text: str) -> List[Dict]:
    """
    How well each track fits the posting, best first.

    Scored as the share of the track's own skills the posting mentions, not the
    raw count — otherwise MERN wins everything by having fourteen skills to
    Cybersecurity's seven.
    """
    text = (job_text or "").lower()
    aliases = skill_aliases()
    results = []

    # Only the six canonical roles. ROLE_TEMPLATES also holds twelve alternate
    # spellings pointing at the same objects, and reporting one of those would
    # name a role the rest of the system does not recognise — an earlier
    # version of this picked "Web Development" over "MERN Developer".
    for role in CANONICAL_ROLES:
        skills = tuple(sorted(ROLE_TEMPLATES[role].get("skills", {})))
        matched = [s for s in skills if any(_mentions(text, a) for a in aliases.get(s, []))]
        results.append({
            "role": role,
            "matched_skills": matched,
            "total_skills": len(skills),
            "coverage": round(len(matched) / len(skills), 3) if skills else 0.0,
        })

    results.sort(key=lambda r: (r["coverage"], len(r["matched_skills"])), reverse=True)
    return results


def analyse_job(
    job_text: str,
    known_skills: Optional[List[str]] = None,
    hours_per_week: int = 10,
    experience_level: str = "beginner",
    role_hint: Optional[str] = None,
) -> Dict:
    """
    What this posting wants, what is missing, and how long that is.

    `known_skills` is what the learner already has — from their profile and
    from assessments they have passed. Those are reported as already held
    rather than scheduled, which is the difference between a plan for this job
    and the whole track again.
    """
    from utils.time_allocator import estimate_skill_hours

    ranked = match_role(job_text)
    chosen = next((r for r in ranked if r["role"] == role_hint), None) or (ranked[0] if ranked else None)

    if not chosen or not chosen["matched_skills"]:
        return {
            "matched_role": None,
            "confidence": 0.0,
            "ranked_roles": ranked[:3],
            "required": [], "already_have": [], "missing": [],
            "hours_to_ready": 0, "weeks_to_ready": 0,
        }

    template = ROLE_TEMPLATES[chosen["role"]]["skills"]
    known = {k.strip().lower() for k in (known_skills or []) if k and k.strip()}

    required = chosen["matched_skills"]
    already_have = [s for s in required if s.lower() in known]
    missing = [s for s in required if s.lower() not in known]

    hours = sum(
        estimate_skill_hours(s, template.get(s, {}), experience_level, None)
        for s in missing
    )
    per_week = hours_per_week if hours_per_week and hours_per_week > 0 else 10

    return {
        "matched_role": chosen["role"],
        "confidence": chosen["coverage"],
        "ranked_roles": ranked[:3],
        "required": required,
        "already_have": already_have,
        "missing": missing,
        "hours_to_ready": round(hours, 1),
        # Rounded up: a plan that needs 10.5 weeks takes eleven.
        "weeks_to_ready": int(-(-hours // per_week)) if hours else 0,
    }
