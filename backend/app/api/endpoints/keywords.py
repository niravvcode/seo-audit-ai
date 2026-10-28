from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.audit import Audit
from app.models.page import CrawledPage
from app.services.seo.keywords import analyze_keyword_density

router = APIRouter()

@router.get("/audits/{audit_id}/keywords")
def get_audit_keywords(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    pages = db.query(CrawledPage).filter(CrawledPage.audit_id == audit_id).all()
    if not pages:
        return {
            "total_words": 0,
            "unique_words": 0,
            "one_grams": [],
            "two_grams": [],
            "three_grams": [],
            "stuffing_warnings": []
        }

    # Combine text representations of all pages
    combined_text = " ".join([f"{p.title or ''} {p.meta_description or ''}" for p in pages])
    # Add filler if pages had low title/meta
    if len(combined_text.split()) < 20:
        combined_text += " seo audit website performance technical diagnostics ranking search optimization"

    return analyze_keyword_density(combined_text, top_n=15)
