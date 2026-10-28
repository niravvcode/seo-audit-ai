from typing import List, Dict, Any
from app.models.issue import IssueSeverity, IssueCategory
from app.services.seo.rules import IssueDraft

# Severity penalty deductions
SEVERITY_WEIGHTS = {
    IssueSeverity.CRITICAL: 15.0,
    IssueSeverity.HIGH: 8.0,
    IssueSeverity.MEDIUM: 4.0,
    IssueSeverity.LOW: 1.5,
    IssueSeverity.INFO: 0.0,
}

# Maximum penalty cap per category to avoid a single category wiping out the entire score
CATEGORY_CAPS = {
    IssueCategory.TECHNICAL: 40.0,
    IssueCategory.SECURITY: 35.0,
    IssueCategory.ON_PAGE: 35.0,
    IssueCategory.CONTENT: 25.0,
    IssueCategory.PERFORMANCE: 20.0,
}

def calculate_seo_health_score(issues: List[IssueDraft], total_pages: int = 1) -> Dict[str, Any]:
    """
    Calculates transparent SEO health score:
    - Base: 100 points
    - Weighted deductions per issue severity
    - Deductions grouped and capped per category
    - Normalized across total pages crawled
    Returns:
      {
        "score": float (0-100),
        "deductions_by_category": dict,
        "severity_counts": dict,
        "methodology": str,
        "disclaimer": str
      }
    """
    severity_counts = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0
    }
    
    category_penalties = {
        IssueCategory.TECHNICAL: 0.0,
        IssueCategory.SECURITY: 0.0,
        IssueCategory.ON_PAGE: 0.0,
        IssueCategory.CONTENT: 0.0,
        IssueCategory.PERFORMANCE: 0.0,
    }

    for issue in issues:
        sev = issue.severity
        if sev == IssueSeverity.CRITICAL:
            severity_counts["critical"] += 1
        elif sev == IssueSeverity.HIGH:
            severity_counts["high"] += 1
        elif sev == IssueSeverity.MEDIUM:
            severity_counts["medium"] += 1
        elif sev == IssueSeverity.LOW:
            severity_counts["low"] += 1
        elif sev == IssueSeverity.INFO:
            severity_counts["info"] += 1

        penalty = SEVERITY_WEIGHTS.get(sev, 0.0)
        category_penalties[issue.category] += penalty

    # Apply category caps
    total_deduction = 0.0
    deductions_by_category = {}
    
    for category, raw_penalty in category_penalties.items():
        # Soften penalty if multiple pages diluted
        page_factor = max(1.0, (total_pages ** 0.5))
        normalized_penalty = raw_penalty / page_factor
        capped_penalty = min(CATEGORY_CAPS[category], normalized_penalty)
        deductions_by_category[category.value] = round(capped_penalty, 1)
        total_deduction += capped_penalty

    final_score = max(0.0, min(100.0, 100.0 - total_deduction))

    methodology = (
        "The SEO Health Score starts at 100 and applies weighted deductions based on identified problems "
        f"(Critical: -{SEVERITY_WEIGHTS[IssueSeverity.CRITICAL]} pts, "
        f"High: -{SEVERITY_WEIGHTS[IssueSeverity.HIGH]} pts, "
        f"Medium: -{SEVERITY_WEIGHTS[IssueSeverity.MEDIUM]} pts, "
        f"Low: -{SEVERITY_WEIGHTS[IssueSeverity.LOW]} pts). "
        "Deductions are capped per category to avoid single-area disproportions and normalized across crawled pages."
    )

    disclaimer = (
        "Note: This score is an independent technical audit assessment based on web standards and SEO best practices. "
        "It is not an official Google ranking score."
    )

    return {
        "score": round(final_score, 1),
        "deductions_by_category": deductions_by_category,
        "severity_counts": severity_counts,
        "methodology": methodology,
        "disclaimer": disclaimer,
    }
