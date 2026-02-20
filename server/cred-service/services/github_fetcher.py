"""GitHub data fetching service."""

import httpx
from typing import Optional

class GitHubFetcher:
    """Fetches GitHub profile and repository data."""

    def __init__(self, token: Optional[str] = None):
        self.token = token
        self.base_url = "https://api.github.com"

    async def fetch_user_data(self, username: str) -> dict:
        """
        Fetch GitHub user profile data.

        Args:
            username: GitHub username

        Returns:
            dict: User profile data
        """
        headers = {"Authorization": f"token {self.token}"} if self.token else {}

        async with httpx.AsyncClient() as client:
            # Get user profile
            user_response = await client.get(
                f"{self.base_url}/users/{username}",
                headers=headers
            )
            user_data = user_response.json()

            # Get repositories
            repos_response = await client.get(
                f"{self.base_url}/users/{username}/repos",
                headers=headers,
                params={"sort": "updated", "per_page": 100}
            )
            repos_data = repos_response.json()

            # Get contribution stats (simplified)
            # Note: GitHub doesn't provide direct contribution counts via API
            # This would need additional processing

            return {
                "profile": user_data,
                "repositories": repos_data,
                "stats": {
                    "public_repos": user_data.get("public_repos", 0),
                    "followers": user_data.get("followers", 0),
                    "following": user_data.get("following", 0),
                    "created_at": user_data.get("created_at")
                }
            }