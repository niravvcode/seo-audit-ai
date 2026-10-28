from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.issue import SEOIssue, IssueSeverity, IssueCategory, IssueStatus
from app.schemas.issue import IssueResponse, IssueStatusUpdate

router = APIRouter()

@router.get("/audits/{audit_id}/issues", response_model=List[IssueResponse])
def get_audit_issues(
    audit_id: int,
    severity: Optional[IssueSeverity] = None,
    category: Optional[IssueCategory] = None,
    status: Optional[IssueStatus] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SEOIssue).filter(SEOIssue.audit_id == audit_id)

    if severity:
        query = query.filter(SEOIssue.severity == severity)
    if category:
        query = query.filter(SEOIssue.category == category)
    if status:
        query = query.filter(SEOIssue.status == status)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                SEOIssue.title.ilike(search_fmt),
                SEOIssue.affected_url.ilike(search_fmt),
                SEOIssue.explanation.ilike(search_fmt),
                SEOIssue.evidence.ilike(search_fmt)
            )
        )

    # Order by severity: Critical -> High -> Medium -> Low -> Info
    return query.all()

@router.patch("/issues/{issue_id}/status", response_model=IssueResponse)
def update_issue_status(issue_id: int, status_update: IssueStatusUpdate, db: Session = Depends(get_db)):
    issue = db.query(SEOIssue).filter(SEOIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    issue.status = status_update.status
    db.commit()
    db.refresh(issue)
    return issue
