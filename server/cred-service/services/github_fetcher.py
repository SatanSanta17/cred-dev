"""
GitHub Fetcher v5 — Enriched Raw GraphQL Response

Two-query architecture:
  Query 1: Profile + 100 repos (lightweight) + pinned repos + orgs + language bytes
  Query 2: Production readiness signals for top 15 repos (file checks + dependency content)

Returns raw API response with production signals merged into matching repos.
No scoring, no intermediate processing — the LLM receives raw data and does all reasoning.
"""

import logging
import httpx
from typing import Optional, Dict, Any, List, Tuple

logger = logging.getLogger(__name__)


class GitHubFetcher:

    def __init__(self, token: Optional[str] = None):
        self.graphql_url = "https://api.github.com/graphql"
        self.token = token

    def _headers(self):
        if not self.token:
            raise ValueError("GitHub token required for GraphQL API")
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    async def fetch_user_data(self, username: str) -> Dict[str, Any]:
        try:
            # Query 1: Profile + all repos (lightweight) + pinned + orgs + lang bytes
            user_data = await self._fetch_profile_and_repos(username)

            # Select top repos for production signal checks
            top_repos = self._select_top_repos(user_data)

            # Query 2: Production signals for top repos (non-fatal if fails)
            production_signals = await self._fetch_production_signals(top_repos)

            # Merge production signals into matching repos
            if production_signals:
                self._merge_production_signals(user_data, production_signals)

            return {
                "data": user_data,
                "data_source": "github_graphql",
            }
        except Exception as e:
            return {"error": f"GitHub fetch failed: {str(e)}", "data_source": "error_fallback"}

    def _merge_production_signals(self, user_data: Dict[str, Any], signals: Dict[str, Any]) -> None:
        """Attach production signal data to matching repos in user_data. Mutates user_data in place."""
        repos = user_data.get("repositories", {}).get("nodes", [])
        for repo in repos:
            repo_name = repo.get("name", "")
            if repo_name in signals:
                repo["productionSignals"] = signals[repo_name]

    async def _fetch_profile_and_repos(self, username: str) -> Dict[str, Any]:
        """Query 1: Profile + all repos (lightweight) + pinned repos + orgs + language bytes."""
        query = """
        query($username: String!) {
            user(login: $username) {
                login
                name
                bio
                company
                location
                websiteUrl
                twitterUsername
                followers { totalCount }
                following { totalCount }
                createdAt
                updatedAt
                url
                pinnedItems(first: 6, types: REPOSITORY) {
                    nodes {
                        ... on Repository {
                            name
                            description
                            stargazerCount
                            primaryLanguage { name }
                            pushedAt
                            url
                        }
                    }
                }
                organizations(first: 10) {
                    nodes {
                        name
                        login
                        url
                    }
                }
                repositories(first: 100, ownerAffiliations: [OWNER], orderBy: {field: PUSHED_AT, direction: DESC}) {
                    totalCount
                    nodes {
                        name
                        nameWithOwner
                        description
                        isArchived
                        isFork
                        isPrivate
                        stargazerCount
                        forkCount
                        primaryLanguage { name }
                        languages(first: 10) { edges { size node { name } } }
                        repositoryTopics(first: 10) { nodes { topic { name } } }
                        pushedAt
                        createdAt
                        diskUsage
                        defaultBranchRef { name }
                        owner { login }
                        openIssues: issues(states: OPEN) { totalCount }
                        licenseInfo { name }
                    }
                }
                contributionsCollection {
                    totalCommitContributions
                    totalPullRequestContributions
                    totalPullRequestReviewContributions
                    totalIssueContributions
                    totalRepositoryContributions
                    restrictedContributionsCount
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                            }
                        }
                    }
                }
                pullRequests(first: 50, states: [OPEN, CLOSED, MERGED], orderBy: {field: CREATED_AT, direction: DESC}) {
                    totalCount
                    nodes {
                        state
                        title
                        createdAt
                        mergedAt
                        additions
                        deletions
                        changedFiles
                        repository { nameWithOwner isPrivate }
                        reviews { totalCount }
                    }
                }
            }
        }
        """

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                self.graphql_url,
                json={"query": query, "variables": {"username": username}},
                headers=self._headers(),
            )
            resp.raise_for_status()
            result = resp.json()

            if "errors" in result:
                raise ValueError(f"GraphQL errors: {result['errors']}")

            return result.get("data", {}).get("user", {})

    def _select_top_repos(self, user_data: Dict[str, Any], limit: int = 15) -> List[Tuple[str, str]]:
        """Select top repos by stars (then pushedAt), excluding forks, archived, and private repos.

        Returns list of (owner, name) tuples.
        """
        repos = user_data.get("repositories", {}).get("nodes", [])
        if not repos:
            return []

        # Filter out forks, archived, and private repos
        eligible = [
            r for r in repos
            if not r.get("isFork") and not r.get("isArchived") and not r.get("isPrivate")
        ]

        # Sort by stars descending, then pushedAt descending as tiebreaker
        # pushedAt can be None for empty repos — default to "" to avoid TypeError in tuple comparison
        eligible.sort(
            key=lambda r: (r.get("stargazerCount", 0), r.get("pushedAt") or ""),
            reverse=True,
        )

        top = eligible[:limit]
        return [(r.get("owner", {}).get("login", ""), r.get("name", "")) for r in top]

    async def _fetch_production_signals(self, top_repos: List[Tuple[str, str]]) -> Dict[str, Any]:
        """Query 2: Production readiness signals for top repos using GraphQL aliasing.

        Fetches file existence checks (README, Dockerfile, CI, tests, .env.example)
        and dependency file content (package.json, requirements.txt) for each repo.
        Batches repos into groups of BATCH_SIZE to stay within GitHub's query complexity limit.
        Returns dict keyed by repo name with production signal data.
        """
        if not top_repos:
            return {}

        BATCH_SIZE = 5  # 5 repos × 9 file checks = 45 lookups per query (safe for GitHub)

        PRODUCTION_SIGNALS_FRAGMENT = """
        fragment ProductionSignals on Repository {
            name
            readme: object(expression: "HEAD:README.md") { ... on Blob { byteSize } }
            dockerfile: object(expression: "HEAD:Dockerfile") { ... on Blob { byteSize } }
            ciWorkflows: object(expression: "HEAD:.github/workflows") { ... on Tree { entries { name } } }
            testsDir: object(expression: "HEAD:tests") { ... on Tree { entries { name } } }
            testDir: object(expression: "HEAD:test") { ... on Tree { entries { name } } }
            underscoreTests: object(expression: "HEAD:__tests__") { ... on Tree { entries { name } } }
            envExample: object(expression: "HEAD:.env.example") { ... on Blob { byteSize } }
            packageJson: object(expression: "HEAD:package.json") { ... on Blob { byteSize text } }
            requirementsTxt: object(expression: "HEAD:requirements.txt") { ... on Blob { byteSize text } }
        }
        """

        signals_by_repo = {}

        # Split into batches to avoid GitHub's query complexity limit (502 errors)
        batches = [top_repos[i:i + BATCH_SIZE] for i in range(0, len(top_repos), BATCH_SIZE)]

        for batch_idx, batch in enumerate(batches):
            try:
                repo_queries = []
                for i, (owner, name) in enumerate(batch):
                    repo_queries.append(
                        f'repo{i}: repository(owner: "{owner}", name: "{name}") {{ ...ProductionSignals }}'
                    )

                query = "query {\n" + "\n".join(repo_queries) + "\n}\n" + PRODUCTION_SIGNALS_FRAGMENT

                async with httpx.AsyncClient(timeout=30) as client:
                    resp = await client.post(
                        self.graphql_url,
                        json={"query": query},
                        headers=self._headers(),
                    )
                    resp.raise_for_status()
                    result = resp.json()

                    if "errors" in result:
                        logger.warning(f"Query 2 batch {batch_idx} GraphQL errors: {result['errors']}")
                        if "data" not in result:
                            continue

                    data = result.get("data", {})

                    for i in range(len(batch)):
                        repo_data = data.get(f"repo{i}")
                        if not repo_data:
                            continue
                        repo_name = repo_data.get("name", batch[i][1])
                        cleaned = self._clean_production_signals(repo_data)
                        signals_by_repo[repo_name] = cleaned

            except Exception as e:
                logger.warning(f"Query 2 batch {batch_idx} failed, continuing with remaining batches: {e}")
                continue

        return signals_by_repo

    def _clean_production_signals(self, repo_data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean production signal data: strip null entries, collapse test dirs, cap large files."""
        MAX_DEPENDENCY_SIZE = 50 * 1024  # 50KB cap per PRD

        cleaned = {}

        # File existence checks — only include if present (not null)
        if repo_data.get("readme"):
            cleaned["readme"] = repo_data["readme"]
        if repo_data.get("dockerfile"):
            cleaned["dockerfile"] = repo_data["dockerfile"]
        if repo_data.get("ciWorkflows"):
            cleaned["ciWorkflows"] = repo_data["ciWorkflows"]
        if repo_data.get("envExample"):
            cleaned["envExample"] = repo_data["envExample"]

        # Collapse three test directory checks into one
        test_dir = repo_data.get("testsDir") or repo_data.get("testDir") or repo_data.get("underscoreTests")
        if test_dir:
            cleaned["testDirectory"] = test_dir

        # Dependency files — include text only if under size cap
        for key in ("packageJson", "requirementsTxt"):
            dep = repo_data.get(key)
            if dep:
                byte_size = dep.get("byteSize", 0)
                if byte_size > MAX_DEPENDENCY_SIZE:
                    # Too large — include existence marker but strip text
                    cleaned[key] = {"byteSize": byte_size}
                else:
                    cleaned[key] = dep

        return cleaned
