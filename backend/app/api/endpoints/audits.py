import asyncio
from datetime import datetime
from typing import List, Dict, Optional, Any
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import desc

from app.db.session import get_db, SessionLocal
from app.models.website import Website
from app.models.audit import Audit, AuditStatus
from app.models.page import CrawledPage
from app.models.issue import SEOIssue, IssueSeverity, IssueStatus
from app.schemas.audit import AuditCreate, AuditSummary, AuditDetail, AuditProgress
from app.services.crawler.security import validate_target_url
from app.services.crawler.crawler import SafeCrawler
from app.services.seo.engine import SEOEngine

router = APIRouter()

# In-memory tracking of active crawler jobs and cancellation flags
ACTIVE_CRAWLERS: Dict[int, Dict[str, Any]] = {}

def update_audit_progress(audit_id: int, crawled: int, max_pages: int, current_url: str):
    if audit_id in ACTIVE_CRAWLERS:
        ACTIVE_CRAWLERS[audit_id]["pages_crawled"] = crawled
        ACTIVE_CRAWLERS[audit_id]["current_url"] = current_url

async def run_audit_background_task(audit_id: int, target_url: str, max_pages: int, max_depth: int, follow_internal: bool):
    db: Session = SessionLocal()
    try:
        audit = db.query(Audit).filter(Audit.id == audit_id).first()
        if not audit:
            return

        audit.status = AuditStatus.RUNNING
        db.commit()

        def is_cancelled() -> bool:
            return ACTIVE_CRAWLERS.get(audit_id, {}).get("cancelled", False)

        def on_progress(crawled: int, total: int, cur_url: str):
            update_audit_progress(audit_id, crawled, total, cur_url)

        crawler = SafeCrawler(
            start_url=target_url,
            max_pages=max_pages,
            max_depth=max_depth,
            follow_internal=follow_internal,
            progress_callback=on_progress,
            is_cancelled=is_cancelled
        )

        crawled_results = await crawler.crawl()

        if is_cancelled():
            audit.status = AuditStatus.CANCELLED
            audit.completed_at = datetime.utcnow()
            db.commit()
            return

        # Run SEO Analysis
        page_analyses, all_issues, score_data = SEOEngine.analyze_crawl(
            crawled_results=crawled_results,
            start_url=target_url,
            sitemap_accessible=crawler.sitemap_accessible,
            robots_accessible=bool(crawler.robots_parser and crawler.robots_parser.is_accessible)
        )

        # Save pages to DB
        url_to_page_id = {}
        for pdata in page_analyses:
            db_page = CrawledPage(
                audit_id=audit.id,
                url=pdata.url,
                status_code=pdata.status_code,
                response_time_ms=pdata.response_time_ms,
                depth=pdata.depth,
                title=pdata.title,
                meta_description=pdata.meta_description,
                h1_count=pdata.h1_count,
                content_hash=pdata.content_hash,
                word_count=pdata.word_count,
                error_message=pdata.error_message
            )
            db.add(db_page)
            db.flush()
            url_to_page_id[pdata.url] = db_page.id

        # Save issues to DB
        crit_count = 0
        high_count = 0
        med_count = 0
        low_count = 0
        info_count = 0

        for idraft in all_issues:
            sev = idraft.severity
            if sev == IssueSeverity.CRITICAL:
                crit_count += 1
            elif sev == IssueSeverity.HIGH:
                high_count += 1
            elif sev == IssueSeverity.MEDIUM:
                med_count += 1
            elif sev == IssueSeverity.LOW:
                low_count += 1
            elif sev == IssueSeverity.INFO:
                info_count += 1

            db_issue = SEOIssue(
                audit_id=audit.id,
                page_id=url_to_page_id.get(idraft.affected_url),
                rule_id=idraft.rule_id,
                category=idraft.category,
                severity=idraft.severity,
                title=idraft.title,
                affected_url=idraft.affected_url,
                evidence=idraft.evidence,
                explanation=idraft.explanation,
                why_it_matters=idraft.why_it_matters,
                suggested_fix=idraft.suggested_fix,
                estimated_effort=idraft.estimated_effort,
                status=IssueStatus.OPEN
            )
            db.add(db_issue)

        # Update audit summary
        audit.status = AuditStatus.COMPLETED
        audit.health_score = score_data["score"]
        audit.total_pages_crawled = len(page_analyses)
        audit.total_issues_found = len(all_issues)
        audit.critical_issues_count = crit_count
        audit.high_issues_count = high_count
        audit.medium_issues_count = med_count
        audit.low_issues_count = low_count
        audit.info_issues_count = info_count
        audit.completed_at = datetime.utcnow()

        db.commit()

    except Exception as e:
        db.rollback()
        audit = db.query(Audit).filter(Audit.id == audit_id).first()
        if audit:
            audit.status = AuditStatus.FAILED
            audit.error_message = str(e)
            audit.completed_at = datetime.utcnow()
            db.commit()
    finally:
        ACTIVE_CRAWLERS.pop(audit_id, None)
        db.close()

@router.post("", response_model=AuditSummary)
async def start_audit(audit_in: AuditCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 1. SSRF and URL validation
    target_url = audit_in.url.strip()
    if not (target_url.startswith("http://") or target_url.startswith("https://")):
        target_url = f"https://{target_url}"

    is_safe, error_reason = validate_target_url(target_url)
    if not is_safe:
        raise HTTPException(status_code=400, detail=f"Invalid or prohibited target URL: {error_reason}")

    parsed = urlparse(target_url)
    domain = parsed.netloc.lower()

    # 2. Get or create website
    website = db.query(Website).filter(Website.url == target_url).first()
    if not website:
        website = Website(url=target_url, domain=domain)
        db.add(website)
        db.commit()
        db.refresh(website)

    # 3. Create Audit record
    audit = Audit(
        website_id=website.id,
        status=AuditStatus.PENDING,
        max_pages=audit_in.max_pages,
        max_depth=audit_in.max_depth,
        follow_internal=audit_in.follow_internal
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    # 4. Initialize active crawler tracker
    ACTIVE_CRAWLERS[audit.id] = {
        "pages_crawled": 0,
        "max_pages": audit.max_pages,
        "current_url": target_url,
        "cancelled": False
    }

    # 5. Launch async background audit
    background_tasks.add_task(
        run_audit_background_task,
        audit.id,
        target_url,
        audit.max_pages,
        audit.max_depth,
        audit.follow_internal
    )

    return AuditSummary(
        id=audit.id,
        website_id=website.id,
        website_url=website.url,
        status=audit.status,
        health_score=audit.health_score,
        total_pages_crawled=audit.total_pages_crawled,
        total_issues_found=audit.total_issues_found,
        critical_issues_count=audit.critical_issues_count,
        high_issues_count=audit.high_issues_count,
        medium_issues_count=audit.medium_issues_count,
        low_issues_count=audit.low_issues_count,
        info_issues_count=audit.info_issues_count,
        max_pages=audit.max_pages,
        max_depth=audit.max_depth,
        follow_internal=audit.follow_internal,
        started_at=audit.started_at,
        completed_at=audit.completed_at
    )

@router.get("", response_model=List[AuditSummary])
def list_audits(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    audits = (
        db.query(Audit)
        .options(joinedload(Audit.website))
        .order_by(desc(Audit.started_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    summaries = []
    for a in audits:
        summaries.append(AuditSummary(
            id=a.id,
            website_id=a.website_id,
            website_url=a.website.url if a.website else "Unknown",
            status=a.status,
            health_score=a.health_score,
            total_pages_crawled=a.total_pages_crawled,
            total_issues_found=a.total_issues_found,
            critical_issues_count=a.critical_issues_count,
            high_issues_count=a.high_issues_count,
            medium_issues_count=a.medium_issues_count,
            low_issues_count=a.low_issues_count,
            info_issues_count=a.info_issues_count,
            max_pages=a.max_pages,
            max_depth=a.max_depth,
            follow_internal=a.follow_internal,
            started_at=a.started_at,
            completed_at=a.completed_at
        ))
    return summaries

@router.get("/{audit_id}", response_model=AuditDetail)
def get_audit(audit_id: int, db: Session = Depends(get_db)):
    audit = (
        db.query(Audit)
        .options(
            joinedload(Audit.website),
            selectinload(Audit.pages),
            selectinload(Audit.issues)
        )
        .filter(Audit.id == audit_id)
        .first()
    )
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    return audit

@router.get("/{audit_id}/progress", response_model=AuditProgress)
def get_audit_progress(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    tracker = ACTIVE_CRAWLERS.get(audit_id)
    if tracker:
        return AuditProgress(
            id=audit.id,
            status=audit.status,
            pages_crawled=tracker.get("pages_crawled", 0),
            max_pages=tracker.get("max_pages", audit.max_pages),
            issues_found=audit.total_issues_found,
            current_url=tracker.get("current_url")
        )
    
    return AuditProgress(
        id=audit.id,
        status=audit.status,
        pages_crawled=audit.total_pages_crawled,
        max_pages=audit.max_pages,
        issues_found=audit.total_issues_found,
        current_url=None
    )

@router.post("/{audit_id}/cancel")
def cancel_audit(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    if audit.status in (AuditStatus.PENDING, AuditStatus.RUNNING):
        if audit_id in ACTIVE_CRAWLERS:
            ACTIVE_CRAWLERS[audit_id]["cancelled"] = True
        audit.status = AuditStatus.CANCELLED
        audit.completed_at = datetime.utcnow()
        db.commit()
        return {"message": "Audit cancelled successfully"}

    return {"message": f"Audit is already {audit.status.value}"}

@router.delete("/{audit_id}")
def delete_audit(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    if audit_id in ACTIVE_CRAWLERS:
        ACTIVE_CRAWLERS[audit_id]["cancelled"] = True
        ACTIVE_CRAWLERS.pop(audit_id, None)

    db.delete(audit)
    db.commit()
    return {"message": "Audit deleted successfully"}
