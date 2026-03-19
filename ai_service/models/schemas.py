"""
Pydantic models for request/response validation
"""
from typing import List, Dict, Optional
from pydantic import BaseModel, Field, validator


class DifficultyStats(BaseModel):
    """Statistics for a specific difficulty level"""
    attempted: int = Field(ge=0, description="Number of questions attempted")
    correct: int = Field(ge=0, description="Number of correct answers")
    accuracy: float = Field(ge=0, le=100, description="Accuracy percentage")


class DifficultyBreakdown(BaseModel):
    """Breakdown of performance by difficulty level"""
    beginner: DifficultyStats
    intermediate: DifficultyStats
    advanced: DifficultyStats


class Answer(BaseModel):
    """Individual answer submission"""
    questionId: str
    selectedOption: int = Field(ge=0, le=3)
    correctOption: int = Field(ge=0, le=3)
    isCorrect: bool
    weight: int = Field(ge=1, le=3)
    difficulty: str = Field(pattern="^(Beginner|Intermediate|Advanced)$")


class SkillAssessmentRequest(BaseModel):
    """Request model for skill assessment"""
    user_id: Optional[str] = Field(None, description="User identifier for database storage")
    skill_name: str = Field(..., min_length=1, description="Name of the skill being assessed")
    normalized_score: float = Field(..., ge=0, le=100, description="Normalized score (0-100)")
    accuracy: float = Field(..., ge=0, le=100, description="Overall accuracy percentage")
    difficulty_breakdown: DifficultyBreakdown
    answers: List[Answer]
    career_path: str = Field(..., description="Target career path")
    user_level: Optional[str] = Field(None, pattern="^(Beginner|Intermediate|Advanced)$")

    @validator('answers')
    def validate_answers(cls, v):
        if len(v) == 0:
            raise ValueError('At least one answer is required')
        return v


class AIAnalysis(BaseModel):
    """AI-generated analysis of skill assessment"""
    skill_name: Optional[str] = None
    skill_strength: float = Field(ge=0, le=100, description="Overall skill strength score")
    performance_category: Optional[str] = Field(None, description="Performance category")
    weak_areas: List[Dict] = Field(default_factory=list, description="Identified weak areas")
    strengths: List[str] = Field(default_factory=list, description="Identified strengths")
    recommendations: List[str] = Field(default_factory=list, description="Learning recommendations")
    next_steps: List[str] = Field(default_factory=list, description="Suggested next steps")
    consistency_score: Optional[float] = Field(None, description="Consistency across difficulty levels")
    progression_readiness: Optional[str] = Field(None, description="Readiness for next level")
    estimated_time_to_next_level: Optional[str] = Field(None, description="Time estimate")
    difficulty_breakdown: Optional[Dict] = Field(None, description="Detailed breakdown")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    fallback_mode: Optional[bool] = Field(False, description="Whether fallback mode was used")


class SkillAssessmentResponse(BaseModel):
    """Response model for skill assessment"""
    success: bool
    analysis: AIAnalysis
    processing_time: Optional[float] = None
    message: Optional[str] = None


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    models_loaded: bool
    timestamp: str


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    error: str
    detail: Optional[str] = None