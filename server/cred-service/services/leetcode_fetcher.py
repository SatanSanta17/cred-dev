"""LeetCode data fetching service."""

import httpx
from bs4 import BeautifulSoup

class LeetCodeFetcher:
    """Fetches LeetCode profile and problem-solving statistics."""

    def __init__(self):
        self.base_url = "https://leetcode.com"

    async def fetch_user_data(self, username: str) -> dict:
        """
        Fetch LeetCode user statistics.

        Args:
            username: LeetCode username

        Returns:
            dict: User statistics and problem-solving data
        """
        # Note: LeetCode API is not officially public
        # This implementation uses web scraping as a fallback
        # In production, consider using their GraphQL API if available

        url = f"{self.base_url}/{username}/"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url)
                soup = BeautifulSoup(response.text, 'html.parser')

                # This is a simplified extraction - LeetCode's HTML structure may change
                # You might need to adapt this based on their current structure

                return {
                    "username": username,
                    "profile_url": url,
                    "stats": {
                        "total_solved": 0,  # Extract from HTML
                        "easy_count": 0,
                        "medium_count": 0,
                        "hard_count": 0,
                        "acceptance_rate": 0.0,
                        "ranking": 0
                    },
                    "recent_submissions": [],
                    "raw_html": response.text  # Store for later processing
                }

            except Exception as e:
                return {
                    "username": username,
                    "error": str(e),
                    "stats": {}
                }