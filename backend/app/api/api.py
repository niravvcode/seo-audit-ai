from fastapi import APIRouter
from app.api.endpoints import audits, issues, export, ai, health, comparison, keywords, pagespeed, schedules, tools

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(audits.router, prefix="/audits", tags=["Audits"])
api_router.include_router(issues.router, tags=["Issues"])
api_router.include_router(export.router, tags=["Export"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Advisor"])
api_router.include_router(comparison.router, tags=["Competitor Comparison"])
api_router.include_router(keywords.router, tags=["Keyword Analysis"])
api_router.include_router(pagespeed.router, tags=["PageSpeed & CWV"])
api_router.include_router(schedules.router, tags=["Scheduled Monitoring"])
api_router.include_router(tools.router, tags=["SEO Diagnostic Tools"])
