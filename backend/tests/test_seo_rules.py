import pytest
from bs4 import BeautifulSoup
from app.services.seo.rules import (
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
)

def test_missing_title():
    soup_empty = BeautifulSoup("<html><head></head><body>Hello</body></html>", "html.parser")
    issue = check_missing_title(soup_empty, "https://example.com")
    assert issue is not None
    assert issue.rule_id == "RULE_MISSING_TITLE"
    assert issue.severity.value == "CRITICAL"

    soup_with_title = BeautifulSoup("<html><head><title>Great Page</title></head></html>", "html.parser")
    assert check_missing_title(soup_with_title, "https://example.com") is None

def test_title_length():
    short_soup = BeautifulSoup("<html><head><title>Hi</title></head></html>", "html.parser")
    issue_short = check_title_length(short_soup, "https://example.com")
    assert issue_short is not None
    assert issue_short.rule_id == "RULE_TITLE_TOO_SHORT"

    long_title = "A" * 75
    long_soup = BeautifulSoup(f"<html><head><title>{long_title}</title></head></html>", "html.parser")
    issue_long = check_title_length(long_soup, "https://example.com")
    assert issue_long is not None
    assert issue_long.rule_id == "RULE_TITLE_TOO_LONG"

def test_meta_description():
    no_meta = BeautifulSoup("<html><head></head></html>", "html.parser")
    issue = check_missing_meta_description(no_meta, "https://example.com")
    assert issue is not None
    assert issue.rule_id == "RULE_MISSING_META_DESC"

    valid_meta = BeautifulSoup('<html><head><meta name="description" content="A comprehensive guide to high-impact SEO auditing and prioritized technical fixes for modern websites."></head></html>', "html.parser")
    assert check_missing_meta_description(valid_meta, "https://example.com") is None
    assert check_meta_description_length(valid_meta, "https://example.com") is None

def test_h1_headings():
    no_h1 = BeautifulSoup("<html><body><h2>Subtitle</h2></body></html>", "html.parser")
    issues_no_h1 = check_h1_headings(no_h1, "https://example.com")
    assert any(i.rule_id == "RULE_MISSING_H1" for i in issues_no_h1)

    multi_h1 = BeautifulSoup("<html><body><h1>First H1</h1><h1>Second H1</h1></body></html>", "html.parser")
    issues_multi = check_h1_headings(multi_h1, "https://example.com")
    assert any(i.rule_id == "RULE_MULTIPLE_H1" for i in issues_multi)

def test_heading_hierarchy():
    skipped = BeautifulSoup("<html><body><h1>Main</h1><h3>Skipped to H3</h3></body></html>", "html.parser")
    issue = check_heading_hierarchy(skipped, "https://example.com")
    assert issue is not None
    assert issue.rule_id == "RULE_HEADING_HIERARCHY"

def test_image_alt_attributes():
    soup_no_alt = BeautifulSoup('<html><body><img src="/logo.png"><img src="/banner.jpg" alt=""></body></html>', "html.parser")
    issue = check_image_alts(soup_no_alt, "https://example.com")
    assert issue is not None
    assert issue.rule_id == "RULE_MISSING_IMAGE_ALT"

    soup_with_alt = BeautifulSoup('<html><body><img src="/logo.png" alt="Company Logo"></body></html>', "html.parser")
    assert check_image_alts(soup_with_alt, "https://example.com") is None

def test_canonical_tags():
    no_canonical = BeautifulSoup("<html><head></head></html>", "html.parser")
    issue_missing = check_canonical(no_canonical, "https://example.com")
    assert issue_missing is not None
    assert issue_missing.rule_id == "RULE_MISSING_CANONICAL"

    rel_canonical = BeautifulSoup('<html><head><link rel="canonical" href="/about"></head></html>', "html.parser")
    issue_rel = check_canonical(rel_canonical, "https://example.com")
    assert issue_rel is not None
    assert issue_rel.rule_id == "RULE_RELATIVE_CANONICAL"

def test_http_status():
    issue_404 = check_http_status(404, "https://example.com/missing", None)
    assert issue_404 is not None
    assert "404" in issue_404.title

    issue_ok = check_http_status(200, "https://example.com", None)
    assert issue_ok is None

def test_https_check():
    issue_http = check_https("http://example.com")
    assert issue_http is not None
    assert issue_http.rule_id == "RULE_INSECURE_HTTP"

    assert check_https("https://example.com") is None

def test_mixed_content():
    soup_mixed = BeautifulSoup('<html><head><link rel="stylesheet" href="http://cdn.example.com/style.css"></head></html>', "html.parser")
    issue = check_mixed_content(soup_mixed, "https://example.com")
    assert issue is not None
    assert issue.rule_id == "RULE_MIXED_CONTENT"

def test_html_lang():
    soup_no_lang = BeautifulSoup("<html><head></head></html>", "html.parser")
    issue = check_html_lang(soup_no_lang, "https://example.com")
    assert issue is not None
    assert issue.rule_id == "RULE_MISSING_LANG"

    soup_with_lang = BeautifulSoup('<html lang="en"><head></head></html>', "html.parser")
    assert check_html_lang(soup_with_lang, "https://example.com") is None

def test_response_time():
    issue_slow = check_response_time(1800, "https://example.com")
    assert issue_slow is not None
    assert issue_slow.rule_id == "RULE_SLOW_RESPONSE"

    issue_very_slow = check_response_time(3500, "https://example.com")
    assert issue_very_slow is not None
    assert issue_very_slow.rule_id == "RULE_VERY_SLOW_RESPONSE"

def test_duplicate_titles():
    title_map = {
        "Common Shared Title Across Pages": ["https://example.com/p1", "https://example.com/p2"],
        "Unique Title": ["https://example.com/p3"]
    }
    issues = check_duplicate_titles(title_map)
    assert len(issues) == 2
    assert all(i.rule_id == "RULE_DUPLICATE_TITLE" for i in issues)

def test_duplicate_content():
    content_map = {
        "hash12345678": ["https://example.com/a", "https://example.com/b"]
    }
    issues = check_duplicate_content(content_map)
    assert len(issues) == 2
    assert all(i.rule_id == "RULE_DUPLICATE_CONTENT" for i in issues)

def test_broken_internal_links():
    status_map = {
        "https://example.com/broken": 404,
        "https://example.com/valid": 200
    }
    links_map = {
        "https://example.com/page1": ["https://example.com/broken", "https://example.com/valid"]
    }
    issues = check_broken_internal_links(status_map, links_map)
    assert len(issues) == 1
    assert issues[0].rule_id == "RULE_BROKEN_INTERNAL_LINK"
