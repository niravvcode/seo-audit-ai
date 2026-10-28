import pytest
from app.services.crawler.security import validate_target_url

def test_ssrf_blocks_localhost():
    is_safe, reason = validate_target_url("http://localhost:8000")
    assert is_safe is False
    assert "blocked for security" in reason.lower() or "loopback" in reason.lower()

def test_ssrf_blocks_loopback_ip():
    is_safe, reason = validate_target_url("http://127.0.0.1:8080")
    assert is_safe is False
    assert "private" in reason.lower() or "loopback" in reason.lower()

def test_ssrf_blocks_cloud_metadata():
    is_safe, reason = validate_target_url("http://169.254.169.254/latest/meta-data/")
    assert is_safe is False
    assert "blocked" in reason.lower() or "private" in reason.lower()

def test_ssrf_blocks_private_networks():
    for private_url in [
        "http://10.0.0.1",
        "http://192.168.1.1",
        "http://172.16.0.1"
    ]:
        is_safe, reason = validate_target_url(private_url)
        assert is_safe is False
        assert "private" in reason.lower() or "loopback" in reason.lower()

def test_ssrf_rejects_non_http_schemes():
    for invalid_scheme in ["ftp://example.com", "file:///etc/passwd", "gopher://example.com"]:
        is_safe, reason = validate_target_url(invalid_scheme)
        assert is_safe is False
        assert "prohibited scheme" in reason.lower()

def test_ssrf_rejects_empty_and_malformed():
    is_safe, reason = validate_target_url("")
    assert is_safe is False
    assert "cannot be empty" in reason.lower()
