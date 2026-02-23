"""LeetCode data fetching service using GraphQL API."""

import httpx
from datetime import datetime, timezone
from typing import Dict, Any, List

class LeetCodeFetcher:
    """Fetches LeetCode profile and problem-solving statistics using GraphQL API."""

    def __init__(self):
        self.base_url = "https://leetcode.com"

    async def fetch_user_data(self, username: str) -> Dict[str, Any]:
        """
        Fetch LeetCode user statistics using GraphQL API.

        LeetCode provides a GraphQL API that is more reliable than web scraping.

        Args:
            username: LeetCode username

        Returns:
            dict: User statistics and problem-solving data
        """
        try:
            # Try GraphQL API first (more reliable)
            result = await self._fetch_via_graphql(username)
            if result and 'error' not in result:
                return result

        except Exception as e:
            return {
                "username": username,
                "profile_url": f"{self.base_url}/u/{username}/",
                "error": f"Failed to fetch LeetCode data: {str(e)}",
                "stats": {}
            }

    async def _fetch_via_graphql(self, username: str) -> Dict[str, Any]:
        """
        Fetch LeetCode data using GraphQL API.
        This is the preferred method.
        """
        graphql_url = "https://leetcode.com/graphql"

        # GraphQL query to get user profile and submission stats
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
                acSubmissionNum {
                    difficulty
                    count
                }
                totalSubmissionNum {
                    difficulty
                    count
                    submissions
                }
                }

                tagProblemCounts {
                advanced {
                    tagName
                    tagSlug
                    problemsSolved
                }
                intermediate {
                    tagName
                    tagSlug
                    problemsSolved
                }
                fundamental {
                    tagName
                    tagSlug
                    problemsSolved
                }
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

                upcomingBadges {
                name
                icon
                progress
                }
            }

            recentSubmissionList(username: $username, limit: 100) {
                id
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
                contest {
                title
                startTime
                }
                rating
                ranking
                trendDirection
            }
        }
        """

        payload = {
            "query": query,
            "variables": {"username": username},
            # "operationName": "userProfile"
        }

        async with httpx.AsyncClient(
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://leetcode.com/',
                'Origin': 'https://leetcode.com'
            },
            timeout=30
        ) as client:
            try:
                response = await client.post(graphql_url, json=payload)

                if response.status_code == 200:
                    json_response = response.json()

                    if 'data' in json_response:
                        data = json_response['data']
                        if data:
                            return self._parse_graphql_response(data, username)
                        else:
                            return {
                                "username": username,
                                "profile_url": f"{self.base_url}/u/{username}/",
                                "error": "User not found",
                                "stats": {}
                            }
                    else:
                        return {
                            "username": username,
                            "profile_url": f"{self.base_url}/u/{username}/",
                            "error": "Invalid GraphQL response",
                            "stats": {}
                        }

                elif response.status_code == 403:
                    return {
                        "username": username,
                        "profile_url": f"{self.base_url}/u/{username}/",
                        "error": "GraphQL API blocked (403 Forbidden)",
                        "stats": {},
                        "fallback_available": True
                    }
                else:
                    return {
                        "username": username,
                        "profile_url": f"{self.base_url}/u/{username}/",
                        "error": f"GraphQL API error (status: {response.status_code})",
                        "stats": {},
                        "fallback_available": True
                    }

            except Exception as e:
                return {
                    "username": username,
                    "profile_url": f"{self.base_url}/u/{username}/",
                    "error": f"GraphQL request failed: {str(e)}",
                    "stats": {},
                    "fallback_available": True
                }

    def _parse_graphql_response(self, data: Dict[str, Any], username: str) -> Dict[str, Any]:
        """Parse the GraphQL response into our standardized format."""
        matched_user = data.get('matchedUser', {})

        # Extract submission counts using that find accuracy rate.
        submit_stats = matched_user.get('submitStats', {})
        total_solved = submit_stats.get('acSubmissionNum', [])[0].get('count', 0)
        total_submissions = submit_stats.get('totalSubmissionNum', [])[0].get('count', 0)
        acceptance_rate = (total_solved / total_submissions * 100) if total_submissions > 0 else 0
        submit_stats['acceptance_rate'] = acceptance_rate



        recent_submission_list = data.get('recentSubmissionList', [])
        recent_submissions = self._parse_recent_submissions(recent_submission_list)
        recent_metrics = self._build_recent_activity_metrics(recent_submissions)

        user_contest_ranking = data.get('userContestRanking', {})
        user_contest_ranking_history = data.get('userContestRankingHistory', [])


        return {
            "data": {
                "matched_user": matched_user,
                "recent_submission_list": recent_submission_list,
                "recent_activity_metrics": recent_metrics,
                "user_contest_ranking": user_contest_ranking,
                "user_contest_ranking_history": user_contest_ranking_history
            },
            "data_source": "graphql_api"
        }

    def _parse_recent_submissions(self, rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalize recent submission events from GraphQL response."""
        recent_submissions = []
        for submission in rows[:20]:
            timestamp_raw = submission.get('timestamp', '')
            submitted_at = ''
            try:
                if timestamp_raw:
                    submitted_at = datetime.fromtimestamp(int(timestamp_raw), tz=timezone.utc).isoformat()
            except (ValueError, TypeError, OSError):
                submitted_at = ''

            recent_submissions.append({
                "title": submission.get('title', ''),
                "title_slug": submission.get('titleSlug', ''),
                "status": submission.get('statusDisplay', ''),
                "language": submission.get('lang', ''),
                "submitted_at": submitted_at,
                "timestamp": timestamp_raw
            })
        return recent_submissions

    def _build_recent_activity_metrics(self, recent_submissions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate recent activity indicators for richer problem-solving assessment."""
        now = datetime.now(tz=timezone.utc)
        last_30 = 0
        last_90 = 0
        accepted_count = 0
        unique_titles = set()
        languages = set()

        for submission in recent_submissions:
            if submission.get('status', '').lower() == 'accepted':
                accepted_count += 1

            if submission.get('title_slug'):
                unique_titles.add(submission['title_slug'])

            if submission.get('language'):
                languages.add(submission['language'].lower())

            submitted_at = submission.get('submitted_at')
            if submitted_at:
                try:
                    submitted_dt = datetime.fromisoformat(submitted_at)
                    age_days = (now - submitted_dt).days
                    if age_days <= 30:
                        last_30 += 1
                    if age_days <= 90:
                        last_90 += 1
                except ValueError:
                    pass

        total_recent = len(recent_submissions)
        recent_acceptance_ratio = (accepted_count / total_recent * 100) if total_recent else 0

        return {
            "recent_submission_events": total_recent,
            "recent_unique_problems": len(unique_titles),
            "recent_languages_used": sorted(languages),
            "language_diversity_recent": len(languages),
            "submissions_last_30_days": last_30,
            "submissions_last_90_days": last_90,
            "recent_acceptance_ratio": round(recent_acceptance_ratio, 2)
        }
