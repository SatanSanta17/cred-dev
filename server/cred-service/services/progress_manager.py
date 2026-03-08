"""
In-memory progress tracking for report generation jobs.
SSE endpoint reads from this to stream updates to the frontend.
"""

import logging
from typing import Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

STAGES = {
    "loading_data":          {"pct": 5,   "msg": "Loading extracted platform data..."},
    "generating_extensive":  {"pct": 10,  "msg": "Generating comprehensive technical report..."},
    "generating_developer":  {"pct": 50,  "msg": "Creating developer growth insights..."},
    "generating_recruiter":  {"pct": 80,  "msg": "Preparing recruiter hiring signal..."},
    "storing":               {"pct": 95,  "msg": "Storing your credibility reports..."},
    "sending_email":         {"pct": 98,  "msg": "Sending reports to your email..."},
    "completed":             {"pct": 100, "msg": "Your credibility report is ready!"},
    "failed":                {"pct": 0,   "msg": "Report generation failed."},
}


class ProgressManager:
    """Thread-safe (GIL) in-memory progress tracker."""

    def __init__(self):
        self._jobs: Dict[str, Dict] = {}

    def init(self, job_id: str):
        self._jobs[job_id] = {
            "stage": "pending",
            "percentage": 0,
            "message": "Initializing...",
            "timestamp": datetime.utcnow().isoformat(),
        }

    def update(self, job_id: str, stage: str, extra: dict = None):
        logger.debug(f"Progress update job_id={job_id} stage={stage}" + (f" extra={extra}" if extra else ""))
        info = STAGES.get(stage, {"pct": 0, "msg": stage})
        entry = {
            "stage": stage,
            "percentage": info["pct"],
            "message": info["msg"],
            "timestamp": datetime.utcnow().isoformat(),
        }
        # Add 'status' for terminal stages so frontend can detect completion
        if stage in ("completed", "failed"):
            entry["status"] = stage
        # Merge any extra data (e.g., email_failed flag)
        if extra:
            entry.update(extra)
        self._jobs[job_id] = entry

    def update_message(self, job_id: str, message: str):
        """Update only the message field — keeps current stage and percentage."""
        entry = self._jobs.get(job_id)
        if entry:
            entry["message"] = message
            entry["timestamp"] = datetime.utcnow().isoformat()

    def increment_percentage(self, job_id: str, delta: int, max_pct: int):
        """Nudge percentage up by delta, capped at max_pct."""
        entry = self._jobs.get(job_id)
        if entry:
            entry["percentage"] = min(entry["percentage"] + delta, max_pct)
            entry["timestamp"] = datetime.utcnow().isoformat()

    def get(self, job_id: str) -> Optional[Dict]:
        return self._jobs.get(job_id)

    def clear(self, job_id: str):
        self._jobs.pop(job_id, None)


# Singleton — shared across routes and background tasks
progress_manager = ProgressManager()
