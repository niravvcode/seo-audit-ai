import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_SQLITE_PATH = BACKEND_DIR / "seo_audit.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "SEO Audit AI"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"
    )
    USE_SQLITE_FALLBACK: bool = True
    SQLITE_URL: str = f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    
    # AI Provider (Optional)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Crawler Limits
    MAX_CRAWL_PAGES_LIMIT: int = 50
    DEFAULT_CRAWL_TIMEOUT_SECONDS: float = 10.0
    USER_AGENT: str = "SEOAuditAI-Bot/1.0 (+https://github.com/seo-audit-ai)"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
