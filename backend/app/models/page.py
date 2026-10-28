from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class CrawledPage(Base):
    __tablename__ = "crawled_pages"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(2048), nullable=False, index=True)
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Float, nullable=True)
    depth = Column(Integer, default=0, nullable=False)
    
    # Metadata extracted
    title = Column(String(1024), nullable=True)
    meta_description = Column(Text, nullable=True)
    h1_count = Column(Integer, default=0, nullable=False)
    content_hash = Column(String(64), nullable=True, index=True)
    word_count = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    audit = relationship("Audit", back_populates="pages")
    issues = relationship("SEOIssue", back_populates="page", cascade="all, delete-orphan")
