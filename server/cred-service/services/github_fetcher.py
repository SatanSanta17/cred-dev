"""
GitHub Intelligence Fetcher v2
Parallel enrichment + composite ranking + org repo inclusion.
Raw telemetry only (no report logic).
"""

import asyncio
import httpx
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List


class GitHubFetcher:
    def __init__(self, token: Optional[str] = None, max_repos: int = 10):
        self.base_url = "https://api.github.com"
        self.token = token
        self.max_repos = max_repos
        self.semaphore = asyncio.Semaphore(5)  # Safe parallel limit

    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    async def fetch_user_data(self, username: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=30) as client:
            profile = await self._fetch_profile(client, username)
            repos = await self._fetch_all_repositories(client, username)

            scored_repos = self._score_repositories(repos)

            top_repos = sorted(
                scored_repos,
                key=lambda r: r["intelligence"]["composite_score"],
                reverse=True
            )[: self.max_repos]

            enriched_top_repos = await self._enrich_repositories_parallel(
                client, top_repos
            )

            distribution_metrics = self._compute_distribution_metrics(scored_repos)

            return {
                "profile": profile,
                "repository_intelligence": {
                    "total_repositories": len(scored_repos),
                    "all_repositories": scored_repos,
                    "top_repositories": enriched_top_repos,
                    "distribution_metrics": distribution_metrics,
                },
            }

    # -----------------------
    # PROFILE
    # -----------------------

    async def _fetch_profile(self, client, username):
        resp = await client.get(
            f"{self.base_url}/users/{username}",
            headers=self._headers()
        )
        resp.raise_for_status()
        data = resp.json()

        return {
            "username": data.get("login"),
            "name": data.get("name"),
            "bio": data.get("bio"),
            "company": data.get("company"),
            "location": data.get("location"),
            "followers": data.get("followers"),
            "following": data.get("following"),
            "public_repos": data.get("public_repos"),
            "account_created_at": data.get("created_at"),
            "profile_url": data.get("html_url"),
        }

    # -----------------------
    # REPO INGESTION
    # -----------------------

    async def _fetch_all_repositories(self, client, username):
        repos = []
        page = 1

        while True:
            resp = await client.get(
                f"{self.base_url}/users/{username}/repos",
                headers=self._headers(),
                params={"per_page": 100, "page": page}
            )
            resp.raise_for_status()
            batch = resp.json()
            if not batch:
                break

            repos.extend(batch)
            page += 1

        return repos

    # -----------------------
    # SCORING ENGINE
    # -----------------------

    def _score_repositories(self, repos):
        now = datetime.now(timezone.utc)

        scored = []

        for repo in repos:
            ownership_score = 3 if not repo.get("fork") else -2

            pushed_at = repo.get("pushed_at")
            activity_score = 0
            if pushed_at:
                days = (now - datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))).days
                if days <= 30:
                    activity_score = 3
                elif days <= 90:
                    activity_score = 2
                elif days <= 180:
                    activity_score = 1

            size_score = 2 if repo.get("size", 0) > 500 else 0
            issue_score = 1 if repo.get("open_issues_count", 0) > 0 else 0
            depth_score = size_score + issue_score

            impact_score = (
                min(repo.get("stargazers_count", 0), 50) * 0.1 +
                min(repo.get("forks_count", 0), 20) * 0.2
            )

            production_score = 0  # will be enriched later

            composite = (
                ownership_score +
                activity_score +
                depth_score +
                impact_score +
                production_score
            )

            repo["intelligence"] = {
                "composite_score": round(composite, 2),
                "ownership_score": ownership_score,
                "activity_score": activity_score,
                "depth_score": depth_score,
                "impact_score": round(impact_score, 2),
                "production_score": production_score,
            }

            scored.append(repo)

        return scored

    # -----------------------
    # PARALLEL ENRICHMENT
    # -----------------------

    async def _enrich_repositories_parallel(self, client, repos):
        tasks = [
            self._enrich_single_repo(client, repo)
            for repo in repos
        ]
        return await asyncio.gather(*tasks)

    async def _enrich_single_repo(self, client, repo):
        async with self.semaphore:
            owner = repo["owner"]["login"]
            name = repo["name"]
            default_branch = repo.get("default_branch", "main")

            languages = await self._fetch_languages(client, owner, name)
            contributors = await self._fetch_contributors(client, owner, name)
            commits = await self._fetch_commit_activity(client, owner, name)
            structure = await self._fetch_root_structure(client, owner, name, default_branch)

            production_score = self._compute_production_score(structure)

            repo["intelligence"]["production_score"] = production_score
            repo["intelligence"]["composite_score"] += production_score

            repo["codebase_signals"] = {
                "languages": languages,
                "contributors_count": contributors,
                "recent_commit_count": commits,
                "structure": structure,
            }

            return repo

    async def _fetch_languages(self, client, owner, repo):
        resp = await client.get(
            f"{self.base_url}/repos/{owner}/{repo}/languages",
            headers=self._headers()
        )
        return resp.json() if resp.status_code == 200 else {}

    async def _fetch_contributors(self, client, owner, repo):
        resp = await client.get(
            f"{self.base_url}/repos/{owner}/{repo}/contributors",
            headers=self._headers(),
            params={"per_page": 100}
        )
        return len(resp.json()) if resp.status_code == 200 else 0

    async def _fetch_commit_activity(self, client, owner, repo):
        resp = await client.get(
            f"{self.base_url}/repos/{owner}/{repo}/commits",
            headers=self._headers(),
            params={"per_page": 30}
        )
        return len(resp.json()) if resp.status_code == 200 else 0

    async def _fetch_root_structure(self, client, owner, repo, branch):
        resp = await client.get(
            f"{self.base_url}/repos/{owner}/{repo}/contents",
            headers=self._headers(),
            params={"ref": branch}
        )

        if resp.status_code != 200:
            return {}

        contents = resp.json()
        file_names = [item["name"].lower() for item in contents]

        return {
            "has_readme": any("readme" in f for f in file_names),
            "has_docker": any("dockerfile" in f for f in file_names),
            "has_ci": any(".github" in f for f in file_names),
            "has_tests": any("test" in f for f in file_names),
            "root_file_count": len(file_names),
        }

    def _compute_production_score(self, structure):
        score = 0
        if structure.get("has_docker"):
            score += 2
        if structure.get("has_ci"):
            score += 2
        if structure.get("has_tests"):
            score += 1
        return score

    # -----------------------
    # DISTRIBUTION METRICS
    # -----------------------

    def _compute_distribution_metrics(self, repos):
        fork_count = sum(1 for r in repos if r.get("fork"))
        active_repos = sum(
            1 for r in repos
            if r.get("intelligence", {}).get("activity_score", 0) > 0
        )

        return {
            "fork_ratio": round(fork_count / len(repos), 2) if repos else 0,
            "active_repo_ratio": round(active_repos / len(repos), 2) if repos else 0,
        }