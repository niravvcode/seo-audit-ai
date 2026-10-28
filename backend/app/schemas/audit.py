from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.audit import AuditStatus
from app.schemas.website import WebsiteResponse
from app.schemas.page import PageResponse
from app.schemas.issue import IssueResponse

class AuditCreate(BaseModel):
    url: str = Field(..., description="Target website URL to audit")
    max_pages: int = Field(10, ge=1, le=50, description="Max pages to crawl")
    max_depth: int = Field(2, ge=0, le=5, description="Max crawl depth from start URL")
    follow_internal: bool = Field(True, description="Follow internal hyperlinks")

class AuditProgress(BaseModel):
    id: int
    status: AuditStatus
    pages_crawled: int
    max_pages: int
    issues_found: int
    current_url: Optional[str] = None

class AuditSummary(BaseModel):
    id: int
    website_id: int
    website_url: str
    status: AuditStatus
    health_score: float
    total_pages_crawled: int
    total_issues_found: int
    critical_issues_count: int
    high_issues_count: int
    medium_issues_count: int
    low_issues_count: int
    info_issues_count: int
    max_pages: int = 10
    max_depth: int = 2
    follow_internal: bool = True
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuditDetail(AuditSummary):
    website: WebsiteResponse
    pages: List[PageResponse] = []
    issues: List[IssueResponse] = []

    class Config:
        from_attributes = True
