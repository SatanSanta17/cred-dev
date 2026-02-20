"""Pydantic models for analysis requests and responses."""

from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class AnalysisRequest(BaseModel):
    """Request model for starting an analysis."""
    github_url: Optional[HttpUrl] = None
    leetcode_url: Optional[str] = None  # LeetCode doesn't use standard URLs
    user_id: Optional[str] = None

class AnalysisResponse(BaseModel):
    """Response model for analysis job creation."""
    job_id: str
    status: str
    message: str

class JobStatusResponse(BaseModel):
    """Response model for job status queries."""
    job_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    reports: Optional[List[dict]] = None
    error: Optional[str] = None

class ResumeData(BaseModel):
    """Structured resume data."""
    name: str
    experience_years: float
    skills: List[str]
    companies: List[str]
    education: str
    projects: List[dict]
    claims: List[dict]  # Now includes claim type and status

class GitHubData(BaseModel):
    """GitHub profile data."""
    profile: dict
    repositories: List[dict]
    stats: dict

class LeetCodeData(BaseModel):
    """LeetCode statistics."""
    username: str
    stats: dict
    recent_submissions: List[dict]