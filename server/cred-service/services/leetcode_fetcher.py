"""
LeetCode Intelligence Fetcher v2
GraphQL ingestion + structured telemetry extraction.

NO scoring.
NO report logic.
Only raw intelligence signals.
"""

import httpx
from datetime import datetime, timezone
from typing import Dict, Any, List


class LeetCodeFetcher:

    def __init__(self):
        self.base_url = "https://leetcode.com"

    async def fetch_user_data(self, username: str) -> Dict[str, Any]:
        try:
            data = await self._fetch_via_graphql(username)
            if data and "error" not in data:
                return data
        except Exception as e:
            return {
                "username": username,
                "error": f"LeetCode ingestion failed: {str(e)}"
            }

    async def _fetch_via_graphql(self, username: str) -> Dict[str, Any]:
        graphql_url = "https://leetcode.com/graphql"

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
                contest { startTime }
                rating
                ranking
            }
        }
        """

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(graphql_url, json={
                "query": query,
                "variables": {"username": username}
            })

            if response.status_code != 200:
                return {"error": "GraphQL request failed"}

            json_data = response.json().get("data", {})
            return self._parse_graphql_response(json_data, username)

    # -------------------------
    # PARSING
    # -------------------------

    def _parse_graphql_response(self, data: Dict[str, Any], username: str):

        user = data.get("matchedUser", {})
        submit_stats = user.get("submitStats", {})

        ac = submit_stats.get("acSubmissionNum", [])
        total = submit_stats.get("totalSubmissionNum", [])

        total_solved = self._extract_all_bucket(ac, "count")
        total_submissions = self._extract_all_bucket(total, "submissions")

        acceptance_rate = (
            total_solved / total_submissions * 100
            if total_submissions > 0 else 0
        )

        recent_submissions = self._parse_recent_submissions(
            data.get("recentSubmissionList", [])
        )

        return {
            "profile_identity": self._extract_profile_identity(user),
            "problem_solving_stats": {
                "total_solved": total_solved,
                "acceptance_rate": round(acceptance_rate, 2),
                "difficulty_distribution": self._difficulty_breakdown(ac),
            },
            "topic_strengths": self._extract_topic_strengths(user),
            "contest_intelligence": self._extract_contest_signals(data),
            "consistency_signals": self._extract_calendar_signals(user),
            "recent_activity": self._build_recent_activity_metrics(recent_submissions),
            "badges": user.get("badges", []),
            "data_source": "leetcode_graphql"
        }

    # -------------------------
    # EXTRACTION HELPERS
    # -------------------------

    def _extract_all_bucket(self, rows, key):
        for r in rows:
            if r.get("difficulty") == "All":
                return r.get(key, 0)
        return 0

    def _difficulty_breakdown(self, rows):
        result = {"easy": 0, "medium": 0, "hard": 0}
        for r in rows:
            diff = r.get("difficulty", "").lower()
            if diff in result:
                result[diff] = r.get("count", 0)
        return result

    def _extract_profile_identity(self, user):
        profile = user.get("profile", {})
        return {
            "username": user.get("username"),
            "name": profile.get("realName"),
            "avatar": profile.get("userAvatar"),
            "country": profile.get("countryName"),
            "ranking": profile.get("ranking"),
            "reputation": profile.get("reputation"),
            "school": profile.get("school"),
            "company": profile.get("company"),
            "star_rating": profile.get("starRating"),
            "bio": profile.get("aboutMe"),
            "skill_tags": profile.get("skillTags", [])
        }

    def _extract_topic_strengths(self, user):
        topic_data = user.get("tagProblemCounts", {})
        return {
            "advanced": topic_data.get("advanced", []),
            "intermediate": topic_data.get("intermediate", []),
            "fundamental": topic_data.get("fundamental", [])
        }

    def _extract_contest_signals(self, data):
        ranking = data.get("userContestRanking", {})
        history = data.get("userContestRankingHistory", [])

        rating_trend = []
        for entry in history:
            rating_trend.append({
                "rating": entry.get("rating"),
                "ranking": entry.get("ranking"),
                "time": entry.get("contest", {}).get("startTime")
            })

        return {
            "current_rating": ranking.get("rating"),
            "global_ranking": ranking.get("globalRanking"),
            "contests_attended": ranking.get("attendedContestsCount"),
            "rating_history": rating_trend
        }

    def _extract_calendar_signals(self, user):
        calendar = user.get("userCalendar", {})
        return {
            "active_years": calendar.get("activeYears"),
            "total_active_days": calendar.get("totalActiveDays"),
            "current_streak": calendar.get("streak"),
            "submission_calendar": calendar.get("submissionCalendar")
        }

    def _parse_recent_submissions(self, rows: List[Dict[str, Any]]):
        parsed = []
        for s in rows:
            timestamp = s.get("timestamp")
            dt = ""
            if timestamp:
                dt = datetime.fromtimestamp(int(timestamp), tz=timezone.utc).isoformat()

            parsed.append({
                "title": s.get("title"),
                "slug": s.get("titleSlug"),
                "status": s.get("statusDisplay"),
                "language": s.get("lang"),
                "submitted_at": dt
            })
        return parsed

    def _build_recent_activity_metrics(self, recent_submissions):
        now = datetime.now(tz=timezone.utc)

        last_30 = last_90 = accepted = 0
        languages = set()

        for s in recent_submissions:
            if s["status"].lower() == "accepted":
                accepted += 1

            if s["language"]:
                languages.add(s["language"].lower())

            if s["submitted_at"]:
                days = (now - datetime.fromisoformat(s["submitted_at"])).days
                if days <= 30:
                    last_30 += 1
                if days <= 90:
                    last_90 += 1

        return {
            "recent_submissions": len(recent_submissions),
            "accepted_recent": accepted,
            "language_diversity": len(languages),
            "submissions_last_30_days": last_30,
            "submissions_last_90_days": last_90
        }