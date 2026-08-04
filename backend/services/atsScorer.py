#!/usr/bin/env python3
"""
ATS resume scorer.

Reports four measured dimensions rather than one opaque number, and turns the
weak ones into specific fixes naming the terms that are actually missing.

Every figure here is computed from the two documents passed in. Nothing is
estimated, and when a dimension cannot be measured it is reported as such
instead of being filled in with a plausible-looking value.

Uses sentence-transformers for the semantic dimension when available and falls
back to keyword overlap when the dependency is missing.
"""

import json
import math
import re
import sys
from collections import Counter

try:
    from sentence_transformers import SentenceTransformer, util
except ImportError:
    SentenceTransformer = None
    util = None

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
    "he", "i", "if", "in", "into", "is", "it", "its", "me", "my", "of", "on",
    "or", "our", "over", "that", "than", "the", "their", "them", "then",
    "these", "they", "this", "those", "to", "under", "use", "used", "using",
    "was", "we", "were", "will", "with", "you", "your",
    # Job-posting boilerplate: present in every description, so matching it
    # says nothing about whether this resume fits this role.
    "ability", "able", "build", "candidate", "end", "experience", "hire",
    "have", "having", "hiring", "join", "looking", "must", "nice",
    "opportunity", "plus",
    "preferred", "required", "requirements", "role", "seeking", "skills",
    "strong", "team", "want", "well", "work", "working", "write", "years",
}

# Headings a parser looks for. Spelling variants matter more than completeness.
SECTION_PATTERNS = {
    "experience": r"\b(experience|employment|work history|professional background)\b",
    "education": r"\b(education|academic|qualifications)\b",
    "skills": r"\b(skills|technologies|technical proficienc|competenc)\b",
    "projects": r"\b(projects|portfolio|selected work)\b",
}

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
PHONE_RE = re.compile(r"(?:\+?\d[\d\s().-]{7,}\d)")
# A number that carries meaning: a count, a percentage, an amount, a multiple.
METRIC_RE = re.compile(
    r"\d+\s*%"                       # 40%
    r"|[$₹€£]\s*\d"                   # $12k
    r"|\b\d+\s*\+"                   # 10+
    r"|\b\d[\d,.]*\s*(?:x|k|m|bn)\b"  # 3x, 12k
    r"|\b\d+\b",                     # any plain count — "18 screens"
    re.I,
)
# A bare four-digit year is a date, not a result, so it does not count as one.
YEAR_ONLY_RE = re.compile(r"^(19|20)\d{2}$")

model = None


def get_model():
    global model

    if SentenceTransformer is None:
        return None

    if model is None:
        model = SentenceTransformer(MODEL_NAME)

    return model


def tokenize(text):
    """
    Words, keeping the punctuation that belongs to a name and dropping the
    punctuation that belongs to the sentence.

    "Node.js" and "C++" have to survive intact, but "MongoDB." at the end of a
    sentence is the same term as "MongoDB" — treating them as different is what
    made a resume that clearly said MongoDB score as missing it.
    """
    tokens = []
    for raw in re.findall(r"[a-zA-Z][a-zA-Z0-9+#.-]*", (text or "").lower()):
        token = raw.rstrip(".-")
        if len(token) > 1 and token not in STOP_WORDS:
            tokens.append(token)
    return tokens


def cosine_similarity_from_tokens(resume_text, job_description):
    resume_counts = Counter(tokenize(resume_text))
    job_counts = Counter(tokenize(job_description))

    if not resume_counts or not job_counts:
        return 0.0

    common_tokens = set(resume_counts) & set(job_counts)
    dot_product = sum(resume_counts[token] * job_counts[token] for token in common_tokens)
    resume_norm = math.sqrt(sum(value * value for value in resume_counts.values()))
    job_norm = math.sqrt(sum(value * value for value in job_counts.values()))

    if resume_norm == 0 or job_norm == 0:
        return 0.0

    return dot_product / (resume_norm * job_norm)


def semantic_similarity(resume_text, job_description):
    """Cosine similarity of sentence embeddings, or keyword overlap without them."""
    sentence_model = get_model()

    if sentence_model is not None and util is not None:
        resume_embedding = sentence_model.encode(resume_text, convert_to_tensor=True)
        job_embedding = sentence_model.encode(job_description, convert_to_tensor=True)
        similarity = float(util.cos_sim(resume_embedding, job_embedding)[0][0])
        return similarity, "sentence_transformers"

    return cosine_similarity_from_tokens(resume_text, job_description), "keyword_overlap"


def keyword_analysis(resume_text, job_description, limit=25):
    """
    Which of the job description's own vocabulary the resume actually uses.

    Terms are ranked by how often the posting repeats them: a word the employer
    wrote five times matters more than one they wrote once. Only the top slice
    is scored, so a long posting does not dilute the measure to nothing.
    """
    job_counts = Counter(tokenize(job_description))
    resume_tokens = set(tokenize(resume_text))

    if not job_counts:
        return {"score": None, "matched": [], "missing": [], "considered": 0}

    ranked = [term for term, _ in job_counts.most_common(limit)]
    matched = [term for term in ranked if term in resume_tokens]
    missing = [term for term in ranked if term not in resume_tokens]

    return {
        "score": round(len(matched) / len(ranked) * 100, 1),
        # Ordered by how heavily the posting leans on them, so the first few
        # missing terms are the ones worth adding first.
        "matched": matched,
        "missing": missing,
        "considered": len(ranked),
    }


def parseability_analysis(resume_text):
    """
    Whether a machine can take this document apart.

    Each check is something an applicant tracking system genuinely relies on,
    and each failure names itself so the fix list can quote it back.
    """
    lowered = resume_text.lower()
    words = resume_text.split()

    checks = []
    checks.append(("a contact email", bool(EMAIL_RE.search(resume_text))))
    checks.append(("a phone number", bool(PHONE_RE.search(resume_text))))

    for name, pattern in SECTION_PATTERNS.items():
        checks.append((f"an {name} section" if name == "experience" else f"a {name} section",
                       bool(re.search(pattern, lowered))))

    # Under ~200 words a parser has almost nothing to index; over ~1200 the
    # document is usually a wall of text rather than a resume.
    checks.append(("a workable length", 200 <= len(words) <= 1200))

    passed = [label for label, ok in checks if ok]
    failed = [label for label, ok in checks if not ok]

    return {
        "score": round(len(passed) / len(checks) * 100, 1),
        "passed": passed,
        "missing": failed,
        "word_count": len(words),
    }


BULLET_PREFIX_RE = re.compile(r"^\s*[•\-–—*·]\s+")


def is_achievement_line(line):
    """
    Whether a line is a claim about work done, rather than furniture.

    Without this the name line and the comma-separated skills row counted as
    statements, so the advice came back telling people to put a number on their
    own name.
    """
    words = line.split()
    if len(words) < 5:
        return False
    if EMAIL_RE.search(line) or PHONE_RE.search(line):
        return False
    # A heading, on its own line.
    if any(re.fullmatch(pattern, line.lower().strip(" :"), re.I) for pattern in SECTION_PATTERNS.values()):
        return False
    # "Skills: React, Node, Express, Mongo" — a list, not a claim.
    if line.count(",") >= 3 and not re.search(r"\b(built|led|shipped|designed|wrote|ran|cut|grew|reduced|improved|delivered|owned|migrated)\b", line, re.I):
        return False
    return True


def bullet_lines(resume_text):
    """
    The achievement statements in a resume.

    When the document uses bullets, those are the statements and nothing else
    is — that is the most reliable signal available. Only when it does not is
    every qualifying line considered.
    """
    raw_lines = resume_text.splitlines()
    bulleted = [BULLET_PREFIX_RE.sub("", line).strip() for line in raw_lines if BULLET_PREFIX_RE.match(line)]

    if len(bulleted) >= 3:
        return [line for line in bulleted if len(line.split()) >= 5]

    return [line.strip() for line in raw_lines if is_achievement_line(line.strip())]


def impact_analysis(resume_text):
    """How much of the resume states a result rather than a responsibility."""
    lines = bullet_lines(resume_text)

    if not lines:
        return {"score": None, "quantified": 0, "total": 0, "examples": []}

    def has_metric(line):
        match = METRIC_RE.search(line)
        # A line whose only number is a bare year is a date, not a result.
        return bool(match) and not YEAR_ONLY_RE.fullmatch(match.group(0).strip())

    quantified = [line for line in lines if has_metric(line)]
    unquantified = [line for line in lines if not has_metric(line)]

    return {
        "score": round(len(quantified) / len(lines) * 100, 1),
        "quantified": len(quantified),
        "total": len(lines),
        # Shown back to the user so the advice points at their own sentences.
        "examples": [line[:140] for line in unquantified[:3]],
    }


def band(score):
    if score >= 80:
        return "Excellent Match"
    if score >= 60:
        return "Good Match"
    if score >= 40:
        return "Average Match"
    return "Poor Match"


def build_fixes(keywords, parseability, impact):
    """
    Turn the weak dimensions into specific, checkable actions.

    The point value on each is the score this resume would gain if that one
    dimension reached full marks, rounded — it is arithmetic on the weights
    below, not a guess. Fixes worth less than a point are dropped rather than
    listed as busywork.
    """
    fixes = []

    if keywords["score"] is not None and keywords["missing"]:
        headline = ", ".join(keywords["missing"][:6])
        gain = (100 - keywords["score"]) * WEIGHTS["keywords"]
        fixes.append({
            "id": "keywords",
            "title": "Use the words the posting uses",
            "detail": (
                f"{len(keywords['missing'])} of the {keywords['considered']} terms this posting "
                f"leans on are missing from your resume: {headline}"
                + ("…" if len(keywords["missing"]) > 6 else ".")
            ),
            "points": round(gain),
        })

    if impact["score"] is not None and impact["total"] and impact["score"] < 100:
        gap = impact["total"] - impact["quantified"]
        gain = (100 - impact["score"]) * WEIGHTS["impact"]
        fixes.append({
            "id": "impact",
            "title": "Put numbers on what you did",
            "detail": (
                f"{gap} of your {impact['total']} statement{'' if impact['total'] == 1 else 's'} "
                f"describe{'s' if gap == 1 else ''} a responsibility without a result. Add a count, "
                "a percentage or a duration to each."
            ),
            "points": round(gain),
            "examples": impact["examples"],
        })

    structural = [item for item in parseability["missing"] if item != "a workable length"]
    if structural:
        gain = (100 - parseability["score"]) * WEIGHTS["parseability"]
        fixes.append({
            "id": "parseability",
            "title": "Give the parser what it looks for",
            "detail": "Your resume is missing " + ", ".join(structural) + ".",
            "points": round(gain),
        })

    if parseability["word_count"] < 200:
        fixes.append({
            "id": "length-short",
            "title": "There is not enough here to score",
            "detail": (
                f"{parseability['word_count']} words is too short for a parser to index. Most "
                "resumes that clear an ATS run to 400–700."
            ),
            "points": 0,
        })
    elif parseability["word_count"] > 1200:
        fixes.append({
            "id": "length-long",
            "title": "Cut it back",
            "detail": (
                f"{parseability['word_count']} words is long enough that the relevant lines get "
                "buried. Most resumes that clear an ATS run to 400–700."
            ),
            "points": 0,
        })

    return [fix for fix in fixes if fix["points"] > 0 or fix["id"].startswith("length")]


# How much each dimension moves the headline score. Semantic similarity carries
# the most because it is the only one that reads meaning rather than counting
# tokens; parseability carries the least because passing it is table stakes
# rather than evidence of fit.
WEIGHTS = {
    "semantic": 0.40,
    "keywords": 0.30,
    "impact": 0.20,
    "parseability": 0.10,
}


def calculate_ats_score(resume_text, job_description):
    try:
        similarity, method = semantic_similarity(resume_text, job_description)
        semantic_score = max(0.0, min(100.0, float(similarity) * 100))

        keywords = keyword_analysis(resume_text, job_description)
        parseability = parseability_analysis(resume_text)
        impact = impact_analysis(resume_text)

        dimensions = [
            {"key": "semantic", "label": "Overall relevance", "score": round(semantic_score, 1)},
            {"key": "keywords", "label": "Keyword match", "score": keywords["score"]},
            {"key": "impact", "label": "Quantified impact", "score": impact["score"]},
            {"key": "parseability", "label": "Parseability", "score": parseability["score"]},
        ]

        # A dimension with nothing to measure is dropped from the blend rather
        # than counted as zero, and its weight is redistributed.
        measured = [d for d in dimensions if d["score"] is not None]
        total_weight = sum(WEIGHTS[d["key"]] for d in measured) or 1.0
        score = sum(d["score"] * WEIGHTS[d["key"]] for d in measured) / total_weight

        return {
            "success": True,
            "score": round(score, 2),
            "status": band(score),
            "similarity": round(float(similarity), 4),
            "method": method,
            "message": f"Your resume scores {round(score)} out of 100 against this job description",
            "dimensions": dimensions,
            "fixes": build_fixes(keywords, parseability, impact),
            "details": {
                "keywordsMatched": keywords["matched"][:12],
                "keywordsMissing": keywords["missing"][:12],
                "keywordsConsidered": keywords["considered"],
                "sectionsFound": parseability["passed"],
                "sectionsMissing": parseability["missing"],
                "wordCount": parseability["word_count"],
                "statementsQuantified": impact["quantified"],
                "statementsTotal": impact["total"],
            },
        }
    except Exception as error:
        return {
            "success": False,
            "error": str(error),
            "message": "Failed to analyze resume",
        }


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "error": "Resume text and job description are required",
        }))
        sys.exit(1)

    resume_text = sys.argv[1]
    job_description = sys.argv[2]
    result = calculate_ats_score(resume_text, job_description)
    print(json.dumps(result, indent=2))
