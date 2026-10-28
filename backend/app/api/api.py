from fastapi import APIRouter
from app.api.endpoints import audits, issues, export, ai, health

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(audits.router, prefix="/audits", tags=["Audits"])
api_router.include_router(issues.router, tags=["Issues"])
api_router.include_router(export.router, tags=["Export"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Advisor"])
