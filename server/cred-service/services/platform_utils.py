"""Platform detection utilities.

Auto-detects platform name from URL domain. Used by the frontend (auto-label)
and backend (data_type for raw_data storage).
"""

from urllib.parse import urlparse
from typing import Optional


# Domain → platform_id mapping
# Add new platforms here — no other changes needed for web-search-based extraction.
DOMAIN_MAP = {
    "github.com": "github",
    "leetcode.com": "leetcode",
    "linkedin.com": "linkedin",
    "kaggle.com": "kaggle",
    "codechef.com": "codechef",
    "codeforces.com": "codeforces",
    "huggingface.co": "huggingface",
    "hackerrank.com": "hackerrank",
    "hackerearth.com": "hackerearth",
    "stackoverflow.com": "stackoverflow",
    "medium.com": "medium",
    "dev.to": "devto",
    "behance.net": "behance",
    "dribbble.com": "dribbble",
    "npmjs.com": "npm",
    "pypi.org": "pypi",
    "gitlab.com": "gitlab",
    "bitbucket.org": "bitbucket",
}

# Human-readable display names
PLATFORM_NAMES = {
    "github": "GitHub",
    "leetcode": "LeetCode",
    "linkedin": "LinkedIn",
    "kaggle": "Kaggle",
    "codechef": "CodeChef",
    "codeforces": "Codeforces",
    "huggingface": "HuggingFace",
    "hackerrank": "HackerRank",
    "hackerearth": "HackerEarth",
    "stackoverflow": "Stack Overflow",
    "medium": "Medium",
    "devto": "DEV Community",
    "behance": "Behance",
    "dribbble": "Dribbble",
    "npm": "npm",
    "pypi": "PyPI",
    "gitlab": "GitLab",
    "bitbucket": "Bitbucket",
}

# Platforms with dedicated extractors (not routed to WebSearchFetcher)
DEDICATED_PLATFORMS = {"github", "leetcode"}


def detect_platform(url: str) -> str:
    """Detect platform_id from a URL. Returns domain-based slug if not in DOMAIN_MAP."""
    try:
        parsed = urlparse(url if "://" in url else f"https://{url}")
        hostname = (parsed.hostname or "").lower().lstrip("www.")

        for domain, platform_id in DOMAIN_MAP.items():
            if hostname == domain or hostname.endswith(f".{domain}"):
                return platform_id

        # Fallback: use the domain name as the platform_id
        return hostname.split(".")[0] if hostname else "unknown"
    except Exception:
        return "unknown"


def get_platform_name(platform_id: str) -> str:
    """Get human-readable name for a platform_id."""
    return PLATFORM_NAMES.get(platform_id, platform_id.capitalize())


def is_dedicated_platform(platform_id: str) -> bool:
    """Check if a platform has a dedicated extractor."""
    return platform_id in DEDICATED_PLATFORMS
