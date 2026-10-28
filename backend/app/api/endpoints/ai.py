from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.audit import Audit
from app.models.issue import SEOIssue
from app.schemas.ai import (
    AIRecommendationRequest,
    AIRecommendationResponse,
    AIExecutiveSummaryRequest,
    AIExecutiveSummaryResponse
)
from app.services.ai.advisor import AIAdvisor

router = APIRouter()

@router.post("/recommendation", response_model=AIRecommendationResponse)
async def get_issue_ai_recommendation(req: AIRecommendationRequest, db: Session = Depends(get_db)):
    issue = db.query(SEOIssue).filter(SEOIssue.id == req.issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    rec = await AIAdvisor.get_issue_recommendation(issue, req.custom_prompt)
    return AIRecommendationResponse(**rec)

@router.post("/executive-summary", response_model=AIExecutiveSummaryResponse)
async def get_executive_summary(req: AIExecutiveSummaryRequest, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == req.audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    site_url = audit.website.url if audit.website else "Website"
    summary_data = await AIAdvisor.generate_executive_summary(
        website_url=site_url,
        health_score=audit.health_score,
        critical_count=audit.critical_issues_count,
        high_count=audit.high_issues_count,
        medium_count=audit.medium_issues_count,
        low_count=audit.low_issues_count,
        pages_crawled=audit.total_pages_crawled
    )

    return AIExecutiveSummaryResponse(
        audit_id=audit.id,
        executive_summary=summary_data["executive_summary"],
        key_strengths=summary_data["key_strengths"],
        critical_risks=summary_data["critical_risks"],
        immediate_actions=summary_data["immediate_actions"]
    )
