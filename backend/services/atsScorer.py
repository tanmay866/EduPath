#!/usr/bin/env python3
"""
ATS resume scorer.

Uses sentence-transformers when available and falls back to a lightweight
keyword-overlap scorer when the dependency is missing.
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
    "was", "we", "were", "will", "with", "you", "your"
}

model = None


def get_model():
    global model

    if SentenceTransformer is None:
        return None

    if model is None:
        model = SentenceTransformer(MODEL_NAME)

    return model


def tokenize(text):
    return [
        token
        for token in re.findall(r"[a-zA-Z][a-zA-Z0-9+#.-]*", (text or "").lower())
        if token not in STOP_WORDS and len(token) > 1
    ]


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


def build_result(similarity, method):
    score = max(0.0, min(100.0, float(similarity) * 100))

    if score >= 80:
        status = "Excellent Match"
    elif score >= 60:
        status = "Good Match"
    elif score >= 40:
        status = "Average Match"
    else:
        status = "Poor Match"

    return {
        "success": True,
        "score": round(score, 2),
        "status": status,
        "similarity": round(float(similarity), 4),
        "method": method,
        "message": f"Your resume has a {round(score, 2)}% match with the job description",
    }


def calculate_ats_score(resume_text, job_description):
    """
    Calculate ATS score using semantic similarity when available, otherwise
    fall back to keyword overlap.
    """
    try:
        sentence_model = get_model()

        if sentence_model is not None and util is not None:
            resume_embedding = sentence_model.encode(resume_text, convert_to_tensor=True)
            job_embedding = sentence_model.encode(job_description, convert_to_tensor=True)
            similarity = float(util.cos_sim(resume_embedding, job_embedding)[0][0])
            return build_result(similarity, "sentence_transformers")

        similarity = cosine_similarity_from_tokens(resume_text, job_description)
        return build_result(similarity, "keyword_overlap")
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
