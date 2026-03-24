#!/usr/bin/env python3
"""
ATS Resume Scorer using Sentence Transformers
Analyzes resume against job description using semantic similarity
"""

import sys
import json
from sentence_transformers import SentenceTransformer, util

# Load the model (cached after first download)
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def calculate_ats_score(resume_text, job_description):
    """
    Calculate ATS score using semantic similarity
    """
    try:
        # Encode both texts
        resume_embedding = model.encode(resume_text, convert_to_tensor=True)
        jd_embedding = model.encode(job_description, convert_to_tensor=True)

        # Calculate cosine similarity
        similarity = util.cos_sim(resume_embedding, jd_embedding)

        # Convert to percentage score (0-100)
        score = float(similarity[0][0]) * 100

        # Determine status
        if score >= 80:
            status = "Excellent Match"
        elif score >= 60:
            status = "Good Match"
        elif score >= 40:
            status = "Average Match"
        else:
            status = "Poor Match"

        result = {
            "success": True,
            "score": round(score, 2),
            "status": status,
            "similarity": round(float(similarity[0][0]), 4),
            "message": f"Your resume has a {round(score, 2)}% match with the job description"
        }

        return result

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to analyze resume"
        }

if __name__ == "__main__":
    # Read input from command line arguments
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "error": "Resume text and job description are required"
        }))
        sys.exit(1)

    resume_text = sys.argv[1]
    job_description = sys.argv[2]

    # Calculate score
    result = calculate_ats_score(resume_text, job_description)

    # Output as JSON
    print(json.dumps(result, indent=2))
