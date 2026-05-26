"""
EduPath AI Service - FastAPI Server
Provides REST API endpoints for:
- Resume parsing with Surya OCR
- Skill matching and assessment
- AI-powered career analysis
"""

import os
import sys
import tempfile
import time
from pathlib import Path
from difflib import SequenceMatcher
from typing import Optional, List
from datetime import datetime

try:
    from fastapi import FastAPI, File, UploadFile, HTTPException, Request
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel
except ImportError as e:
    print(f"Error: FastAPI is not installed. Please run: pip install fastapi uvicorn pydantic")
    sys.exit(1)

# Import new modules for Skill Assessment with CrewAI
try:
    from config.settings import settings
    from config.database import init_db, close_db
    from models.schemas import (
        SkillAssessmentRequest,
        SkillAssessmentResponse,
        HealthCheckResponse,
        ErrorResponse
    )
    from agents.skill_assessment_service import skill_assessment_service
    SKILL_ASSESSMENT_ENABLED = True
except ImportError as e:
    print(f"Warning: Skill Assessment modules not found. Feature disabled. {e}")
    print(f"Error details: {e}")
    SKILL_ASSESSMENT_ENABLED = False

app = FastAPI(
    title="EduPath AI Service",
    description="Resume parsing with Surya OCR + CrewAI-powered skill assessment",
    version="2.0.0"
)

# Database lifecycle events
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("\n" + "="*60)
    print("🚀 EduPath AI Service Starting...")
    print("="*60)

    if SKILL_ASSESSMENT_ENABLED:
        try:
            await init_db()
            print("✅ MongoDB connection established")
        except Exception as e:
            print(f"⚠️  MongoDB connection failed: {e}")
            print("⚠️  Continuing without database persistence")

    print("="*60)
    print("✅ AI Service Ready")
    print("="*60 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("\n🛑 Shutting down AI Service...")

    if SKILL_ASSESSMENT_ENABLED:
        try:
            await close_db()
            print("✅ Database connections closed")
        except Exception as e:
            print(f"⚠️  Error closing database: {e}")

    print("👋 Goodbye!\n")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = time.time()
    print(f"\n📨 {request.method} {request.url.path}")
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"Completed in {process_time:.3f}s")
    response.headers["X-Process-Time"] = str(process_time)
    return response


class SkillMatchRequest(BaseModel):
    """Request model for skill matching endpoint"""
    extracted_skills: List[str]
    database_skills: List[str]


class SkillGapItem(BaseModel):
    skill: str
    gap_severity: str = "medium"
    priority_rank: int = 0
    current_score: float = 0.0
    required_score: float = 80.0


class CurrentSkillItem(BaseModel):
    skill: str
    level: str = "basic"


class RoadmapGenerateRequest(BaseModel):
    user_id: str
    target_role: str
    experience_level: str = "beginner"
    hours_per_week: int = 10
    learning_style: str = "mixed"
    skill_gaps: List[SkillGapItem] = []
    skill_scores: dict = {}
    current_skills: List[CurrentSkillItem] = []


class AdaptRoadmapRequest(BaseModel):
    user_id: str
    roadmap_id: str
    progress_data: dict
    adaptation_reason: str = "slow_progress"


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "EduPath AI Service",
        "version": "2.0.0",
        "status": "running",
        "modules": {
            "resume_parsing": True,
            "skill_assessment": SKILL_ASSESSMENT_ENABLED
        },
        "endpoints": {
            "health": "/health",
            "ai_health": "/ai/health",
            "parse_resume": "/ai/parse-resume",
            "match_skills": "/ai/match-skills",
            "assess_skill": "/api/ai/assess-skill" if SKILL_ASSESSMENT_ENABLED else "disabled"
        }
    }


@app.get("/health")
@app.get("/ai/health")
async def health_check():
    """Health check endpoint with service status"""
    health_data = {
        "status": "healthy",
        "service": "EduPath AI Service",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "resume_parsing": True,
            "skill_assessment": SKILL_ASSESSMENT_ENABLED
        }
    }

    if SKILL_ASSESSMENT_ENABLED:
        health_data["llm_loaded"] = skill_assessment_service.llm is not None

    return health_data


@app.post("/ai/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """
    Parse uploaded resume using Surya OCR
    Accepts: PDF, DOCX, JPG, PNG, TIFF (max 10MB)
    Returns: Structured resume data with skills, experience, education
    """

    # ✅ LAZY IMPORT — loads surya-ocr/torch only when this endpoint is called
    try:
        from resume_parser import get_parser
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Resume parser not available: {e}")

    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.tiff']
    file_ext = Path(file.filename).suffix.lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Validate file size (max 10MB)
    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")

    tmp_file_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            tmp_file.write(file_content)
            tmp_file_path = tmp_file.name

        print(f"📄 Processing: {file.filename}")

        parser = get_parser()
        parsed_data = parser.parse_resume(tmp_file_path, file_ext[1:])

        return JSONResponse(status_code=200, content=parsed_data)

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

    finally:
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)


@app.post("/ai/match-skills")
async def match_skills(request: SkillMatchRequest):
    """
    Match extracted skills with database skills using fuzzy matching
    Uses 70% similarity threshold for matching.
    """

    try:
        matched = []
        unmatched = []

        for ext_skill in request.extracted_skills:
            best_match = None
            best_score = 0

            for db_skill in request.database_skills:
                score = SequenceMatcher(None, ext_skill.lower(), db_skill.lower()).ratio()
                if score > best_score:
                    best_score = score
                    best_match = db_skill

            if best_score > 0.7:
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
        raise HTTPException(status_code=500, detail=f"Error matching skills: {str(e)}")


@app.get("/api/roles")
async def list_supported_roles():
    """Returns list of supported career roles."""
    from data.role_templates import ROLE_TEMPLATES

    return {
        "roles": list(ROLE_TEMPLATES.keys()),
        "count": len(ROLE_TEMPLATES),
    }


@app.get("/api/roles/{role_name}/skills")
async def get_role_skills(role_name: str):
    """Returns the full skill map for a given role."""
    from data.role_templates import ROLE_TEMPLATES

    for name, template in ROLE_TEMPLATES.items():
        if name.lower() == role_name.lower():
            return {
                "role": name,
                "skills": list(template["skills"].keys()),
                "skill_count": len(template["skills"]),
            }

    raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found.")


@app.post("/api/roadmap/generate")
async def generate_roadmap(request: RoadmapGenerateRequest):
    """
    Core roadmap generation endpoint.
    Called by Node.js backend after skill gap analysis is available.
    """

    # ✅ LAZY IMPORT — loads transformers only when this endpoint is called
    try:
        from agents.roadmap_generator import RoadmapGeneratorAgent
        roadmap_agent = RoadmapGeneratorAgent()
    except ImportError as e:
        raise HTTPException(status_code=503, detail="Roadmap generation module unavailable")

    try:
        payload = {
            "user_id": request.user_id,
            "target_role": request.target_role,
            "experience_level": request.experience_level,
            "hours_per_week": request.hours_per_week,
            "learning_style": request.learning_style,
            "skill_gaps": [g.dict() for g in request.skill_gaps],
            "skill_scores": request.skill_scores,
            "current_skills": [s.dict() for s in request.current_skills],
        }

        result = roadmap_agent.generate(payload)
        return result

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@app.post("/api/roadmap/adapt")
async def adapt_roadmap(request: AdaptRoadmapRequest):
    """
    Autonomous adaptation endpoint.
    """
    return {
        "success": True,
        "message": "Adaptation agent queued.",
        "roadmap_id": request.roadmap_id,
        "adaptation_reason": request.adaptation_reason,
    }


if SKILL_ASSESSMENT_ENABLED:
    @app.post(
        "/api/ai/assess-skill",
        response_model=SkillAssessmentResponse,
        tags=["Skill Assessment"]
    )
    async def assess_skill(request: SkillAssessmentRequest):
        """
        Analyze skill assessment results using AI
        """
        try:
            start_time = time.time()

            difficulty_breakdown = {
                'beginner': request.difficulty_breakdown.beginner.dict(),
                'intermediate': request.difficulty_breakdown.intermediate.dict(),
                'advanced': request.difficulty_breakdown.advanced.dict()
            }

            answers = [answer.dict() for answer in request.answers]

            analysis_result = await skill_assessment_service.assess_skill(
                skill_name=request.skill_name,
                normalized_score=request.normalized_score,
                accuracy=request.accuracy,
                difficulty_breakdown=difficulty_breakdown,
                answers=answers,
                career_path=request.career_path,
                user_level=request.user_level or "Intermediate",
                user_id=getattr(request, 'user_id', None)
            )

            processing_time = time.time() - start_time
            print(f"✅ Assessment completed in {processing_time:.2f}s")

            return SkillAssessmentResponse(
                success=True,
                analysis=analysis_result,
                processing_time=round(processing_time, 3),
                message="Skill assessment completed successfully"
            )

        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
        except Exception as e:
            print(f"❌ Error in skill assessment: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "detail": str(exc)
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print("🚀 Starting EduPath AI Service...")
    print(f"📡 Server will run on http://0.0.0.0:{port}")
    print(f"📖 API docs: http://0.0.0.0:{port}/docs")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )