from datetime import datetime
import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class AuditStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(SQLEnum(AuditStatus), default=AuditStatus.PENDING, nullable=False, index=True)
    
    # Progress & Metrics
    health_score = Column(Float, default=0.0, nullable=False)
    total_pages_crawled = Column(Integer, default=0, nullable=False)
    total_issues_found = Column(Integer, default=0, nullable=False)
    critical_issues_count = Column(Integer, default=0, nullable=False)
    high_issues_count = Column(Integer, default=0, nullable=False)
    medium_issues_count = Column(Integer, default=0, nullable=False)
    low_issues_count = Column(Integer, default=0, nullable=False)
    info_issues_count = Column(Integer, default=0, nullable=False)

    # Configuration
    max_pages = Column(Integer, default=10, nullable=False)
    max_depth = Column(Integer, default=2, nullable=False)
    follow_internal = Column(Boolean, default=True, nullable=False)

    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    website = relationship("Website", back_populates="audits")
    pages = relationship("CrawledPage", back_populates="audit", cascade="all, delete-orphan")
    issues = relationship("SEOIssue", back_populates="audit", cascade="all, delete-orphan")

    @property
    def website_url(self) -> str:
        return self.website.url if self.website else ""
