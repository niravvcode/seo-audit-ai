import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.models.website import Website
from app.models.audit import Audit, AuditStatus
from app.models.issue import SEOIssue, IssueSeverity, IssueCategory, IssueStatus

from sqlalchemy.pool import StaticPool

# Shared in-memory SQLite engine for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def client():
    return TestClient(app)

def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_start_audit_ssrf_rejection(client):
    response = client.post("/api/v1/audits", json={"url": "http://127.0.0.1:8000"})
    assert response.status_code == 400
    assert "security" in response.json()["detail"].lower() or "prohibited" in response.json()["detail"].lower()

def test_audit_lifecycle_and_issue_management(client):
    # Seed a website and an audit directly in test DB
    db = TestingSessionLocal()
    website = Website(url="https://testsite.com", domain="testsite.com")
    db.add(website)
    db.commit()
    db.refresh(website)

    audit = Audit(
        website_id=website.id,
        status=AuditStatus.COMPLETED,
        health_score=85.0,
        total_pages_crawled=2,
        total_issues_found=1,
        critical_issues_count=0,
        high_issues_count=1,
        medium_issues_count=0,
        low_issues_count=0,
        info_issues_count=0
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    audit_id = audit.id

    issue = SEOIssue(
        audit_id=audit_id,
        rule_id="RULE_MISSING_META_DESC",
        category=IssueCategory.ON_PAGE,
        severity=IssueSeverity.HIGH,
        title="Missing Meta Description",
        affected_url="https://testsite.com",
        evidence="No meta description",
        explanation="Missing meta description tag",
        why_it_matters="Reduces search snippet quality",
        suggested_fix="Add meta description tag",
        estimated_effort="20 mins",
        status=IssueStatus.OPEN
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    issue_id = issue.id
    db.close()

    # 1. List audits
    res_list = client.get("/api/v1/audits")
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1
    assert res_list.json()[0]["website_url"] == "https://testsite.com"

    # 2. Get audit details
    res_detail = client.get(f"/api/v1/audits/{audit_id}")
    assert res_detail.status_code == 200
    assert res_detail.json()["health_score"] == 85.0
    assert len(res_detail.json()["issues"]) == 1

    # 3. Filter issues
    res_issues = client.get(f"/api/v1/audits/{audit_id}/issues?severity=HIGH")
    assert res_issues.status_code == 200
    assert len(res_issues.json()) == 1

    # 4. Update issue status to IN_PROGRESS
    res_patch = client.patch(f"/api/v1/issues/{issue_id}/status", json={"status": "IN_PROGRESS"})
    assert res_patch.status_code == 200
    assert res_patch.json()["status"] == "IN_PROGRESS"

    # 5. Export CSV
    res_csv = client.get(f"/api/v1/audits/{audit_id}/export/csv")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "RULE_MISSING_META_DESC" in res_csv.text

    # 6. Export PDF
    res_pdf = client.get(f"/api/v1/audits/{audit_id}/export/pdf")
    assert res_pdf.status_code == 200
    assert "application/pdf" in res_pdf.headers["content-type"]
    assert res_pdf.content.startswith(b"%PDF")

    # 7. AI Recommendation
    res_ai = client.post("/api/v1/ai/recommendation", json={"issue_id": issue_id})
    assert res_ai.status_code == 200
    assert "suggested_implementation" in res_ai.json()
