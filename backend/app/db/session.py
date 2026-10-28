import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

def create_db_engine():
    db_url = settings.DATABASE_URL
    try:
        if db_url.startswith("postgresql"):
            # Test PostgreSQL connectivity with a short timeout
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 3}
            )
            with engine.connect() as conn:
                pass
            logger.info("Successfully connected to primary PostgreSQL database.")
            return engine
    except Exception as e:
        logger.warning(
            f"Failed to connect to PostgreSQL at {db_url}: {e}. "
        )
        if settings.USE_SQLITE_FALLBACK:
            logger.warning(
                f"Falling back to local SQLite database at {settings.SQLITE_URL} "
                "for development/testing. Set up PostgreSQL and update DATABASE_URL for production."
            )
            return create_engine(
                settings.SQLITE_URL,
                connect_args={"check_same_thread": False}
            )
        else:
            raise

    # If already sqlite or custom
    if "sqlite" in db_url:
        return create_engine(db_url, connect_args={"check_same_thread": False})
    
    return create_engine(db_url, pool_pre_ping=True)

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
