from datetime import datetime
import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import Base

class IssueSeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class IssueCategory(str, enum.Enum):
    ON_PAGE = "ON_PAGE"
    TECHNICAL = "TECHNICAL"
    CONTENT = "CONTENT"
    SECURITY = "SECURITY"
    PERFORMANCE = "PERFORMANCE"

class IssueStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    IGNORED = "IGNORED"

class SEOIssue(Base):
    __tablename__ = "seo_issues"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id", ondelete="CASCADE"), nullable=False, index=True)
    page_id = Column(Integer, ForeignKey("crawled_pages.id", ondelete="SET NULL"), nullable=True, index=True)
    
    rule_id = Column(String(64), nullable=False, index=True)
    category = Column(SQLEnum(IssueCategory), nullable=False, index=True)
    severity = Column(SQLEnum(IssueSeverity), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    affected_url = Column(String(2048), nullable=False)
    evidence = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    suggested_fix = Column(Text, nullable=False)
    estimated_effort = Column(String(64), default="15-30 mins", nullable=False)
    status = Column(SQLEnum(IssueStatus), default=IssueStatus.OPEN, nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    audit = relationship("Audit", back_populates="issues")
    page = relationship("CrawledPage", back_populates="issues")
