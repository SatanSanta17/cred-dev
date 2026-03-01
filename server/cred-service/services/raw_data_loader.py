from typing import Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import RawData


class RawDataLoader:
    """
    Fetches and reconstructs raw extracted signals for a job
    from raw_data table.

    Output becomes the single source input for:
    - credibility engine
    - intelligence engine
    """

    def __init__(self, db: Session):
        self.db = db

    # =====================================================
    # PUBLIC ENTRY
    # =====================================================

    def load_job_raw_data(self, job_id: str) -> Dict[str, Any]:
        """
        Returns structured raw data grouped by platform.

        {
            "resume": {...},
            "github": {...},
            "leetcode": {...},
            "linkedin": {...}
        }
        """

        records = (
            self.db.query(RawData)
            .filter(RawData.job_id == job_id)
            .all()
        )

        if not records:
            raise ValueError(f"No raw data found for job_id={job_id}")

        raw_bundle = {
            "resume": {},
            "github": {},
            "leetcode": {},
            "linkedin": {}
        }

        for record in records:
            data_type = record.data_type.lower()

            if data_type not in raw_bundle:
                # Future-proof: store unknown types
                raw_bundle[data_type] = record.data

            else:
                raw_bundle[data_type] = record.data

        return raw_bundle