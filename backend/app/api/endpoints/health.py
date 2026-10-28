from fastapi import APIRouter
from app.core.config import settings
from app.services.ai.advisor import AIAdvisor

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database_backend": "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite",
        "ai_enabled": AIAdvisor.is_ai_configured(),
        "version": "1.0.0"
    }
