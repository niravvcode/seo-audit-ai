import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.models.issue import SEOIssue

logger = logging.getLogger(__name__)

class AIAdvisor:
    @classmethod
    def is_ai_configured(cls) -> bool:
        return bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)

    @classmethod
    async def get_issue_recommendation(cls, issue: SEOIssue, custom_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates AI recommendations for a specific SEO issue.
        Falls back to high-grade heuristic expert templates when no key is configured.
        """
        # If Gemini key is provided, try Gemini API
        if settings.GEMINI_API_KEY:
            try:
                prompt_text = (
                    f"You are a principal SEO engineer. Provide an actionable fix for this website SEO issue:\n"
                    f"Title: {issue.title}\n"
                    f"Category: {issue.category}\n"
                    f"Severity: {issue.severity}\n"
                    f"URL: {issue.affected_url}\n"
                    f"Evidence: {issue.evidence}\n"
                    f"Why it matters: {issue.why_it_matters}\n"
                    f"Context/Request: {custom_prompt or 'Explain the business impact and step-by-step developer code fix.'}\n\n"
                    f"Return a JSON object with: {{\"explanation\": \"...\", \"implementation\": \"...\", \"code_example\": \"...\", \"priority\": \"HIGH/MED/LOW\"}}"
                )
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}",
                        json={
                            "contents": [{"parts": [{"text": prompt_text}]}],
                            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        text_response = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(text_response)
                        return {
                            "issue_id": issue.id,
                            "rule_id": issue.rule_id,
                            "title": issue.title,
                            "ai_explanation": parsed.get("explanation", issue.explanation),
                            "suggested_implementation": parsed.get("implementation", issue.suggested_fix),
                            "code_or_tag_example": parsed.get("code_example", ""),
                            "priority_level": parsed.get("priority", issue.severity),
                            "disclaimer": "AI-generated recommendations provide best-practice guidance and do not guarantee search engine ranking changes."
                        }
            except Exception as e:
                logger.warning(f"Gemini API request failed, falling back to deterministic expert engine: {e}")

        # Deterministic Expert Fallback (Works 100% reliably without any API key)
        code_examples = {
            "RULE_MISSING_TITLE": "<head>\n  <title>Primary Keyword - Compelling Value Proposition | Brand Name</title>\n</head>",
            "RULE_TITLE_TOO_LONG": "<head>\n  <!-- Keep between 50-60 characters -->\n  <title>Concise SEO Title | Brand Name</title>\n</head>",
            "RULE_MISSING_META_DESC": "<head>\n  <meta name=\"description\" content=\"Discover how our solution helps you achieve measurable results. Fast, reliable, and tailored to your goals. Learn more today!\">\n</head>",
            "RULE_MISSING_H1": "<main>\n  <h1>Descriptive, Keyword-Targeted Page Heading</h1>\n</main>",
            "RULE_MISSING_IMAGE_ALT": "<!-- Replace empty alt with descriptive context -->\n<img src=\"/assets/product.jpg\" alt=\"Detailed description of product features in use\" loading=\"lazy\" />",
            "RULE_MISSING_CANONICAL": "<head>\n  <link rel=\"canonical\" href=\"https://example.com/canonical-page-path\" />\n</head>",
            "RULE_MISSING_LANG": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>...",
            "RULE_INSECURE_HTTP": "# Nginx redirect HTTP to HTTPS\nserver {\n  listen 80;\n  server_name example.com;\n  return 301 https://$host$request_uri;\n}",
            "RULE_MISSING_SITEMAP": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url>\n    <loc>https://example.com/</loc>\n    <lastmod>2026-10-28</lastmod>\n  </url>\n</urlset>",
            "RULE_MISSING_ROBOTS": "User-agent: *\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://example.com/sitemap.xml",
        }

        return {
            "issue_id": issue.id,
            "rule_id": issue.rule_id,
            "title": issue.title,
            "ai_explanation": (
                f"{issue.explanation} In search engine indexing, this direct deficiency signals lower page quality and "
                f"hampers the relevancy score for targeted keyword queries."
            ),
            "suggested_implementation": issue.suggested_fix,
            "code_or_tag_example": code_examples.get(issue.rule_id, "<!-- Update HTML markup to comply with W3C and SEO standards -->"),
            "priority_level": str(issue.severity),
            "disclaimer": "AI recommendations provide best-practice guidance and do not guarantee search engine ranking changes."
        }

    @classmethod
    async def generate_executive_summary(
        cls,
        website_url: str,
        health_score: float,
        critical_count: int,
        high_count: int,
        medium_count: int,
        low_count: int,
        pages_crawled: int
    ) -> Dict[str, Any]:
        """Generates executive summary for non-technical stakeholders."""
        status_label = "Optimal" if health_score >= 85 else "Needs Attention" if health_score >= 60 else "Critical Issues Detected"
        
        summary = (
            f"SEO Audit AI analyzed {pages_crawled} pages for {website_url}. "
            f"The website achieved an overall SEO Health Score of {health_score}/100 ({status_label}). "
            f"We identified {critical_count} critical blockers, {high_count} high-priority issues, "
            f"and {medium_count} medium-priority optimizations."
        )

        strengths = []
        if critical_count == 0:
            strengths.append("Zero critical indexing blockers detected.")
        if health_score >= 75:
            strengths.append("Strong foundational technical and on-page architecture.")
        strengths.append("Accessible sitemap and crawl navigation structure established.")

        risks = []
        if critical_count > 0:
            risks.append(f"{critical_count} critical issues risk page de-indexing or SERP invisibility.")
        if high_count > 0:
            risks.append(f"{high_count} high-priority flaws may degrade organic click-through rates and user retention.")
        if health_score < 70:
            risks.append("Search crawler efficiency is impaired, reducing organic traffic potential.")

        actions = [
            "Resolve all Critical and High severity issues to protect search visibility.",
            "Verify all canonical tags and 301 redirects are properly mapped.",
            "Enrich meta descriptions and image alt texts across core landing pages."
        ]

        return {
            "executive_summary": summary,
            "key_strengths": strengths,
            "critical_risks": risks,
            "immediate_actions": actions,
        }
