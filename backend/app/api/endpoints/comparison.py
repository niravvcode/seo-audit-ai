import asyncio
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.crawler.crawler import SafeCrawler
from app.services.seo.engine import SEOEngine
from app.services.crawler.security import validate_target_url

router = APIRouter()

class ComparisonRequest(BaseModel):
    url_a: str
    url_b: str
    max_pages: int = 5

class ComparisonCategory(BaseModel):
    name: str
    score_a: float
    score_b: float
    winner: str

class ComparisonResponse(BaseModel):
    url_a: str
    url_b: str
    overall_winner: str
    score_a: float
    score_b: float
    pages_crawled_a: int
    pages_crawled_b: int
    critical_issues_a: int
    critical_issues_b: int
    avg_response_time_a_ms: float
    avg_response_time_b_ms: float
    categories: List[ComparisonCategory]
    summary_verdict: str

async def _audit_single_site(target_url: str, max_pages: int):
    crawler = SafeCrawler(start_url=target_url, max_pages=max_pages, max_depth=1)
    results = await crawler.crawl()
    page_analyses, issues, score_data = SEOEngine.analyze_crawl(
        crawled_results=results,
        start_url=target_url,
        sitemap_accessible=crawler.sitemap_accessible,
        robots_accessible=bool(crawler.robots_parser and crawler.robots_parser.is_accessible)
    )
    return results, page_analyses, issues, score_data

@router.post("/compare", response_model=ComparisonResponse)
async def compare_competitors(req: ComparisonRequest):
    # Validate URLs
    for u in [req.url_a, req.url_b]:
        safe, reason = validate_target_url(u)
        if not safe:
            raise HTTPException(status_code=400, detail=f"Invalid target URL '{u}': {reason}")

    # Crawl both sites concurrently
    task_a = _audit_single_site(req.url_a, req.max_pages)
    task_b = _audit_single_site(req.url_b, req.max_pages)
    (res_a, pages_a, issues_a, score_a), (res_b, pages_b, issues_b, score_b) = await asyncio.gather(task_a, task_b)

    sc_a = score_a["score"]
    sc_b = score_b["score"]

    crit_a = sum(1 for i in issues_a if i.severity.value == "CRITICAL")
    crit_b = sum(1 for i in issues_b if i.severity.value == "CRITICAL")

    avg_rt_a = round(sum(r.response_time_ms for r in res_a) / max(1, len(res_a)), 1)
    avg_rt_b = round(sum(r.response_time_ms for r in res_b) / max(1, len(res_b)), 1)

    # Categories comparison
    categories = []
    cat_names = [
        ("On-Page SEO", "ON_PAGE"),
        ("Technical SEO", "TECHNICAL"),
        ("Content Quality", "CONTENT"),
        ("Security (HTTPS)", "SECURITY"),
        ("Performance", "PERFORMANCE"),
    ]

    for display_name, cat_code in cat_names:
        pen_a = score_a.get("deductions_by_category", {}).get(cat_code, 0.0)
        pen_b = score_b.get("deductions_by_category", {}).get(cat_code, 0.0)
        c_score_a = max(0.0, 100.0 - (pen_a * 2.5))
        c_score_b = max(0.0, 100.0 - (pen_b * 2.5))
        win = "Site A" if c_score_a > c_score_b else "Site B" if c_score_b > c_score_a else "Tie"
        categories.append(ComparisonCategory(
            name=display_name,
            score_a=round(c_score_a, 1),
            score_b=round(c_score_b, 1),
            winner=win
        ))

    overall_winner = "Site A" if sc_a > sc_b else "Site B" if sc_b > sc_a else "Tie"
    winning_url = req.url_a if overall_winner == "Site A" else req.url_b if overall_winner == "Site B" else "Both sites tied"

    verdict = (
        f"{winning_url} leads the head-to-head comparison with a score of "
        f"{max(sc_a, sc_b)} vs {min(sc_a, sc_b)}. "
        f"{'Site A has faster load times.' if avg_rt_a < avg_rt_b else 'Site B has faster load times.'} "
        f"Key differentiator: Site A has {crit_a} critical issues, whereas Site B has {crit_b} critical issues."
    )

    return ComparisonResponse(
        url_a=req.url_a,
        url_b=req.url_b,
        overall_winner=overall_winner,
        score_a=sc_a,
        score_b=sc_b,
        pages_crawled_a=len(pages_a),
        pages_crawled_b=len(pages_b),
        critical_issues_a=crit_a,
        critical_issues_b=crit_b,
        avg_response_time_a_ms=avg_rt_a,
        avg_response_time_b_ms=avg_rt_b,
        categories=categories,
        summary_verdict=verdict
    )
