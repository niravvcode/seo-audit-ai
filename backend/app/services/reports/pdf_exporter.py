import io
from typing import List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from app.models.audit import Audit
from app.models.issue import SEOIssue

def export_audit_to_pdf(audit: Audit, issues: List[SEOIssue]) -> bytes:
    """
    Generates a PDF audit report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1E293B')
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#64748B')
    )
    section_style = ParagraphStyle(
        'SectionHead',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#2563EB'),
        spaceAfter=6,
        spaceBefore=14
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    code_style = ParagraphStyle(
        'DocCode',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0F172A'),
        backColor=colors.HexColor('#F1F5F9'),
        borderPadding=4
    )

    story = []

    # Title & Metadata
    site_url = audit.website.url if audit.website else "Website"
    story.append(Paragraph("SEO Audit AI - Technical & On-Page Audit Report", title_style))
    story.append(Spacer(1, 4))
    audit_date = audit.started_at.strftime("%B %d, %Y - %H:%M UTC")
    story.append(Paragraph(f"Audited Target: <b>{site_url}</b> | Date: {audit_date}", subtitle_style))
    story.append(Spacer(1, 14))

    # Executive Health Score Box
    score_color = '#10B981' if audit.health_score >= 80 else '#F59E0B' if audit.health_score >= 50 else '#EF4444'
    score_data = [
        [
            Paragraph(f"<font size=28 color='{score_color}'><b>{audit.health_score:.1f}</b></font><br/><font size=10 color='#64748B'>Health Score (out of 100)</font>", body_style),
            Paragraph(
                f"<b>Pages Analyzed:</b> {audit.total_pages_crawled}<br/>"
                f"<b>Total Issues Found:</b> {len(issues)}<br/>"
                f"<b>Audit Status:</b> {audit.status.value if hasattr(audit.status, 'value') else audit.status}",
                body_style
            )
        ]
    ]
    score_table = Table(score_data, colWidths=[200, 340])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 12))

    # Severity Breakdown Table
    story.append(Paragraph("Issue Severity Distribution", section_style))
    sev_data = [
        ["Severity", "Count", "Priority Level", "Recommended Action"],
        ["CRITICAL", str(audit.critical_issues_count), "Urgent", "Fix immediately to prevent de-indexing or ranking drop"],
        ["HIGH", str(audit.high_issues_count), "High", "Address within 1-2 sprints to improve search ranking"],
        ["MEDIUM", str(audit.medium_issues_count), "Moderate", "Optimize for enhanced user experience and crawl budget"],
        ["LOW", str(audit.low_issues_count), "Minor", "Routine clean-up for strict HTML/SEO hygiene"],
        ["INFO", str(audit.info_issues_count), "Review", "Review recommendations and content best practices"],
    ]
    sev_table = Table(sev_data, colWidths=[80, 50, 90, 320])
    sev_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563EB')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
    ]))
    story.append(sev_table)
    story.append(Spacer(1, 14))

    # Methodology Note
    story.append(Paragraph("Methodology & Scoring Transparency", section_style))
    method_text = (
        "The SEO Health Score evaluates technical compliance, indexability, security, content hierarchy, and speed. "
        "Weighted penalties are applied for each severity level and capped by category. This score reflects standard "
        "search bot accessibility and W3C standards; it is not Google's proprietary algorithm score."
    )
    story.append(Paragraph(method_text, body_style))
    story.append(Spacer(1, 14))

    # Detailed Prioritized Findings
    story.append(Paragraph("Prioritized Audit Findings & Remediation Plan", section_style))

    if not issues:
        story.append(Paragraph("No SEO issues were detected during this crawl. Excellent work!", body_style))
    else:
        # Sort issues: Critical -> High -> Medium -> Low -> Info
        order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "INFO": 4}
        sorted_issues = sorted(
            issues,
            key=lambda x: order.get(x.severity.value if hasattr(x.severity, 'value') else str(x.severity), 5)
        )

        for idx, issue in enumerate(sorted_issues[:35], start=1):
            sev_str = issue.severity.value if hasattr(issue.severity, 'value') else str(issue.severity)
            sev_color = '#DC2626' if sev_str == 'CRITICAL' else '#EA580C' if sev_str == 'HIGH' else '#D97706' if sev_str == 'MEDIUM' else '#2563EB'

            issue_header = f"<b>{idx}. [{sev_str}] {issue.title}</b>"
            story.append(Paragraph(f"<font color='{sev_color}'>{issue_header}</font>", body_style))
            
            detail_p = (
                f"<b>URL:</b> {issue.affected_url}<br/>"
                f"<b>Evidence:</b> {issue.evidence}<br/>"
                f"<b>Why it matters:</b> {issue.why_it_matters}<br/>"
                f"<b>Recommended Fix:</b> {issue.suggested_fix}<br/>"
                f"<b>Estimated Effort:</b> {issue.estimated_effort} | <b>Status:</b> {issue.status.value if hasattr(issue.status, 'value') else issue.status}"
            )
            story.append(Paragraph(detail_p, body_style))
            story.append(Spacer(1, 8))

    doc.build(story)
    return buffer.getvalue()
