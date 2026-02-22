"""LinkedIn data fetching service."""

import httpx
from bs4 import BeautifulSoup
from typing import Optional, Dict, Any
import re

class LinkedInFetcher:
    """Fetches LinkedIn profile and professional data."""

    def __init__(self):
        self.base_url = "https://www.linkedin.com"

    async def fetch_user_data(self, profile_url: str) -> Dict[str, Any]:
        """
        Fetch LinkedIn profile data.

        Note: LinkedIn requires authentication for most data.
        This implementation provides basic profile information that might be publicly available.

        Args:
            profile_url: LinkedIn profile URL

        Returns:
            dict: Profile data and professional information
        """
        try:
            # Extract username from URL
            username = self._extract_linkedin_username(profile_url)

            async with httpx.AsyncClient(
                headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                },
                follow_redirects=True
            ) as client:
                response = await client.get(profile_url, timeout=30)

                if response.status_code == 999:
                    # LinkedIn blocks automated requests
                    return {
                        "username": username,
                        "profile_url": profile_url,
                        "error": "LinkedIn requires authentication for detailed profile access",
                        "available_data": "limited",
                        "professional_summary": {
                            "current_position": None,
                            "experience_years": None,
                            "companies": [],
                            "education": [],
                            "skills": []
                        },
                        "network_info": {
                            "connections": None,
                            "followers": None
                        }
                    }

                soup = BeautifulSoup(response.text, 'html.parser')

                # Extract basic information (publicly available)
                profile_data = {
                    "username": username,
                    "profile_url": profile_url,
                    "full_name": self._extract_name(soup),
                    "headline": self._extract_headline(soup),
                    "location": self._extract_location(soup),
                    "professional_summary": {
                        "current_position": self._extract_current_position(soup),
                        "experience_years": self._estimate_experience_years(soup),
                        "companies": self._extract_companies(soup),
                        "education": self._extract_education(soup),
                        "skills": self._extract_skills(soup)
                    },
                    "network_info": {
                        "connections": self._extract_connections(soup),
                        "followers": None  # Hard to extract without auth
                    },
                    "timeline_consistency": self._analyze_timeline_consistency(soup),
                    "raw_html": response.text[:5000]  # Store limited HTML for analysis
                }

                return profile_data

        except Exception as e:
            return {
                "username": self._extract_linkedin_username(profile_url) if profile_url else None,
                "profile_url": profile_url,
                "error": f"Failed to fetch LinkedIn data: {str(e)}",
                "available_data": "none"
            }

    def _extract_linkedin_username(self, url: str) -> Optional[str]:
        """Extract LinkedIn username from URL."""
        if not url:
            return None

        # Handle various LinkedIn URL formats
        patterns = [
            r'linkedin\.com/in/([^/?]+)',
            r'linkedin\.com/pub/([^/?]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, url, re.IGNORECASE)
            if match:
                return match.group(1)

        return None

    def _extract_name(self, soup) -> Optional[str]:
        """Extract full name from LinkedIn profile."""
        # Try multiple selectors for name
        selectors = [
            'h1.text-heading-xlarge',
            '.pv-text-details__left-panel h1',
            '.pv-top-card--list .text-heading-large'
        ]

        for selector in selectors:
            name_elem = soup.select_one(selector)
            if name_elem:
                return name_elem.get_text(strip=True)

        return None

    def _extract_headline(self, soup) -> Optional[str]:
        """Extract professional headline."""
        selectors = [
            '.pv-text-details__left-panel .text-body-medium',
            '.pv-top-card--list .text-body-medium'
        ]

        for selector in selectors:
            headline_elem = soup.select_one(selector)
            if headline_elem:
                return headline_elem.get_text(strip=True)

        return None

    def _extract_location(self, soup) -> Optional[str]:
        """Extract location information."""
        selectors = [
            '.pv-text-details__left-panel .text-body-small',
            '.pv-top-card--list .text-body-small'
        ]

        for selector in selectors:
            location_elem = soup.select_one(selector)
            if location_elem and 'location' in location_elem.get_text().lower():
                return location_elem.get_text(strip=True)

        return None

    def _extract_current_position(self, soup) -> Optional[str]:
        """Extract current position."""
        # Look for current position indicators
        current_indicators = soup.select('.pv-entity__summary-info')
        for indicator in current_indicators:
            if 'present' in indicator.get_text().lower() or 'current' in indicator.get_text().lower():
                title_elem = indicator.select_one('.pv-entity__summary-info h3')
                if title_elem:
                    return title_elem.get_text(strip=True)

        return None

    def _estimate_experience_years(self, soup) -> Optional[float]:
        """Estimate total years of experience."""
        # This is a rough estimation based on visible experience
        experience_sections = soup.select('.pv-entity__summary-info')

        if not experience_sections:
            return None

        # Count unique companies and estimate time
        companies = set()
        for section in experience_sections:
            company_elem = section.select_one('.pv-entity__secondary-title')
            if company_elem:
                companies.add(company_elem.get_text(strip=True))

        # Rough estimation: 2 years per company on average
        return len(companies) * 2.0 if companies else None

    def _extract_companies(self, soup) -> list:
        """Extract list of companies worked at."""
        companies = []
        company_elements = soup.select('.pv-entity__secondary-title')

        for elem in company_elements[:10]:  # Limit to recent companies
            company = elem.get_text(strip=True)
            if company and company not in companies:
                companies.append(company)

        return companies

    def _extract_education(self, soup) -> list:
        """Extract education information."""
        education = []
        edu_elements = soup.select('.pv-education-entity .pv-entity__degree-name')

        for elem in edu_elements:
            degree = elem.get_text(strip=True)
            if degree:
                education.append(degree)

        return education

    def _extract_skills(self, soup) -> list:
        """Extract skills (limited without authentication)."""
        # Skills are often not visible without authentication
        # This might return empty or very limited data
        skills = []
        skill_elements = soup.select('.pv-skill-entity__skill-name')

        for elem in skill_elements:
            skill = elem.get_text(strip=True)
            if skill:
                skills.append(skill)

        return skills

    def _extract_connections(self, soup) -> Optional[int]:
        """Extract number of connections."""
        # This is usually not publicly visible
        return None

    def _analyze_timeline_consistency(self, soup) -> Dict[str, Any]:
        """Analyze timeline consistency in experience."""
        timeline_data = {
            "gaps_identified": False,
            "chronological_consistency": "unknown",
            "overlapping_roles": False
        }

        # Basic timeline analysis
        experience_dates = soup.select('.pv-entity__date-range span[aria-hidden="true"]')

        if len(experience_dates) > 1:
            # Could implement more sophisticated timeline analysis
            timeline_data["chronological_consistency"] = "needs_verification"

        return timeline_data