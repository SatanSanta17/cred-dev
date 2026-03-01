"""
Report Storage v5

Stores pipeline outputs:
- raw_signals: complete raw platform data bundle (source of truth)
- extensive_report: LLM-generated deep analysis
- developer_insight: LLM-generated growth direction
- recruiter_insight: LLM-generated hiring decision support
"""

from datetime import datetime
import json
import logging
from app.database import SessionLocal, Report

logger = logging.getLogger(__name__)


class ReportStorageService:

    def save_reports(self, job_id: str, pipeline_output: dict):
        db = SessionLocal()
        now = datetime.utcnow()

        try:
            reports = pipeline_output.get("reports", {})

            records = [
                # Raw signals — complete platform data
                Report(
                    job_id=job_id,
                    layer="raw_signals",
                    content=json.dumps(pipeline_output.get("raw_data", {})),
                    created_at=now,
                ),
                # LLM reports
                Report(
                    job_id=job_id,
                    layer="extensive_report",
                    content=reports.get("extensive_report"),
                    created_at=now,
                ),
                Report(
                    job_id=job_id,
                    layer="developer_insight",
                    content=reports.get("developer_insight"),
                    created_at=now,
                ),
                Report(
                    job_id=job_id,
                    layer="recruiter_insight",
                    content=reports.get("recruiter_insight"),
                    created_at=now,
                ),
            ]

            db.add_all(records)
            db.commit()

        except Exception as e:
            logger.error(f"Failed to save reports for {job_id}: {e}")
            db.rollback()
            raise

        finally:
            db.close()

    def get_reports(self, job_id: str) -> dict:
        db = SessionLocal()
        try:
            reports = db.query(Report).filter(Report.job_id == job_id).all()
            result = {}
            for report in reports:
                if report.layer == "raw_signals":
                    try:
                        result[report.layer] = json.loads(report.content) if report.content else {}
                    except (json.JSONDecodeError, TypeError):
                        result[report.layer] = report.content
                else:
                    result[report.layer] = report.content
            return result
        finally:
            db.close()
