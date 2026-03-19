"""
Configuration module for EduPath AI Service
"""
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    # Service Configuration
    AI_SERVICE_PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    AI_SERVICE_HOST: str = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # HuggingFace Configuration
    HUGGINGFACE_API_KEY: Optional[str] = os.getenv("HUGGINGFACE_API_KEY")
    HUGGINGFACE_API_TOKEN: Optional[str] = os.getenv("HUGGINGFACE_API_TOKEN")
    
    # Model Configuration
    LLM_MODEL: str = os.getenv(
        "LLM_MODEL",
        "google/flan-t5-base"
    )

    # LLM Parameters
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.7"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "2048"))
    
    # Cache Configuration
    USE_MODEL_CACHE: bool = os.getenv("USE_MODEL_CACHE", "true").lower() == "true"
    CACHE_DIR: Path = Path(os.getenv("CACHE_DIR", "./model_cache"))
    MODEL_CACHE_DIR: str = os.getenv("MODEL_CACHE_DIR", "./models_cache")
    
    # Performance
    MAX_WORKERS: int = int(os.getenv("MAX_WORKERS", "4"))
    REQUEST_TIMEOUT: int = int(os.getenv("REQUEST_TIMEOUT", "30"))
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "ai_service.log")
    
    # Skill Assessment Thresholds
    BEGINNER_THRESHOLD: float = 50.0
    INTERMEDIATE_THRESHOLD: float = 70.0
    ADVANCED_THRESHOLD: float = 85.0
    
    # Score Weights
    ACCURACY_WEIGHT: float = 0.6
    DIFFICULTY_WEIGHT: float = 0.4
    
    # MongoDB Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/edupath")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "edupath")

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"  # Ignore extra fields from .env
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Create cache directory if it doesn't exist
        if self.USE_MODEL_CACHE:
            self.CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Global settings instance
settings = Settings()

# Skill to career path mapping
CAREER_SKILL_MAPPING = {
    "MERN": [
        "JavaScript", "React", "Node.js", "Express.js", "MongoDB",
        "HTML", "CSS", "REST APIs", "Git", "Responsive Design"
    ],
    "AI": [
        "Python", "Machine Learning", "Deep Learning", "TensorFlow",
        "PyTorch", "NumPy", "Pandas", "Data Preprocessing", "Model Deployment"
    ],
    "Cyber": [
        "Network Security", "Cryptography", "Ethical Hacking", 
        "Penetration Testing", "Security Tools", "Linux", "Python",
        "Risk Assessment", "Incident Response"
    ],
    "Data Science": [
        "Python", "Statistics", "Data Visualization", "SQL",
        "Machine Learning", "Pandas", "NumPy", "Scikit-learn",
        "Data Cleaning", "Feature Engineering"
    ],
    "DevOps": [
        "Linux", "Docker", "Kubernetes", "CI/CD", "AWS",
        "Git", "Python", "Bash Scripting", "Monitoring", "Terraform"
    ],
    "Mobile": [
        "React Native", "Flutter", "iOS Development", "Android Development",
        "Mobile UI/UX", "API Integration", "State Management", "App Deployment"
    ]
}

# Recommendation templates based on performance
RECOMMENDATION_TEMPLATES = {
    "weak_beginner": [
        "Start with fundamental concepts and basics",
        "Practice simple exercises daily",
        "Watch beginner-friendly tutorials",
        "Focus on understanding core principles"
    ],
    "strong_beginner": [
        "Move to intermediate level challenges",
        "Build small practice projects",
        "Learn best practices and conventions",
        "Start exploring advanced topics"
    ],
    "weak_intermediate": [
        "Revisit fundamental concepts",
        "Practice coding challenges regularly",
        "Focus on weak areas identified",
        "Build projects to reinforce learning"
    ],
    "strong_intermediate": [
        "Tackle advanced problems and concepts",
        "Contribute to open-source projects",
        "Learn system design and architecture",
        "Prepare for technical interviews"
    ],
    "weak_advanced": [
        "Review intermediate concepts thoroughly",
        "Practice complex problem-solving",
        "Study design patterns and architectures",
        "Work on larger scale projects"
    ],
    "strong_advanced": [
        "Master advanced topics and patterns",
        "Mentor others and share knowledge",
        "Contribute to complex projects",
        "Stay updated with latest technologies"
    ]
}