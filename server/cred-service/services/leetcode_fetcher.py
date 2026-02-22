"""LeetCode data fetching service using GraphQL API."""

import httpx
from bs4 import BeautifulSoup
import asyncio
from typing import Dict, Any

class LeetCodeFetcher:
    """Fetches LeetCode profile and problem-solving statistics using GraphQL API."""

    def __init__(self):
        self.base_url = "https://leetcode.com"

    async def fetch_user_data(self, username: str) -> Dict[str, Any]:
        """
        Fetch LeetCode user statistics using GraphQL API.

        LeetCode provides a GraphQL API that is more reliable than web scraping.
        Falls back to web scraping if GraphQL fails.

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

            # Fallback to web scraping if GraphQL fails
            return await self._fetch_via_scraping(username)

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
        This is the preferred method as it's official and more reliable.
        """
        graphql_url = "https://leetcode.com/graphql"

        # GraphQL query to get user profile and submission stats
        query = """
        query userProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    realName
                    aboutMe
                    skillTags
                    countryName
                    ranking
                    reputation
                    starRating
                }
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                    totalSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
                badges {
                    id
                    displayName
                }
                upcomingBadges {
                    name
                    icon
                }
            }
            recentSubmissionList(username: $username, limit: 20) {
                id
                title
                titleSlug
                timestamp
                statusDisplay
                lang
            }
        }
        """

        payload = {
            "query": query,
            "variables": {"username": username},
            "operationName": "userProfile"
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
                    data = response.json()

                    if 'data' in data and 'matchedUser' in data['data']:
                        user_data = data['data']['matchedUser']
                        if user_data:
                            return self._parse_graphql_response(user_data, username)
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

    def _parse_graphql_response(self, user_data: Dict[str, Any], username: str) -> Dict[str, Any]:
        """Parse the GraphQL response into our standardized format."""
        profile = user_data.get('profile', {})
        submit_stats = user_data.get('submitStats', {})

        # Extract submission counts by difficulty
        ac_submissions = submit_stats.get('acSubmissionNum', [])
        total_submissions = submit_stats.get('totalSubmissionNum', [])

        # Parse accepted submissions
        easy_count = medium_count = hard_count = 0
        total_solved = 0

        for submission in ac_submissions:
            difficulty = submission.get('difficulty', '').lower()
            count = submission.get('count', 0)
            total_solved += count

            if difficulty == 'easy':
                easy_count = count
            elif difficulty == 'medium':
                medium_count = count
            elif difficulty == 'hard':
                hard_count = count

        # Calculate acceptance rate (rough estimate)
        total_attempted = sum(sub.get('submissions', 0) for sub in total_submissions)
        acceptance_rate = (total_solved / total_attempted * 100) if total_attempted > 0 else 0

        # Parse recent submissions
        recent_submissions = []
        for submission in user_data.get('recentSubmissionList', [])[:10]:
            recent_submissions.append({
                "title": submission.get('title', ''),
                "status": submission.get('statusDisplay', 'Accepted'),
                "language": submission.get('lang', ''),
                "submitted_at": submission.get('timestamp', '')
            })

        return {
            "username": username,
            "profile_url": f"{self.base_url}/u/{username}/",
            "full_name": profile.get('realName', ''),
            "bio": profile.get('aboutMe', ''),
            "country": profile.get('countryName', ''),
            "ranking": profile.get('ranking'),
            "reputation": profile.get('reputation'),
            "skill_tags": profile.get('skillTags', []),
            "stats": {
                "total_solved": total_solved,
                "easy_count": easy_count,
                "medium_count": medium_count,
                "hard_count": hard_count,
                "acceptance_rate": round(acceptance_rate, 2),
                "ranking": profile.get('ranking')
            },
            "badges": [badge.get('displayName', '') for badge in user_data.get('badges', [])],
            "recent_submissions": recent_submissions,
            "data_source": "graphql_api"
        }

    async def _fetch_via_scraping(self, username: str) -> Dict[str, Any]:
        """
        Fallback method using web scraping when GraphQL fails.
        """
        try:
            await asyncio.sleep(2)  # Extra delay for scraping

            url = f"{self.base_url}/u/{username}/"

            async with httpx.AsyncClient(
                headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                },
                follow_redirects=True,
                timeout=30
            ) as client:
                response = await client.get(url)

                if response.status_code == 403:
                    return {
                        "username": username,
                        "profile_url": url,
                        "error": "LeetCode blocked scraping request (403 Forbidden)",
                        "stats": {},
                        "data_source": "blocked"
                    }
                elif response.status_code != 200:
                    return {
                        "username": username,
                        "profile_url": url,
                        "error": f"Failed to scrape profile (status: {response.status_code})",
                        "stats": {},
                        "data_source": "failed"
                    }

                soup = BeautifulSoup(response.text, 'html.parser')
                stats = self._extract_leetcode_stats(soup)
                recent_submissions = self._extract_recent_submissions(soup)

                return {
                    "username": username,
                    "profile_url": url,
                    "stats": stats,
                    "recent_submissions": recent_submissions,
                    "data_source": "web_scraping"
                }

        except Exception as e:
            return {
                "username": username,
                "profile_url": f"{self.base_url}/u/{username}/",
                "error": f"Scraping failed: {str(e)}",
                "stats": {},
                "data_source": "error"
            }

    def _extract_leetcode_stats(self, soup) -> Dict[str, Any]:
        """Extract statistics from LeetCode profile HTML (fallback method)."""
        stats = {
            "total_solved": 0,
            "easy_count": 0,
            "medium_count": 0,
            "hard_count": 0,
            "acceptance_rate": 0.0,
            "ranking": 0
        }

        try:
            # Look for stats in various possible locations
            # LeetCode's HTML structure can change, so we try multiple selectors

            # Try to find solved problems count
            solved_selectors = [
                '.text-[24px] font-medium',  # Common pattern
                '[data-cy="problem-solved"]',
                '.text-2xl.font-semibold',
                '.text-\\[24px\\].font-medium'
            ]

            for selector in solved_selectors:
                solved_elem = soup.select_one(selector)
                if solved_elem:
                    solved_text = solved_elem.get_text().strip()
                    # Extract number from text like "123 solved"
                    import re
                    match = re.search(r'(\d+)', solved_text)
                    if match:
                        stats["total_solved"] = int(match.group(1))
                        break

            # Try to find difficulty breakdown
            difficulty_selectors = [
                '.flex.items-center.space-x-4',
                '[data-cy="difficulty-stats"]',
                '.grid.grid-cols-3.gap-4'
            ]

            for selector in difficulty_selectors:
                difficulty_container = soup.select_one(selector)
                if difficulty_container:
                    # Look for Easy/Medium/Hard counts
                    stat_elements = difficulty_container.select('.text-sm, .font-medium, strong')

                    for elem in stat_elements:
                        text = elem.get_text().strip().lower()
                        if 'easy' in text:
                            # Find the number near this element
                            count_elem = elem.find_next_sibling() or elem.find_next()
                            if count_elem:
                                count_text = count_elem.get_text().strip()
                                match = re.search(r'(\d+)', count_text)
                                if match:
                                    stats["easy_count"] = int(match.group(1))
                        elif 'medium' in text:
                            count_elem = elem.find_next_sibling() or elem.find_next()
                            if count_elem:
                                count_text = count_elem.get_text().strip()
                                match = re.search(r'(\d+)', count_text)
                                if match:
                                    stats["medium_count"] = int(match.group(1))
                        elif 'hard' in text:
                            count_elem = elem.find_next_sibling() or elem.find_next()
                            if count_elem:
                                count_text = count_elem.get_text().strip()
                                match = re.search(r'(\d+)', count_text)
                                if match:
                                    stats["hard_count"] = int(match.group(1))

            # Try to find acceptance rate
            acceptance_selectors = [
                '[data-cy="acceptance-rate"]',
                '.text-green-600',
                '.text-green-500'
            ]

            for selector in acceptance_selectors:
                acceptance_elem = soup.select_one(selector)
                if acceptance_elem:
                    acceptance_text = acceptance_elem.get_text().strip()
                    # Look for percentage like "65.4%"
                    match = re.search(r'(\d+\.?\d*)%', acceptance_text)
                    if match:
                        stats["acceptance_rate"] = float(match.group(1))
                        break

            # Try to find ranking
            ranking_selectors = [
                '[data-cy="global-ranking"]',
                '.text-gray-600',
                '.text-sm.text-gray-500'
            ]

            for selector in ranking_selectors:
                ranking_elem = soup.select_one(selector)
                if ranking_elem:
                    ranking_text = ranking_elem.get_text().strip()
                    # Look for ranking number
                    match = re.search(r'#?([\d,]+)', ranking_text)
                    if match:
                        stats["ranking"] = int(match.group(1).replace(',', ''))
                        break

        except Exception as e:
            # If parsing fails, return empty stats
            pass

        return stats

    def _extract_recent_submissions(self, soup) -> list:
        """Extract recent submission data (fallback method)."""
        submissions = []

        try:
            # Look for recent submissions table or list
            submission_selectors = [
                '.recent-submissions',
                '[data-cy="recent-ac"]',
                '.space-y-2 > div'
            ]

            for selector in submission_selectors:
                submission_elements = soup.select(selector)
                if submission_elements:
                    for elem in submission_elements[:10]:  # Limit to recent 10
                        submission_data = {
                            "title": "",
                            "status": "accepted",
                            "language": "",
                            "submitted_at": ""
                        }

                        # Try to extract submission details
                        title_elem = elem.select_one('.text-sm, .font-medium')
                        if title_elem:
                            submission_data["title"] = title_elem.get_text().strip()

                        # This is a simplified extraction - in production,
                        # you'd need to handle LeetCode's dynamic content
                        if submission_data["title"]:
                            submissions.append(submission_data)

                    break

        except Exception as e:
            # If extraction fails, return empty list
            pass

        return submissions