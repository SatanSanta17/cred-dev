"""Utility functions for the cred service."""

import re
from typing import Optional
from urllib.parse import urlparse

def extract_github_username(url: str) -> Optional[str]:
    """Extract GitHub username from URL."""
    if not url:
        return None

    # Handle various GitHub URL formats
    patterns = [
        r'github\.com/([^/]+)',
        r'github\.com/([^/]+)/?',
    ]

    for pattern in patterns:
        match = re.search(pattern, url, re.IGNORECASE)
        if match:
            return match.group(1)

    return None

def extract_leetcode_username(url: str) -> Optional[str]:
    """Extract LeetCode username from URL or profile string."""
    if not url:
        return None

    # Handle direct username input
    if not url.startswith('http'):
        return url.strip('/')

    # Handle LeetCode URL formats
    patterns = [
        r'leetcode\.com/([^/]+)',
        r'leetcode\.com/u/([^/]+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, url, re.IGNORECASE)
        if match:
            return match.group(1)

    return None

def validate_url(url: str) -> bool:
    """Basic URL validation."""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def format_datetime(dt) -> str:
    """Format datetime for display."""
    if hasattr(dt, 'strftime'):
        return dt.strftime('%Y-%m-%d %H:%M:%S UTC')
    return str(dt)

def calculate_experience_years(start_date, end_date=None) -> float:
    """Calculate years of experience from dates."""
    # Simplified calculation - in practice, use proper date parsing
    if not start_date:
        return 0

    # This would need proper date parsing in production
    # For now, return a placeholder
    return 2.5

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage."""
    # Remove or replace unsafe characters
    safe_name = re.sub(r'[^\w\-_\.]', '_', filename)
    return safe_name[:255]  # Limit length