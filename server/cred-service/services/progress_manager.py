"""
In-memory progress tracking for report generation jobs.
SSE endpoint reads from this to stream updates to the frontend.
"""

from typing import Dict, Optional
from datetime import datetime

STAGES = {
    "loading_data":          {"pct": 5,   "msg": "Loading extracted platform data..."},
    "generating_extensive":  {"pct": 15,  "msg": "Generating comprehensive technical report..."},
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

    def update(self, job_id: str, stage: str):
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
        self._jobs[job_id] = entry

    def get(self, job_id: str) -> Optional[Dict]:
        return self._jobs.get(job_id)

    def clear(self, job_id: str):
        self._jobs.pop(job_id, None)


# Singleton — shared across routes and background tasks
progress_manager = ProgressManager()
