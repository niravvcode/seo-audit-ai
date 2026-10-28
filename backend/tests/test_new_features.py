import pytest
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
import app.models
from app.services.seo.keywords import analyze_keyword_density
from app.services.seo.pagespeed import PageSpeedService
from app.api.endpoints.schedules import create_schedule, list_schedules, delete_schedule, ScheduleCreate
from app.models.schedule import ScheduleFrequency

# Shared in-memory SQLite engine for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_keyword_density_analyzer():
    sample_text = (
        "seo audit website performance seo audit rankings search engine search engine "
        "optimization seo audit tools diagnostics analysis"
    )
    result = analyze_keyword_density(sample_text)
    assert result["total_words"] > 0
    assert len(result["one_grams"]) > 0
    top_word = result["one_grams"][0]["keyword"]
    assert top_word in ("seo", "audit")

def test_keyword_stuffing_warning():
    spam_text = "discount " * 20 + " normal words here today for everyone"
    result = analyze_keyword_density(spam_text)
    assert len(result["stuffing_warnings"]) >= 1
    assert result["stuffing_warnings"][0]["keyword"] == "discount"

def test_pagespeed_service_parse_and_synthetic():
    mock_payload = {
        "lighthouseResult": {
            "categories": {"performance": {"score": 0.94}},
            "audits": {
                "largest-contentful-paint": {"displayValue": "1.3 s"},
                "first-contentful-paint": {"displayValue": "0.7 s"},
                "cumulative-layout-shift": {"displayValue": "0.01"},
                "total-blocking-time": {"displayValue": "35 ms"},
                "speed-index": {"displayValue": "1.0 s"}
            }
        }
    }
    parsed = PageSpeedService.parse_lighthouse_result(mock_payload, strategy="desktop")
    assert parsed["performance_score"] == 94
    assert parsed["metrics"]["lcp"]["status"] == "good"
    assert parsed["metrics"]["cls"]["value"] == "0.01"

    synthetic = PageSpeedService.get_synthetic_vitals("mobile")
    assert synthetic["performance_score"] == 88
    assert "lcp" in synthetic["metrics"]

def test_schedules_crud(db_session):
    with patch("app.api.endpoints.schedules.validate_target_url", return_value=(True, "")):
        req = ScheduleCreate(
            target_url="https://example.com",
            email="user@example.com",
            frequency=ScheduleFrequency.WEEKLY
        )
        created = create_schedule(req, db_session)
        assert created.id is not None
        assert created.target_url == "https://example.com"
        assert created.email == "user@example.com"

        items = list_schedules(db_session)
        assert len(items) == 1
        assert items[0].id == created.id

        del_res = delete_schedule(created.id, db_session)
        assert "removed" in del_res["message"]

        remaining = list_schedules(db_session)
        assert len(remaining) == 0
