import logging
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser
import httpx
from app.services.crawler.security import validate_target_url

logger = logging.getLogger(__name__)

class SafeRobotsParser:
    def __init__(self, base_url: str, user_agent: str):
        self.base_url = base_url
        self.user_agent = user_agent
        self.parser = RobotFileParser()
        self.robots_url = urljoin(base_url, "/robots.txt")
        self.is_accessible = False
        self.content = ""

    async def fetch_and_parse(self, client: httpx.AsyncClient) -> bool:
        """
        Safely fetches robots.txt and checks access rules.
        Returns True if robots.txt exists and was parsed, False otherwise.
        """
        is_safe, reason = validate_target_url(self.robots_url)
        if not is_safe:
            logger.warning(f"robots.txt target invalid for security: {reason}")
            self.parser.allow_all = True
            return False

        try:
            resp = await client.get(self.robots_url, timeout=5.0)
            if resp.status_code == 200:
                self.is_accessible = True
                self.content = resp.text
                self.parser.parse(resp.text.splitlines())
                return True
            else:
                self.parser.allow_all = True
                return False
        except Exception as e:
            logger.info(f"Could not fetch robots.txt for {self.base_url}: {e}")
            self.parser.allow_all = True
            return False

    def can_fetch(self, url: str) -> bool:
        """Checks if the user-agent is permitted to crawl the given url."""
        try:
            return self.parser.can_fetch(self.user_agent, url)
        except Exception:
            return True
