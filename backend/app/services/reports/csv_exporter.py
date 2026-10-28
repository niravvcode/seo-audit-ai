import csv
import io
from typing import List
from app.models.audit import Audit
from app.models.issue import SEOIssue

def export_audit_to_csv(audit: Audit, issues: List[SEOIssue]) -> str:
    """
    Exports audit issues and summary to CSV format.
    """
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)

    # Header section
    writer.writerow(["SEO AUDIT REPORT", audit.website.url if audit.website else ""])
    writer.writerow(["Audit ID", audit.id])
    writer.writerow(["Audit Date", audit.started_at.strftime("%Y-%m-%d %H:%M:%S")])
    writer.writerow(["SEO Health Score", f"{audit.health_score} / 100"])
    writer.writerow(["Pages Crawled", audit.total_pages_crawled])
    writer.writerow(["Total Issues Found", len(issues)])
    writer.writerow([])

    # Table columns
    writer.writerow([
        "Issue ID",
        "Rule ID",
        "Category",
        "Severity",
        "Title",
        "Affected URL",
        "Evidence",
        "Explanation",
        "Why It Matters",
        "Suggested Fix",
        "Estimated Effort",
        "Status"
    ])

    for issue in issues:
        writer.writerow([
            issue.id,
            issue.rule_id,
            issue.category.value if hasattr(issue.category, "value") else str(issue.category),
            issue.severity.value if hasattr(issue.severity, "value") else str(issue.severity),
            issue.title,
            issue.affected_url,
            issue.evidence,
            issue.explanation,
            issue.why_it_matters,
            issue.suggested_fix,
            issue.estimated_effort,
            issue.status.value if hasattr(issue.status, "value") else str(issue.status)
        ])

    return output.getvalue()
