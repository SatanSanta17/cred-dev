"""Web Search Fetcher — extracts profile data from any URL via OpenAI web search.

Used for platforms without dedicated extractors (everything except GitHub, LeetCode,
and Resume). The LLM uses its web_search_preview tool to visit the URL and extract
profile data as plain text — no JSON structuring needed since the report generator
LLM consumes raw text directly.
"""

import logging
from typing import Dict, Any

from openai import OpenAI
from app.config import settings
from .platform_utils import get_platform_name

logger = logging.getLogger(__name__)

EXTRACTION_SYSTEM_PROMPT = """You are a data extraction engine. Your task is to visit the given URL and extract all publicly visible developer/professional profile data.

Extract everything relevant: username, bio, stats, ratings, rankings, achievements, badges, skills, technologies, projects, contributions, activity history, and any other useful information.

Rules:
- Extract ONLY what is publicly visible on the profile
- Do NOT fabricate or assume data — if something is not visible, do not mention it
- Include exact numbers where visible (ratings, solve counts, rankings, contribution counts)
- Write in clear, factual prose — no formatting requirements
- If the URL is inaccessible or the profile doesn't exist, say so clearly"""


class WebSearchFetcher:
    """Fetches profile data from any URL using OpenAI's web_search_preview tool."""

    def __init__(self, model: str = "gpt-5-mini"):
        api_key = settings.openai_api_key
        if not api_key:
            raise ValueError("OPENAI_API_KEY required for WebSearchFetcher")
        self.client = OpenAI(api_key=api_key)
        self.model = model

    async def fetch_profile(self, url: str, platform_id: str) -> Dict[str, Any]:
        """
        Extract profile data from a URL via LLM web search.

        Returns a dict with the raw text response stored under "raw_text",
        plus metadata (platform, url, data_source). The report generator
        LLM consumes this text directly.
        """
        platform_name = get_platform_name(platform_id)

        try:
            response = self.client.responses.create(
                model=self.model,
                tools=[{"type": "web_search_preview"}],
                input=[
                    {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Extract all profile data from: {url}"},
                ],
            )

            result_text = ""
            for item in response.output:
                if item.type == "message":
                    for content in item.content:
                        if content.type == "output_text":
                            result_text = content.text
                            break

            if not result_text:
                logger.warning(f"Empty response for {platform_id} URL: {url}")
                return {
                    "error": "empty_response",
                    "url": url,
                    "platform": platform_name,
                    "data_source": "web_search",
                }

            return {
                "platform": platform_name,
                "url": url,
                "data_source": "web_search",
                "raw_text": result_text,
            }

        except Exception as e:
            logger.error(f"WebSearchFetcher failed for {platform_id} ({url}): {e}", exc_info=True)
            return {
                "error": str(e),
                "url": url,
                "platform": platform_name,
                "data_source": "web_search_error",
            }
