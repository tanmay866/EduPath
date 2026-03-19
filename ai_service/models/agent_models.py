"""
Database models for Agent assessment results
"""
from datetime import datetime
from typing import List, Dict, Optional
from beanie import Document
from pydantic import Field


class WeakArea(Document):
    """Weak area identified by agent"""
    area: str
    severity: str  # "High", "Medium", "Low"
    recommendation: str


class AgentAssessment(Document):
    """
    Stores skill assessment results from CrewAI agents
    Maps to MongoDB collection
    """
    # User and Assessment Info
    user_id: Optional[str] = None
    skill_name: str
    career_path: str
    user_level: str = "Intermediate"
    
    # Performance Metrics
    normalized_score: float
    accuracy: float
    skill_strength: float
    performance_category: str
    
    # Difficulty Breakdown
    difficulty_breakdown: Dict = Field(default_factory=dict)
    
    # AI Analysis
    weak_areas: List[Dict] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    
    # Additional Insights
    consistency_score: Optional[float] = None
    progression_readiness: Optional[str] = None
    estimated_time_to_next_level: Optional[str] = None
    
    # Agent Metadata
    agent_version: str = "crewai_1.0"
    processing_time: Optional[float] = None  # seconds
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "agent_assessments"
        indexes = [
            "user_id",
            "skill_name",
            "career_path",
            "created_at",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "skill_name": "React",
                "career_path": "MERN",
                "normalized_score": 75.5,
                "accuracy": 80.0,
                "skill_strength": 77.3,
                "performance_category": "Strong Intermediate",
                "weak_areas": [
                    {
                        "area": "Advanced React Hooks",
                        "severity": "Medium",
                        "recommendation": "Practice useCallback and useMemo"
                    }
                ],
                "recommendations": [
                    "Deep dive into React hooks patterns",
                    "Build a project with Context API"
                ]
            }
        }


class AgentMemory(Document):
    """
    Stores agent conversation memory and context
    """
    user_id: str
    agent_type: str  # "skill_assessment", "roadmap", "career_advisor"
    session_id: str
    
    # Memory content
    conversation_history: List[Dict] = Field(default_factory=list)
    key_insights: List[str] = Field(default_factory=list)
    user_preferences: Dict = Field(default_factory=dict)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "agent_memories"
        indexes = [
            "user_id",
            "agent_type",
            "session_id"
        ]
