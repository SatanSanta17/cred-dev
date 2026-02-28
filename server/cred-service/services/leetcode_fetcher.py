"""
LeetCode Fetcher v3 — Raw GraphQL Response

Executes a single GraphQL query and returns the raw API response as-is.
No transformation, no scoring, no intermediate processing.
The LLM receives the raw data and does all the reasoning.
"""

import httpx
from typing import Dict, Any


class LeetCodeFetcher:

    def __init__(self):
        self.graphql_url = "https://leetcode.com/graphql"

    def _browser_headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com",
            "Origin": "https://leetcode.com",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
        }

    async def fetch_user_data(self, username: str) -> Dict[str, Any]:
        try:
            return await self._fetch(username)
        except Exception as e:
            return {"error": f"LeetCode fetch failed: {str(e)}", "data_source": "error_fallback"}

    async def _fetch(self, username: str) -> Dict[str, Any]:
        query = """
        query getFullLeetCodeProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    realName
                    userAvatar
                    countryName
                    aboutMe
                    ranking
                    reputation
                    school
                    company
                    skillTags
                    starRating
                }
                submitStats {
                    acSubmissionNum { difficulty count }
                    totalSubmissionNum { difficulty count submissions }
                }
                tagProblemCounts {
                    advanced { tagName problemsSolved }
                    intermediate { tagName problemsSolved }
                    fundamental { tagName problemsSolved }
                }
                userCalendar {
                    activeYears
                    streak
                    totalActiveDays
                    submissionCalendar
                }
                badges {
                    id
                    displayName
                    icon
                    creationDate
                }
            }
            recentSubmissionList(username: $username, limit: 100) {
                title
                titleSlug
                statusDisplay
                lang
                timestamp
            }
            userContestRanking(username: $username) {
                rating
                globalRanking
                attendedContestsCount
                topPercentage
            }
            userContestRankingHistory(username: $username) {
                contest { title startTime }
                rating
                ranking
                attended
            }
        }
        """

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                self.graphql_url,
                json={"query": query, "variables": {"username": username}},
                headers=self._browser_headers(),
            )

            if resp.status_code != 200:
                return {
                    "error": f"LeetCode GraphQL request failed: HTTP {resp.status_code}",
                    "data_source": "error_fallback",
                }

            return {
                "data": resp.json().get("data", {}),
                "data_source": "leetcode_graphql",
            }
