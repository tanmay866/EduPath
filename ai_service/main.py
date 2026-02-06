"""
FastAPI Server for Resume Parsing
Location: ai_service/main.py

Provides REST API endpoints for Surya OCR resume parsing
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import tempfile
from pathlib import Path
from difflib import SequenceMatcher

from resume_parser import get_parser

app = FastAPI(
    title="EduPath AI Service",
    description="Resume parsing with Surya OCR",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Response Models
class HealthResponse(BaseModel):
    status: str
    models_loaded: bool


class SkillMatchRequest(BaseModel):
    extracted_skills: List[str]
    database_skills: List[str]


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "EduPath AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/ai/health",
            "parse_resume": "/ai/parse-resume",
            "match_skills": "/ai/match-skills"
        }
    }


@app.get("/ai/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": True
    }


@app.post("/ai/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """
    Parse uploaded resume using Surya OCR
    
    Accepts: PDF, DOCX, JPG, PNG, TIFF
    Returns: Structured resume data
    """
    
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.tiff']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024
    file_content = await file.read()
    
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )
    
    tmp_file_path = None
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            tmp_file.write(file_content)
            tmp_file_path = tmp_file.name
        
        print(f"📄 Processing: {file.filename}")
        
        # Get parser instance
        parser = get_parser()
        
        # Parse resume
        parsed_data = parser.parse_resume(tmp_file_path, file_ext[1:])
        
        return JSONResponse(
            status_code=200,
            content=parsed_data
        )
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error parsing resume: {str(e)}"
        )
    
    finally:
        # Clean up temp file
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)


@app.post("/ai/match-skills")
async def match_skills(request: SkillMatchRequest):
    """
    Match extracted skills with database skills using fuzzy matching
    
    Body:
    {
        "extracted_skills": ["React", "Nodejs", "Python3"],
        "database_skills": ["React.js", "Node.js", "Python"]
    }
    
    Returns:
    {
        "matched_skills": [...],
        "unmatched_skills": [...],
        "total_matched": 10,
        "total_unmatched": 2
    }
    """
    
    try:
        extracted = request.extracted_skills
        database = request.database_skills
        
        matched = []
        unmatched = []
        
        for ext_skill in extracted:
            best_match = None
            best_score = 0
            
            for db_skill in database:
                # Calculate similarity
                score = SequenceMatcher(None, ext_skill.lower(), db_skill.lower()).ratio()
                
                if score > best_score:
                    best_score = score
                    best_match = db_skill
            
            if best_score > 0.7:  # 70% similarity threshold
                matched.append({
                    "extracted": ext_skill,
                    "database_match": best_match,
                    "confidence": round(best_score, 2)
                })
            else:
                unmatched.append(ext_skill)
        
        return {
            "matched_skills": matched,
            "unmatched_skills": unmatched,
            "total_matched": len(matched),
            "total_unmatched": len(unmatched)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error matching skills: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting EduPath AI Service...")
    print("📡 Server will run on http://localhost:8000")
    print("📖 API docs: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )