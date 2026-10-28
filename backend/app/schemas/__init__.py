from app.schemas.website import WebsiteBase, WebsiteCreate, WebsiteResponse
from app.schemas.audit import AuditCreate, AuditProgress, AuditSummary, AuditDetail
from app.schemas.page import PageBase, PageResponse
from app.schemas.issue import IssueBase, IssueStatusUpdate, IssueResponse
from app.schemas.ai import (
    AIRecommendationRequest,
    AIRecommendationResponse,
    AIExecutiveSummaryRequest,
    AIExecutiveSummaryResponse,
)

__all__ = [
    "WebsiteBase",
    "WebsiteCreate",
    "WebsiteResponse",
    "AuditCreate",
    "AuditProgress",
    "AuditSummary",
    "AuditDetail",
    "PageBase",
    "PageResponse",
    "IssueBase",
    "IssueStatusUpdate",
    "IssueResponse",
    "AIRecommendationRequest",
    "AIRecommendationResponse",
    "AIExecutiveSummaryRequest",
    "AIExecutiveSummaryResponse",
]
