"""GitHub data fetching service."""

import httpx
from typing import Optional, Dict, Any, List

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

        async with httpx.AsyncClient(timeout=30) as client:
            try:
                # Get user profile
                user_response = await client.get(
                    f"{self.base_url}/users/{username}",
                    headers=headers
                )
                user_response.raise_for_status()
                user_data = user_response.json()

                # Get repositories
                repos_response = await client.get(
                    f"{self.base_url}/users/{username}/repos",
                    headers=headers,
                    params={"sort": "updated", "per_page": 100}
                )
                repos_response.raise_for_status()
                repos_data = repos_response.json()

                enriched_repos = await self._enrich_repositories(client, repos_data, headers)

                return {
                    "profile": user_data,
                    "repositories": enriched_repos,
                    "stats": {
                        "public_repos": user_data.get("public_repos", 0),
                        "followers": user_data.get("followers", 0),
                        "following": user_data.get("following", 0),
                        "created_at": user_data.get("created_at")
                    }
                }
            except httpx.HTTPError as e:
                return {
                    "profile": {},
                    "repositories": [],
                    "stats": {},
                    "error": f"GitHub API request failed: {str(e)}"
                }

    async def _enrich_repositories(
        self,
        client: httpx.AsyncClient,
        repositories: List[Dict[str, Any]],
        headers: Dict[str, str],
        max_repos: int = 10
    ) -> List[Dict[str, Any]]:
        """Enrich top repositories with deeper codebase indicators."""
        enriched_repos = []

        for repo in repositories:
            repo_data = repo.copy()
            owner = (repo.get("owner") or {}).get("login")
            repo_name = repo.get("name")

            if not owner or not repo_name:
                enriched_repos.append(repo_data)
                continue

            # Enrich only top repositories to control API usage and latency.
            if len(enriched_repos) >= max_repos:
                repo_data["enrichment_status"] = "skipped"
                enriched_repos.append(repo_data)
                continue

            repo_data["codebase_signals"] = await self._fetch_repo_signals(
                client,
                owner,
                repo_name,
                headers,
                repo.get("default_branch", "main")
            )
            repo_data["enrichment_status"] = "enriched"
            enriched_repos.append(repo_data)

        return enriched_repos

    async def _fetch_repo_signals(
        self,
        client: httpx.AsyncClient,
        owner: str,
        repo_name: str,
        headers: Dict[str, str],
        default_branch: str
    ) -> Dict[str, Any]:
        """Fetch language distribution, commit activity, and root file signals."""
        signals: Dict[str, Any] = {
            "languages": {},
            "recent_commit_count": 0,
            "has_readme": False,
            "root_file_count": 0,
            "config_files": []
        }

        try:
            languages_response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo_name}/languages",
                headers=headers
            )
            if languages_response.status_code == 200:
                signals["languages"] = languages_response.json()

            commits_response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo_name}/commits",
                headers=headers,
                params={"per_page": 30}
            )
            if commits_response.status_code == 200:
                signals["recent_commit_count"] = len(commits_response.json())

            contents_response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo_name}/contents",
                headers=headers,
                params={"ref": default_branch}
            )
            if contents_response.status_code == 200 and isinstance(contents_response.json(), list):
                contents = contents_response.json()
                file_names = [item.get("name", "") for item in contents]
                signals["root_file_count"] = len(file_names)

                normalized = {name.lower() for name in file_names}
                signals["has_readme"] = any(name.startswith("readme") for name in normalized)

                known_config_files = {
                    "dockerfile", "docker-compose.yml", "docker-compose.yaml", "package.json",
                    "requirements.txt", "pyproject.toml", "pom.xml", "build.gradle",
                    ".github", "terraform", "kubernetes"
                }
                signals["config_files"] = sorted(
                    [name for name in file_names if name.lower() in known_config_files]
                )

        except httpx.HTTPError:
            signals["fetch_error"] = "Failed to fetch complete repository signals"

        return signals
