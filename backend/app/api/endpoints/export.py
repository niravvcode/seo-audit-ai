from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.audit import Audit
from app.models.issue import SEOIssue
from app.services.reports.csv_exporter import export_audit_to_csv
from app.services.reports.pdf_exporter import export_audit_to_pdf

router = APIRouter()

@router.get("/audits/{audit_id}/export/csv")
def download_audit_csv(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    issues = db.query(SEOIssue).filter(SEOIssue.audit_id == audit_id).all()
    csv_data = export_audit_to_csv(audit, issues)

    domain_slug = audit.website.domain.replace('.', '_') if audit.website else "audit"
    filename = f"seo_audit_{domain_slug}_{audit.id}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/audits/{audit_id}/export/pdf")
def download_audit_pdf(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    issues = db.query(SEOIssue).filter(SEOIssue.audit_id == audit_id).all()
    pdf_bytes = export_audit_to_pdf(audit, issues)

    domain_slug = audit.website.domain.replace('.', '_') if audit.website else "audit"
    filename = f"seo_audit_{domain_slug}_{audit.id}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
