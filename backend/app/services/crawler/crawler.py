import asyncio
import time
import logging
from typing import Set, Dict, List, Optional, Callable
from urllib.parse import urlparse, urljoin, urldefrag
import httpx
from bs4 import BeautifulSoup

from app.core.config import settings
from app.services.crawler.security import validate_target_url
from app.services.crawler.robots import SafeRobotsParser

logger = logging.getLogger(__name__)

class CrawledResult:
    def __init__(
        self,
        url: str,
        status_code: Optional[int] = None,
        response_time_ms: float = 0.0,
        depth: int = 0,
        html_content: str = "",
        headers: Optional[Dict[str, str]] = None,
        redirect_chain: Optional[List[str]] = None,
        error_message: Optional[str] = None
    ):
        self.url = url
        self.status_code = status_code
        self.response_time_ms = response_time_ms
        self.depth = depth
        self.html_content = html_content
        self.headers = headers or {}
        self.redirect_chain = redirect_chain or []
        self.error_message = error_message
        self.discovered_links: List[str] = []

class SafeCrawler:
    def __init__(
        self,
        start_url: str,
        max_pages: int = 10,
        max_depth: int = 2,
        follow_internal: bool = True,
        rate_limit_delay: float = 0.2,
        max_concurrency: int = 3,
        progress_callback: Optional[Callable[[int, int, str], None]] = None,
        is_cancelled: Optional[Callable[[], bool]] = None
    ):
        self.start_url = self._normalize_url(start_url)
        parsed = urlparse(self.start_url)
        self.base_domain = parsed.netloc.lower()
        self.base_scheme = parsed.scheme.lower()
        self.max_pages = min(max_pages, settings.MAX_CRAWL_PAGES_LIMIT)
        self.max_depth = max_depth
        self.follow_internal = follow_internal
        self.rate_limit_delay = rate_limit_delay
        self.semaphore = asyncio.Semaphore(max_concurrency)
        self.progress_callback = progress_callback
        self.is_cancelled = is_cancelled or (lambda: False)

        self.visited_urls: Set[str] = set()
        self.results: List[CrawledResult] = []
        self.sitemap_accessible: bool = False
        self.sitemap_content: str = ""
        self.robots_parser: Optional[SafeRobotsParser] = None

    def _normalize_url(self, url: str) -> str:
        defragged, _ = urldefrag(url)
        parsed = urlparse(defragged)
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        path = parsed.path or "/"
        # Avoid duplicate trailing slash variations
        if len(path) > 1 and path.endswith("/"):
            path = path[:-1]
        query = f"?{parsed.query}" if parsed.query else ""
        return f"{scheme}://{netloc}{path}{query}"

    def _is_internal(self, target_url: str) -> bool:
        parsed = urlparse(target_url)
        target_netloc = parsed.netloc.lower()
        return target_netloc == self.base_domain or target_netloc.endswith(f".{self.base_domain}")

    async def check_sitemap(self, client: httpx.AsyncClient):
        sitemap_url = urljoin(f"{self.base_scheme}://{self.base_domain}", "/sitemap.xml")
        is_safe, _ = validate_target_url(sitemap_url)
        if not is_safe:
            return
        try:
            resp = await client.get(sitemap_url, timeout=5.0)
            if resp.status_code == 200 and ("xml" in resp.headers.get("content-type", "") or "<urlset" in resp.text):
                self.sitemap_accessible = True
                self.sitemap_content = resp.text[:10000]
        except Exception:
            self.sitemap_accessible = False

    async def fetch_url(self, client: httpx.AsyncClient, url: str, depth: int) -> CrawledResult:
        async with self.semaphore:
            if self.rate_limit_delay > 0:
                await asyncio.sleep(self.rate_limit_delay)

            # SSRF security check on each request
            is_safe, reason = validate_target_url(url)
            if not is_safe:
                return CrawledResult(
                    url=url,
                    depth=depth,
                    error_message=f"SSRF security rejection: {reason}"
                )

            # Robots.txt check
            if self.robots_parser and not self.robots_parser.can_fetch(url):
                return CrawledResult(
                    url=url,
                    depth=depth,
                    error_message="Disallowed by robots.txt directive"
                )

            redirect_chain = []
            current_target = url
            hop_count = 0
            max_redirects = 5

            try:
                start_time = time.perf_counter()
                
                # Manual redirect handling for SSRF validation on every redirect
                while hop_count < max_redirects:
                    resp = await client.get(
                        current_target,
                        headers={"User-Agent": settings.USER_AGENT},
                        timeout=settings.DEFAULT_CRAWL_TIMEOUT_SECONDS,
                        follow_redirects=False
                    )
                    
                    if 300 <= resp.status_code < 400 and "location" in resp.headers:
                        hop_count += 1
                        redirect_chain.append(current_target)
                        next_location = urljoin(current_target, resp.headers["location"])
                        is_safe_next, next_reason = validate_target_url(next_location)
                        if not is_safe_next:
                            return CrawledResult(
                                url=url,
                                status_code=resp.status_code,
                                depth=depth,
                                redirect_chain=redirect_chain,
                                error_message=f"Redirect target blocked by SSRF check: {next_reason}"
                            )
                        if next_location in redirect_chain:
                            redirect_chain.append(next_location)
                            return CrawledResult(
                                url=url,
                                status_code=resp.status_code,
                                depth=depth,
                                redirect_chain=redirect_chain,
                                error_message="Redirect loop detected"
                            )
                        current_target = next_location
                        continue
                    break

                duration_ms = (time.perf_counter() - start_time) * 1000.0

                result = CrawledResult(
                    url=url,
                    status_code=resp.status_code,
                    response_time_ms=round(duration_ms, 2),
                    depth=depth,
                    html_content=resp.text if "text/html" in resp.headers.get("content-type", "") else "",
                    headers=dict(resp.headers),
                    redirect_chain=redirect_chain
                )

                # If HTML, extract internal links
                if result.html_content and depth < self.max_depth and self.follow_internal:
                    soup = BeautifulSoup(result.html_content, "html.parser")
                    for a_tag in soup.find_all("a", href=True):
                        raw_href = a_tag["href"].strip()
                        if not raw_href or raw_href.startswith(("#", "javascript:", "mailto:", "tel:")):
                            continue
                        absolute_url = urljoin(url, raw_href)
                        normalized_link = self._normalize_url(absolute_url)
                        if self._is_internal(normalized_link):
                            result.discovered_links.append(normalized_link)

                return result

            except httpx.TimeoutException:
                return CrawledResult(url=url, depth=depth, error_message="Request timed out")
            except httpx.RequestError as e:
                return CrawledResult(url=url, depth=depth, error_message=f"Request network error: {str(e)}")
            except Exception as e:
                return CrawledResult(url=url, depth=depth, error_message=f"Unexpected crawling error: {str(e)}")

    async def crawl(self) -> List[CrawledResult]:
        # Validate initial start URL
        is_safe, reason = validate_target_url(self.start_url)
        if not is_safe:
            raise ValueError(f"Start URL rejected for security: {reason}")

        limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)
        async with httpx.AsyncClient(limits=limits, verify=True) as client:
            # 1. Check robots.txt
            self.robots_parser = SafeRobotsParser(self.start_url, settings.USER_AGENT)
            await self.robots_parser.fetch_and_parse(client)

            # 2. Check sitemap
            await self.check_sitemap(client)

            # 3. BFS crawl queue: items are (url, depth)
            queue: List[tuple[str, int]] = [(self.start_url, 0)]
            self.visited_urls.add(self.start_url)

            while queue and len(self.results) < self.max_pages:
                if self.is_cancelled():
                    logger.info("Crawl was cancelled by user.")
                    break

                current_url, depth = queue.pop(0)

                if self.progress_callback:
                    self.progress_callback(len(self.results), self.max_pages, current_url)

                result = await self.fetch_url(client, current_url, depth)
                self.results.append(result)

                # Add newly discovered internal links to queue
                if depth < self.max_depth and self.follow_internal:
                    for link in result.discovered_links:
                        if link not in self.visited_urls and len(self.visited_urls) < (self.max_pages * 3):
                            self.visited_urls.add(link)
                            queue.append((link, depth + 1))

            if self.progress_callback:
                self.progress_callback(len(self.results), self.max_pages, "Completed")

        return self.results
