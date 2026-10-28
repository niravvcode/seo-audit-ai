from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.issue import IssueSeverity, IssueCategory, IssueStatus

class IssueBase(BaseModel):
    rule_id: str
    category: IssueCategory
    severity: IssueSeverity
    title: str
    affected_url: str
    evidence: str
    explanation: str
    why_it_matters: str
    suggested_fix: str
    estimated_effort: str
    status: IssueStatus

class IssueStatusUpdate(BaseModel):
    status: IssueStatus

class IssueResponse(IssueBase):
    id: int
    audit_id: int
    page_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
