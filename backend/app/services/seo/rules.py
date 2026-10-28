import hashlib
import re
from typing import List, Optional, Dict, Any
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from app.models.issue import IssueSeverity, IssueCategory

class IssueDraft:
    def __init__(
        self,
        rule_id: str,
        category: IssueCategory,
        severity: IssueSeverity,
        title: str,
        affected_url: str,
        evidence: str,
        explanation: str,
        why_it_matters: str,
        suggested_fix: str,
        estimated_effort: str = "15-30 mins"
    ):
        self.rule_id = rule_id
        self.category = category
        self.severity = severity
        self.title = title
        self.affected_url = affected_url
        self.evidence = evidence
        self.explanation = explanation
        self.why_it_matters = why_it_matters
        self.suggested_fix = suggested_fix
        self.estimated_effort = estimated_effort

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "category": self.category,
            "severity": self.severity,
            "title": self.title,
            "affected_url": self.affected_url,
            "evidence": self.evidence,
            "explanation": self.explanation,
            "why_it_matters": self.why_it_matters,
            "suggested_fix": self.suggested_fix,
            "estimated_effort": self.estimated_effort,
        }

# 1. Missing page title
def check_missing_title(soup: BeautifulSoup, url: str) -> Optional[IssueDraft]:
    title_tag = soup.find("title")
    if not title_tag or not title_tag.string or not title_tag.string.strip():
        return IssueDraft(
            rule_id="RULE_MISSING_TITLE",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.CRITICAL,
            title="Missing Page Title",
            affected_url=url,
            evidence="No <title> tag found or title element is completely empty.",
            explanation="The page lacks a <title> element in the HTML <head>.",
            why_it_matters="Search engines rely on page titles as the primary anchor for search snippets and ranking signals.",
            suggested_fix="Add an informative, unique <title> tag (50-60 characters) inside the <head> section.",
            estimated_effort="15 mins"
        )
    return None

# 2. Empty or excessively long title
def check_title_length(soup: BeautifulSoup, url: str) -> Optional[IssueDraft]:
    title_tag = soup.find("title")
    if not title_tag or not title_tag.string:
        return None
    title_text = title_tag.string.strip()
    length = len(title_text)
    if length < 10:
        return IssueDraft(
            rule_id="RULE_TITLE_TOO_SHORT",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.LOW,
            title="Page Title Too Short",
            affected_url=url,
            evidence=f"Title is only {length} characters: \"{title_text}\"",
            explanation="The title is under 10 characters and lacks descriptive keywords.",
            why_it_matters="Short titles fail to communicate page relevance to users and search bots.",
            suggested_fix="Expand the title to 40-60 characters including your brand and primary topic keyword.",
            estimated_effort="15 mins"
        )
    elif length > 65:
        return IssueDraft(
            rule_id="RULE_TITLE_TOO_LONG",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.MEDIUM,
            title="Page Title Too Long (Truncated in SERPs)",
            affected_url=url,
            evidence=f"Title has {length} characters: \"{title_text}\"",
            explanation="The title exceeds 65 characters and is likely truncated in Google search results.",
            why_it_matters="Truncated titles harm click-through rates and can obscure important keyword branding.",
            suggested_fix="Condense the title to between 50 and 60 characters to fit desktop and mobile displays.",
            estimated_effort="15 mins"
        )
    return None

# 4. Missing meta description
def check_missing_meta_description(soup: BeautifulSoup, url: str) -> Optional[IssueDraft]:
    meta_desc = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    content = meta_desc.get("content", "").strip() if meta_desc else ""
    if not meta_desc or not content:
        return IssueDraft(
            rule_id="RULE_MISSING_META_DESC",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.HIGH,
            title="Missing Meta Description",
            affected_url=url,
            evidence="No <meta name=\"description\"> tag or empty content attribute.",
            explanation="The page does not have a meta description specified.",
            why_it_matters="Search engines often use the meta description for the preview snippet beneath the title in search results.",
            suggested_fix="Add a concise, compelling meta description between 120 and 155 characters summarizing the page.",
            estimated_effort="20 mins"
        )
    return None

# 5. Empty or excessively long meta description
def check_meta_description_length(soup: BeautifulSoup, url: str) -> Optional[IssueDraft]:
    meta_desc = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    if not meta_desc:
        return None
    content = meta_desc.get("content", "").strip()
    if not content:
        return None
    length = len(content)
    if length < 50:
        return IssueDraft(
            rule_id="RULE_META_DESC_TOO_SHORT",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.LOW,
            title="Meta Description Too Short",
            affected_url=url,
            evidence=f"Meta description is only {length} characters: \"{content}\"",
            explanation="Meta description is below recommended 50-character threshold.",
            why_it_matters="Very short meta descriptions underutilize SERP real estate to entice searchers.",
            suggested_fix="Expand the meta description to 120-155 characters highlighting the value proposition.",
            estimated_effort="15 mins"
        )
    elif length > 165:
        return IssueDraft(
            rule_id="RULE_META_DESC_TOO_LONG",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.LOW,
            title="Meta Description Too Long",
            affected_url=url,
            evidence=f"Meta description length is {length} characters: \"{content[:80]}...\"",
            explanation="Meta description exceeds 165 characters and may be clipped in search results.",
            why_it_matters="Clipped descriptions can trail off with an ellipsis, hiding important calls to action.",
            suggested_fix="Shorten to under 160 characters while retaining key keywords and call to action.",
            estimated_effort="15 mins"
        )
    return None

# 6. Missing H1 heading
# 7. Multiple H1 headings (reported as review recommendation)
def check_h1_headings(soup: BeautifulSoup, url: str) -> List[IssueDraft]:
    issues = []
    h1_tags = soup.find_all("h1")
    count = len(h1_tags)
    if count == 0:
        issues.append(IssueDraft(
            rule_id="RULE_MISSING_H1",
            category=IssueCategory.CONTENT,
            severity=IssueSeverity.HIGH,
            title="Missing H1 Heading",
            affected_url=url,
            evidence="Page has 0 <h1> elements.",
            explanation="No main heading (<h1>) was detected on this page.",
            why_it_matters="The H1 tag communicates the page's primary subject matter to users and web crawlers.",
            suggested_fix="Add a single, descriptive <h1> heading that clearly describes the page content.",
            estimated_effort="20 mins"
        ))
    elif count > 1:
        headings_preview = "; ".join([h.get_text().strip()[:40] for h in h1_tags[:3]])
        issues.append(IssueDraft(
            rule_id="RULE_MULTIPLE_H1",
            category=IssueCategory.CONTENT,
            severity=IssueSeverity.INFO,
            title="Multiple H1 Headings Detected (Review Recommendation)",
            affected_url=url,
            evidence=f"Found {count} <h1> headings: [{headings_preview}]",
            explanation="Multiple <h1> tags were found. While HTML5 allows multiple section roots, standard SEO best practice recommends a single primary H1 per page.",
            why_it_matters="A single H1 provides clear thematic hierarchy for screen readers and search engines.",
            suggested_fix="Review headings and consider converting secondary H1s into H2s or H3s.",
            estimated_effort="20 mins"
        ))
    return issues

# 8. Poor heading hierarchy
def check_heading_hierarchy(soup: BeautifulSoup, url: str) -> Optional[IssueDraft]:
    headings = soup.find_all(re.compile(r"^h[1-6]$"))
    levels = [int(h.name[1]) for h in headings]
    
    # Check if a level is skipped, e.g. H1 followed directly by H3 without H2, or H2 skipped to H4
    skipped = []
    for i in range(1, len(levels)):
        prev = levels[i - 1]
        curr = levels[i]
        if curr > prev + 1:
            skipped.append(f"H{prev} jumped to H{curr}")
    
    if skipped:
        return IssueDraft(
            rule_id="RULE_HEADING_HIERARCHY",
            category=IssueCategory.CONTENT,
            severity=IssueSeverity.LOW,
            title="Poor Heading Hierarchy (Skipped Heading Level)",
            affected_url=url,
            evidence=f"Heading progression anomaly: {', '.join(skipped[:2])}",
            explanation="The document skips heading levels in its structure (for example, stepping from H1 to H3 without an intervening H2).",
            why_it_matters="Illogical heading nesting confuses screen readers and weakens semantic document outlines.",
            suggested_fix="Adjust the heading levels sequentially (H1 -> H2 -> H3) to maintain proper document outline.",
            estimated_effort="30 mins"
        )
    return None

# 10. HTTP error responses
def check_http_status(status_code: Optional[int], url: str, error_message: Optional[str]) -> Optional[IssueDraft]:
    if error_message:
        return IssueDraft(
            rule_id="RULE_CRAWL_ERROR",
            category=IssueCategory.TECHNICAL,
            severity=IssueSeverity.CRITICAL,
            title="Page Request Failed",
            affected_url=url,
            evidence=f"Crawl error: {error_message}",
            explanation="The crawler could not successfully retrieve this page.",
            why_it_matters="Search engines cannot index or rank pages they cannot reliably fetch.",
            suggested_fix="Check web server configuration, DNS records, and SSL certificate.",
            estimated_effort="1 hour"
        )
    if status_code and status_code >= 400:
        severity = IssueSeverity.CRITICAL if status_code in (404, 500, 502, 503) else IssueSeverity.HIGH
        return IssueDraft(
            rule_id="RULE_HTTP_ERROR",
            category=IssueCategory.TECHNICAL,
            severity=severity,
            title=f"HTTP {status_code} Error Response",
            affected_url=url,
            evidence=f"Server returned status code {status_code}.",
            explanation=f"Request returned HTTP {status_code} client or server error.",
            why_it_matters="Broken or crashing pages frustrate visitors and lead search engines to de-index affected URLs.",
            suggested_fix="Fix the broken link or configure a 301 redirect if the page has moved permanently.",
            estimated_effort="30 mins"
        )
    return None

# 11. Missing image alt attributes
def check_image_alts(soup: BeautifulSoup, url: str) -> Optional[IssueDraft]:
    images = soup.find_all("img")
    missing_alts = []
    for img in images:
        src = img.get("src", "unnamed image")
        alt = img.get("alt")
        if alt is None or (alt.strip() == "" and img.get("role") != "presentation" and not img.get("aria-hidden")):
            missing_alts.append(src[:60])
            
    if missing_alts:
        count = len(missing_alts)
        preview = ", ".join(missing_alts[:3])
        return IssueDraft(
            rule_id="RULE_MISSING_IMAGE_ALT",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.MEDIUM,
            title=f"Missing Image Alt Attributes ({count} images)",
            affected_url=url,
            evidence=f"{count} image(s) lack an alt attribute: [{preview}]",
            explanation="Images were found without descriptive alternative text (`alt` attribute).",
            why_it_matters="Image alt tags are essential for accessibility screen readers and allow images to rank in Google Images.",
            suggested_fix="Add descriptive, keyword-relevant alt attributes to every content image. Use alt=\"\" only for decorative images.",
            estimated_effort="30 mins"
        )
    return None

# 12. Missing or invalid canonical URLs
def check_canonical(soup: BeautifulSoup, url: str) -> Optional[IssueDraft]:
    canonical_tag = soup.find("link", rel=lambda val: val and "canonical" in val.lower())
    if not canonical_tag or not canonical_tag.get("href"):
        return IssueDraft(
            rule_id="RULE_MISSING_CANONICAL",
            category=IssueCategory.TECHNICAL,
            severity=IssueSeverity.MEDIUM,
            title="Missing Canonical URL Tag",
            affected_url=url,
            evidence="No <link rel=\"canonical\"> found in page <head>.",
            explanation="The page lacks a self-referential or canonical link tag.",
            why_it_matters="Canonical tags specify the authoritative URL for identical or duplicate content, preventing duplicate content penalties.",
            suggested_fix="Add `<link rel=\"canonical\" href=\"https://example.com/current-page\" />` in the <head>.",
            estimated_effort="15 mins"
        )
    href = canonical_tag.get("href", "").strip()
    if not href.startswith("http://") and not href.startswith("https://"):
        return IssueDraft(
            rule_id="RULE_RELATIVE_CANONICAL",
            category=IssueCategory.TECHNICAL,
            severity=IssueSeverity.LOW,
            title="Relative Canonical URL Found",
            affected_url=url,
            evidence=f"Canonical href is relative: \"{href}\"",
            explanation="The canonical link uses a relative path rather than an absolute URL.",
            why_it_matters="Google recommends absolute URLs for canonical tags to avoid misinterpretation.",
            suggested_fix="Update the canonical tag to use an absolute HTTPS URL.",
            estimated_effort="10 mins"
        )
    return None

# 13. Redirect chains and redirect errors
def check_redirect_chain(redirect_chain: List[str], url: str) -> Optional[IssueDraft]:
    if not redirect_chain:
        return None
    chain_length = len(redirect_chain)
    if chain_length >= 2:
        chain_str = " -> ".join(redirect_chain[:3])
        return IssueDraft(
            rule_id="RULE_REDIRECT_CHAIN",
            category=IssueCategory.TECHNICAL,
            severity=IssueSeverity.MEDIUM,
            title=f"Redirect Chain Detected ({chain_length} hops)",
            affected_url=url,
            evidence=f"Chain: {chain_str}",
            explanation=f"The URL underwent {chain_length} consecutive redirects before reaching its final destination.",
            why_it_matters="Redirect chains waste crawl budget, slow page load times, and degrade link equity transfer.",
            suggested_fix="Update incoming links to point directly to the final destination URL.",
            estimated_effort="20 mins"
        )
    return None

# 14. Missing or inaccessible sitemap
def check_sitemap_status(is_accessible: bool, site_url: str) -> Optional[IssueDraft]:
    if not is_accessible:
        return IssueDraft(
            rule_id="RULE_MISSING_SITEMAP",
            category=IssueCategory.TECHNICAL,
            severity=IssueSeverity.MEDIUM,
            title="Missing or Inaccessible XML Sitemap",
            affected_url=urljoin(site_url, "/sitemap.xml"),
            evidence="Could not locate or parse /sitemap.xml",
            explanation="The XML sitemap at /sitemap.xml was not found or returned an invalid response.",
            why_it_matters="Sitemaps guide search engine bots to discover and index newly published and updated pages efficiently.",
            suggested_fix="Generate an XML sitemap and place it at /sitemap.xml, then submit it to Google Search Console.",
            estimated_effort="45 mins"
        )
    return None

# 15. Robots.txt accessibility and applicable directives
def check_robots_txt_status(is_accessible: bool, site_url: str) -> Optional[IssueDraft]:
    if not is_accessible:
        return IssueDraft(
            rule_id="RULE_MISSING_ROBOTS",
            category=IssueCategory.TECHNICAL,
            severity=IssueSeverity.LOW,
            title="Robots.txt Missing or Inaccessible",
            affected_url=urljoin(site_url, "/robots.txt"),
            evidence="No /robots.txt file detected on host.",
            explanation="The website does not serve a robots.txt file.",
            why_it_matters="Robots.txt informs web crawlers which areas of the site to crawl and provides sitemap locations.",
            suggested_fix="Create a valid /robots.txt file defining User-agent rules and Sitemap reference.",
            estimated_effort="20 mins"
        )
    return None

# 16. HTTP instead of HTTPS
def check_https(url: str) -> Optional[IssueDraft]:
    if url.lower().startswith("http://"):
        return IssueDraft(
            rule_id="RULE_INSECURE_HTTP",
            category=IssueCategory.SECURITY,
            severity=IssueSeverity.HIGH,
            title="Insecure HTTP Protocol Used",
            affected_url=url,
            evidence=f"URL uses unencrypted 'http://' scheme: {url}",
            explanation="The page is served over unencrypted HTTP instead of HTTPS.",
            why_it_matters="HTTPS is an official Google ranking signal and prevents man-in-the-middle snooping. Browsers mark HTTP as 'Not Secure'.",
            suggested_fix="Install an SSL/TLS certificate and configure a site-wide 301 redirect from HTTP to HTTPS.",
            estimated_effort="1 hour"
        )
    return None

# 17. Mixed content where detectable
def check_mixed_content(soup: BeautifulSoup, url: str) -> Optional[IssueDraft]:
    if not url.lower().startswith("https://"):
        return None
    insecure_assets = []
    # Check script src, link href (stylesheets), img src, iframe src
    for tag, attr in [("script", "src"), ("link", "href"), ("img", "src"), ("iframe", "src")]:
        for el in soup.find_all(tag):
            val = el.get(attr, "")
            if val.lower().startswith("http://"):
                insecure_assets.append(f"<{tag} {attr}='{val[:50]}...'>")
    if insecure_assets:
        count = len(insecure_assets)
        preview = ", ".join(insecure_assets[:2])
        return IssueDraft(
            rule_id="RULE_MIXED_CONTENT",
            category=IssueCategory.SECURITY,
            severity=IssueSeverity.HIGH,
            title=f"Mixed Content Detected ({count} HTTP assets on HTTPS)",
            affected_url=url,
            evidence=f"Found {count} insecure asset references: {preview}",
            explanation="The page is loaded over HTTPS but references subresources (images, scripts, or styles) over unencrypted HTTP.",
            why_it_matters="Modern browsers block mixed active content and warn users, damaging credibility and conversion rates.",
            suggested_fix="Update all asset links to relative paths or explicit https:// URLs.",
            estimated_effort="30 mins"
        )
    return None

# 19. Missing HTML language declaration
def check_html_lang(soup: BeautifulSoup, url: str) -> Optional[IssueDraft]:
    html_tag = soup.find("html")
    if not html_tag or not html_tag.get("lang") or not html_tag.get("lang").strip():
        return IssueDraft(
            rule_id="RULE_MISSING_LANG",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.LOW,
            title="Missing HTML Language Declaration",
            affected_url=url,
            evidence="<html> tag lacks a valid lang attribute.",
            explanation="The root <html> tag does not define the natural language of the document (e.g., lang=\"en\").",
            why_it_matters="Assistive technologies (screen readers) rely on the lang attribute for correct pronunciation and translation.",
            suggested_fix="Add the appropriate language code to the html tag, e.g. <html lang=\"en\">.",
            estimated_effort="10 mins"
        )
    return None

# 21. Open Graph & Social Card tags
def check_open_graph_tags(soup: BeautifulSoup, url: str) -> List[IssueDraft]:
    issues = []
    og_title = soup.find("meta", property=lambda val: val and val.lower() == "og:title")
    og_image = soup.find("meta", property=lambda val: val and val.lower() == "og:image")
    twitter_card = soup.find("meta", attrs={"name": re.compile(r"^twitter:card$", re.I)})

    if not og_title or not og_title.get("content"):
        issues.append(IssueDraft(
            rule_id="RULE_MISSING_OG_TITLE",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.MEDIUM,
            title="Missing Open Graph Title (og:title)",
            affected_url=url,
            evidence="No <meta property=\"og:title\"> found.",
            explanation="The page lacks an Open Graph title tag.",
            why_it_matters="Social platforms (LinkedIn, Facebook, WhatsApp) use og:title to create rich link preview cards when shared.",
            suggested_fix="Add <meta property=\"og:title\" content=\"Your Page Title\" /> in the <head>.",
            estimated_effort="15 mins"
        ))

    if not og_image or not og_image.get("content"):
        issues.append(IssueDraft(
            rule_id="RULE_MISSING_OG_IMAGE",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.MEDIUM,
            title="Missing Social Share Image (og:image)",
            affected_url=url,
            evidence="No <meta property=\"og:image\"> found.",
            explanation="The page lacks an Open Graph preview image.",
            why_it_matters="Shared links without images have significantly lower click-through rates and engagement across social feeds.",
            suggested_fix="Add <meta property=\"og:image\" content=\"https://example.com/share-card.jpg\" /> (recommended 1200x630 px).",
            estimated_effort="20 mins"
        ))

    if not twitter_card or not twitter_card.get("content"):
        issues.append(IssueDraft(
            rule_id="RULE_MISSING_TWITTER_CARD",
            category=IssueCategory.ON_PAGE,
            severity=IssueSeverity.LOW,
            title="Missing Twitter Card Declaration",
            affected_url=url,
            evidence="No <meta name=\"twitter:card\"> tag found.",
            explanation="The page does not specify a Twitter card presentation format.",
            why_it_matters="Twitter/X uses this tag to render large visual preview cards (e.g. summary_large_image).",
            suggested_fix="Add <meta name=\"twitter:card\" content=\"summary_large_image\"> in the <head>.",
            estimated_effort="10 mins"
        ))

    return issues

# 20. Basic response-time observations
def check_response_time(response_time_ms: float, url: str) -> Optional[IssueDraft]:
    if response_time_ms > 3000:
        return IssueDraft(
            rule_id="RULE_VERY_SLOW_RESPONSE",
            category=IssueCategory.PERFORMANCE,
            severity=IssueSeverity.HIGH,
            title="Critical Page Latency (> 3.0s)",
            affected_url=url,
            evidence=f"Server response time was {response_time_ms:.0f} ms.",
            explanation="Page response time exceeded 3 seconds during crawling.",
            why_it_matters="Slow response times increase bounce rates and negatively impact Core Web Vitals (TTFB/LCP).",
            suggested_fix="Implement server-side caching, optimize database queries, or use a Content Delivery Network (CDN).",
            estimated_effort="2-4 hours"
        )
    elif response_time_ms > 1500:
        return IssueDraft(
            rule_id="RULE_SLOW_RESPONSE",
            category=IssueCategory.PERFORMANCE,
            severity=IssueSeverity.MEDIUM,
            title="Slow Server Response Time (> 1.5s)",
            affected_url=url,
            evidence=f"Server response time was {response_time_ms:.0f} ms.",
            explanation="Page response time is between 1.5s and 3.0s.",
            why_it_matters="Fast TTFB is recommended by Google (<800ms) for optimal user experience and crawl efficiency.",
            suggested_fix="Enable gzip/brotli compression, optimize backend code, and leverage edge caching.",
            estimated_effort="1-2 hours"
        )
    return None

# Cross-page check 3: Duplicate title tags across pages
def check_duplicate_titles(page_titles: Dict[str, List[str]]) -> List[IssueDraft]:
    issues = []
    for title, urls in page_titles.items():
        if len(urls) > 1 and len(title.strip()) > 5:
            preview_urls = ", ".join(urls[:2])
            for u in urls:
                issues.append(IssueDraft(
                    rule_id="RULE_DUPLICATE_TITLE",
                    category=IssueCategory.ON_PAGE,
                    severity=IssueSeverity.HIGH,
                    title="Duplicate Page Title Across Multiple Pages",
                    affected_url=u,
                    evidence=f"Title \"{title[:50]}\" is shared by {len(urls)} pages ({preview_urls})",
                    explanation=f"This title is shared verbatim across {len(urls)} different pages.",
                    why_it_matters="Duplicate titles create keyword cannibalization and force search engines to guess which page to rank.",
                    suggested_fix="Craft unique, specific title tags for each indexed page.",
                    estimated_effort="30 mins"
                ))
    return issues

# Cross-page check 18: Duplicate or near-duplicate content
def check_duplicate_content(content_hashes: Dict[str, List[str]]) -> List[IssueDraft]:
    issues = []
    for chash, urls in content_hashes.items():
        if len(urls) > 1 and chash:
            preview_urls = ", ".join(urls[:2])
            for u in urls:
                issues.append(IssueDraft(
                    rule_id="RULE_DUPLICATE_CONTENT",
                    category=IssueCategory.CONTENT,
                    severity=IssueSeverity.HIGH,
                    title="Duplicate Page Content Detected",
                    affected_url=u,
                    evidence=f"Page body hash {chash[:8]} is shared with {len(urls)-1} other page(s) ({preview_urls})",
                    explanation="Multiple pages on the website contain essentially identical body content.",
                    why_it_matters="Duplicate content dilutes search ranking signals and can lead search engines to filter duplicate pages.",
                    suggested_fix="Consolidate duplicate pages, implement 301 redirects, or set rel=\"canonical\" to the primary version.",
                    estimated_effort="1-2 hours"
                ))
    return issues

# Cross-page check 9: Broken internal links
def check_broken_internal_links(crawled_urls: Dict[str, int], discovered_links: Dict[str, List[str]]) -> List[IssueDraft]:
    issues = []
    for source_url, links in discovered_links.items():
        for link in set(links):
            status = crawled_urls.get(link)
            if status and status >= 400:
                issues.append(IssueDraft(
                    rule_id="RULE_BROKEN_INTERNAL_LINK",
                    category=IssueCategory.TECHNICAL,
                    severity=IssueSeverity.HIGH,
                    title=f"Broken Internal Link to {link}",
                    affected_url=source_url,
                    evidence=f"Links to internal URL '{link}' which returns HTTP {status}.",
                    explanation=f"An internal hyperlink on this page leads to a dead link returning HTTP status {status}.",
                    why_it_matters="Broken internal links create dead ends for visitors, leak link equity, and harm crawl navigation.",
                    suggested_fix="Update the hyperlink href attribute or restore the target page.",
                    estimated_effort="15 mins"
                ))
    return issues
