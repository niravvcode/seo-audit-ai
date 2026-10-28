from fastapi import APIRouter, Query, HTTPException
from app.services.seo.pagespeed import PageSpeedService
from app.services.crawler.security import validate_target_url

router = APIRouter()

@router.get("/pagespeed")
async def get_pagespeed_metrics(
    url: str = Query(..., description="Target URL for Core Web Vitals"),
    strategy: str = Query("mobile", enum=["mobile", "desktop"])
):
    safe, reason = validate_target_url(url)
    if not safe:
        raise HTTPException(status_code=400, detail=f"Invalid target URL: {reason}")

    return await PageSpeedService.get_core_web_vitals(url, strategy=strategy)
