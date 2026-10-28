import pytest
from app.models.issue import IssueSeverity, IssueCategory
from app.services.seo.rules import IssueDraft
from app.services.seo.scoring import calculate_seo_health_score

def test_perfect_score_when_no_issues():
    result = calculate_seo_health_score([])
    assert result["score"] == 100.0
    assert result["severity_counts"]["critical"] == 0

def test_score_penalties_applied():
    issues = [
        IssueDraft(
            rule_id="RULE_MISSING_TITLE",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.CRITICAL,
            title="Missing Title",
            affected_url="https://example.com",
            evidence="",
            explanation="",
            why_it_matters="",
            suggested_fix=""
        ),
        IssueDraft(
            rule_id="RULE_MISSING_META_DESC",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.HIGH,
            title="Missing Meta Desc",
            affected_url="https://example.com",
            evidence="",
            explanation="",
            why_it_matters="",
            suggested_fix=""
        )
    ]
    result = calculate_seo_health_score(issues, total_pages=1)
    assert result["score"] < 100.0
    assert result["severity_counts"]["critical"] == 1
    assert result["severity_counts"]["high"] == 1
    assert "methodology" in result
    assert "disclaimer" in result

def test_score_never_drops_below_zero():
    many_issues = [
        IssueDraft(
            rule_id=f"RULE_{i}",
            category=IssueCategory.TECHNICAL,
            severity=IssueSeverity.CRITICAL,
            title=f"Critical {i}",
            affected_url="https://example.com",
            evidence="",
            explanation="",
            why_it_matters="",
            suggested_fix=""
        )
        for i in range(50)
    ]
    result = calculate_seo_health_score(many_issues, total_pages=1)
    assert result["score"] >= 0.0
