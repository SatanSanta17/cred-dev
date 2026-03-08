import logging
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.database import RawData

logger = logging.getLogger(__name__)


class RawDataLoader:
    """
    Fetches and reconstructs raw extracted signals for a job
    from the raw_data table.

    Output becomes the single source input for report generation.
    Keys are dynamic — any platform_id stored during extraction
    becomes a key in the returned dict.
    """

    def __init__(self, db: Session):
        self.db = db

    def load_job_raw_data(self, job_id: str) -> Dict[str, Any]:
        """
        Returns raw data grouped by platform.

        Keys are dynamic based on what was extracted:
        {
            "resume": {...},
            "github": {...},
            "leetcode": {...},
            "kaggle": {...},    # if submitted
            "linkedin": {...},  # if submitted
            ...
        }
        """

        records = (
            self.db.query(RawData)
            .filter(RawData.job_id == job_id)
            .all()
        )

        if not records:
            logger.warning(f"No raw data found for job_id={job_id}")
            raise ValueError(f"No raw data found for job_id={job_id}")

        raw_bundle = {}
        for record in records:
            data_type = record.data_type.lower()
            raw_bundle[data_type] = record.data

        logger.info(f"Loaded raw data for job_id={job_id} — platforms={list(raw_bundle.keys())}")
        return raw_bundle
