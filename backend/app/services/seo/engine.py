import hashlib
import re
from typing import List, Dict, Any, Tuple
from bs4 import BeautifulSoup

from app.services.crawler.crawler import CrawledResult
from app.services.seo.rules import (
    IssueDraft,
    check_missing_title,
    check_title_length,
    check_missing_meta_description,
    check_meta_description_length,
    check_h1_headings,
    check_heading_hierarchy,
    check_http_status,
    check_image_alts,
    check_canonical,
    check_redirect_chain,
    check_sitemap_status,
    check_robots_txt_status,
    check_https,
    check_mixed_content,
    check_html_lang,
    check_response_time,
    check_duplicate_titles,
    check_duplicate_content,
    check_broken_internal_links,
    check_open_graph_tags,
)
from app.services.seo.scoring import calculate_seo_health_score

class PageAnalysisData:
    def __init__(
        self,
        url: str,
        status_code: int | None,
        response_time_ms: float,
        depth: int,
        title: str | None = None,
        meta_description: str | None = None,
        h1_count: int = 0,
        content_hash: str | None = None,
        word_count: int = 0,
        error_message: str | None = None,
        issues: List[IssueDraft] | None = None,
        social_metadata: Dict[str, str] | None = None,
        body_text: str = ""
    ):
        self.url = url
        self.status_code = status_code
        self.response_time_ms = response_time_ms
        self.depth = depth
        self.title = title
        self.meta_description = meta_description
        self.h1_count = h1_count
        self.content_hash = content_hash
        self.word_count = word_count
        self.error_message = error_message
        self.issues = issues or []
        self.social_metadata = social_metadata or {}
        self.body_text = body_text

class SEOEngine:
    @staticmethod
    def _compute_content_hash(text: str) -> str:
        cleaned = re.sub(r"\s+", " ", text).strip().lower()
        if len(cleaned) < 50:
            return ""
        return hashlib.md5(cleaned.encode("utf-8")).hexdigest()

    @classmethod
    def analyze_crawl(
        cls,
        crawled_results: List[CrawledResult],
        start_url: str,
        sitemap_accessible: bool,
        robots_accessible: bool
    ) -> Tuple[List[PageAnalysisData], List[IssueDraft], Dict[str, Any]]:
        page_analyses: List[PageAnalysisData] = []
        all_issues: List[IssueDraft] = []

        title_map: Dict[str, List[str]] = {}
        content_hash_map: Dict[str, List[str]] = {}
        crawled_status_map: Dict[str, int] = {}
        discovered_links_map: Dict[str, List[str]] = {}

        # 1. Per-page rules
        for res in crawled_results:
            page_issues: List[IssueDraft] = []
            
            # Record status map for broken links check
            if res.status_code:
                crawled_status_map[res.url] = res.status_code
            discovered_links_map[res.url] = res.discovered_links

            # Check HTTP / connection errors
            status_issue = check_http_status(res.status_code, res.url, res.error_message)
            if status_issue:
                page_issues.append(status_issue)

            # Check HTTPS
            https_issue = check_https(res.url)
            if https_issue:
                page_issues.append(https_issue)

            # Check response time
            if res.response_time_ms > 0:
                rt_issue = check_response_time(res.response_time_ms, res.url)
                if rt_issue:
                    page_issues.append(rt_issue)

            # Check redirect chain
            if res.redirect_chain:
                rc_issue = check_redirect_chain(res.redirect_chain, res.url)
                if rc_issue:
                    page_issues.append(rc_issue)

            # If HTML parsed
            page_title = None
            page_meta_desc = None
            h1_count = 0
            body_hash = None
            word_count = 0

            if res.html_content:
                soup = BeautifulSoup(res.html_content, "html.parser")

                # Extract title
                title_tag = soup.find("title")
                if title_tag and title_tag.string:
                    page_title = title_tag.string.strip()
                    title_map.setdefault(page_title, []).append(res.url)

                title_missing_issue = check_missing_title(soup, res.url)
                if title_missing_issue:
                    page_issues.append(title_missing_issue)
                else:
                    title_len_issue = check_title_length(soup, res.url)
                    if title_len_issue:
                        page_issues.append(title_len_issue)

                # Meta description
                meta_tag = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
                if meta_tag and meta_tag.get("content"):
                    page_meta_desc = meta_tag.get("content").strip()

                meta_missing_issue = check_missing_meta_description(soup, res.url)
                if meta_missing_issue:
                    page_issues.append(meta_missing_issue)
                else:
                    meta_len_issue = check_meta_description_length(soup, res.url)
                    if meta_len_issue:
                        page_issues.append(meta_len_issue)

                # H1 tags
                h1_issues = check_h1_headings(soup, res.url)
                page_issues.extend(h1_issues)
                h1_count = len(soup.find_all("h1"))

                # Heading hierarchy
                hierarchy_issue = check_heading_hierarchy(soup, res.url)
                if hierarchy_issue:
                    page_issues.append(hierarchy_issue)

                # Images Alt
                alt_issue = check_image_alts(soup, res.url)
                if alt_issue:
                    page_issues.append(alt_issue)

                # Canonical URL
                canonical_issue = check_canonical(soup, res.url)
                if canonical_issue:
                    page_issues.append(canonical_issue)

                # Mixed content
                mixed_issue = check_mixed_content(soup, res.url)
                if mixed_issue:
                    page_issues.append(mixed_issue)

                # HTML lang
                lang_issue = check_html_lang(soup, res.url)
                if lang_issue:
                    page_issues.append(lang_issue)

                # Open Graph & Twitter Social Tags
                social_issues = check_open_graph_tags(soup, res.url)
                page_issues.extend(social_issues)

                # Extract social card metadata for visual preview
                og_title_tag = soup.find("meta", property=lambda val: val and val.lower() == "og:title")
                og_desc_tag = soup.find("meta", property=lambda val: val and val.lower() == "og:description")
                og_img_tag = soup.find("meta", property=lambda val: val and val.lower() == "og:image")
                social_meta = {
                    "og_title": og_title_tag.get("content", "") if og_title_tag else "",
                    "og_description": og_desc_tag.get("content", "") if og_desc_tag else "",
                    "og_image": og_img_tag.get("content", "") if og_img_tag else "",
                }

                # Body text word count and content hash
                body_tag = soup.find("body")
                body_text = body_tag.get_text(" ", strip=True) if body_tag else ""
                words = re.findall(r"\w+", body_text)
                word_count = len(words)
                body_hash = cls._compute_content_hash(body_text)
                if body_hash:
                    content_hash_map.setdefault(body_hash, []).append(res.url)

            all_issues.extend(page_issues)

            page_analysis = PageAnalysisData(
                url=res.url,
                status_code=res.status_code,
                response_time_ms=res.response_time_ms,
                depth=res.depth,
                title=page_title,
                meta_description=page_meta_desc,
                h1_count=h1_count,
                content_hash=body_hash,
                word_count=word_count,
                error_message=res.error_message,
                issues=page_issues,
                social_metadata=locals().get("social_meta", {}),
                body_text=body_text
            )
            page_analyses.append(page_analysis)

        # 2. Site-wide checks (Sitemap & Robots.txt)
        sitemap_issue = check_sitemap_status(sitemap_accessible, start_url)
        if sitemap_issue:
            all_issues.append(sitemap_issue)

        robots_issue = check_robots_txt_status(robots_accessible, start_url)
        if robots_issue:
            all_issues.append(robots_issue)

        # 3. Cross-page checks (Duplicate titles, duplicate content, broken internal links)
        dup_title_issues = check_duplicate_titles(title_map)
        all_issues.extend(dup_title_issues)

        dup_content_issues = check_duplicate_content(content_hash_map)
        all_issues.extend(dup_content_issues)

        broken_link_issues = check_broken_internal_links(crawled_status_map, discovered_links_map)
        all_issues.extend(broken_link_issues)

        # Calculate transparent SEO Health Score
        score_data = calculate_seo_health_score(all_issues, total_pages=len(page_analyses))

        return page_analyses, all_issues, score_data
