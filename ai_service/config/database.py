"""
MongoDB Database Configuration for AI Service
"""
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional
import logging

from config.settings import settings

logger = logging.getLogger(__name__)


class Database:
    """MongoDB database manager"""
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URI)
            
            # Test the connection
            await cls.client.admin.command('ping')
            
            logger.info(f"✅ MongoDB Connected")
            logger.info(f"📊 Database: {settings.DATABASE_NAME}")
            
            # Initialize Beanie with document models
            from models.agent_models import AgentAssessment
            await init_beanie(
                database=cls.client[settings.DATABASE_NAME],
                document_models=[AgentAssessment]
            )
            logger.info("✅ Beanie ODM initialized")
            
        except Exception as e:
            logger.error(f"❌ MongoDB connection error: {e}")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("📪 MongoDB connection closed")


# Database connection helpers
async def get_database():
    """Get database instance"""
    return Database.client[settings.DATABASE_NAME]


async def init_db():
    """Initialize database connection"""
    await Database.connect_db()


async def close_db():
    """Close database connection"""
    await Database.close_db()
