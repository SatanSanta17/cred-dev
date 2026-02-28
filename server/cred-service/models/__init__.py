"""Pydantic models for API request/response schemas."""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


# ================================
# EXTRACTION
# ================================

class ExtractionResponse(BaseModel):
    job_id: str
    status: str
    message: str


class ExtractionStatusResponse(BaseModel):
    job_id: str
    status: str
    candidate_name: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    error: Optional[str] = None


# ================================
# GENERATION
# ================================

class GenerationResponse(BaseModel):
    job_id: str
    status: str
    message: str


class GenerationStatusResponse(BaseModel):
    job_id: str
    status: str
    candidate_name: Optional[str] = None
    reports: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    error: Optional[str] = None


# ================================
# HEALTH
# ================================

class HealthResponse(BaseModel):
    status: str
    database: str
