"""LinkedIn data fetching service.

LinkedIn blocks automated scraping (returns 999), so this module simply
records the profile URL and username for inclusion in the raw data bundle.
A future integration could use the official LinkedIn API with OAuth.
"""

import re
from typing import Optional, Dict, Any


class LinkedInFetcher:
    """Stores LinkedIn profile URL for report context."""

    async def fetch_user_data(self, profile_url: str) -> Dict[str, Any]:
        """
        Record LinkedIn profile metadata.

        LinkedIn requires OAuth for real data access, so we just store
        the URL and extracted username for the LLM to reference.
        """
        username = self._extract_linkedin_username(profile_url)

        return {
            "username": username,
            "profile_url": profile_url,
            "note": "LinkedIn data requires OAuth API access; URL recorded for report context.",
            "available_data": "url_only",
            "professional_summary": {
                "current_position": None,
                "experience_years": None,
                "companies": [],
                "education": [],
                "skills": [],
            },
            "network_info": {
                "connections": None,
                "followers": None,
            },
        }

    def _extract_linkedin_username(self, url: str) -> Optional[str]:
        """Extract LinkedIn username from URL."""
        if not url:
            return None

        patterns = [
            r"linkedin\.com/in/([^/?]+)",
            r"linkedin\.com/pub/([^/?]+)",
        ]

        for pattern in patterns:
            match = re.search(pattern, url, re.IGNORECASE)
            if match:
                return match.group(1)

        return None
