"""
GitHub Fetcher v4 — Raw GraphQL Response

Executes a single GraphQL query and returns the raw API response as-is.
No transformation, no scoring, no intermediate processing.
The LLM receives the raw data and does all the reasoning.
"""

import httpx
from typing import Optional, Dict, Any


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
            return await self._fetch(username)
        except Exception as e:
            return {"error": f"GitHub fetch failed: {str(e)}", "data_source": "error_fallback"}

    async def _fetch(self, username: str) -> Dict[str, Any]:
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
                        languages(first: 10) { nodes { name } }
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

            return {
                "data": result.get("data", {}).get("user", {}),
                "data_source": "github_graphql",
            }
