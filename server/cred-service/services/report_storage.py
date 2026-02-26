from datetime import datetime
import json
from app.database import SessionLocal, Report

class ReportStorageService:

    def save_reports(self, job_id: str, pipeline_output: dict):

        db = SessionLocal()
        now = datetime.utcnow()

        try:
            reports = pipeline_output.get("reports", {})
            signal_summary = pipeline_output.get("signal_summary", {})

            records = [
                Report(
                    job_id=job_id,
                    layer="signal_summary",
                    content=json.dumps(signal_summary),
                    created_at=now
                ),
                Report(
                    job_id=job_id,
                    layer="extensive_report",
                    content=reports.get("extensive_report"),
                    created_at=now
                ),
                Report(
                    job_id=job_id,
                    layer="developer_insight",
                    content=reports.get("developer_insight"),
                    created_at=now
                ),
                Report(
                    job_id=job_id,
                    layer="recruiter_insight",
                    content=reports.get("recruiter_insight"),
                    created_at=now
                )
            ]

            db.add_all(records)
            db.commit()

        finally:
            db.close()

    def get_reports(self, job_id: str) -> dict:
        db = SessionLocal()
        reports = db.query(Report).filter(Report.job_id == job_id).all()
        return {report.layer: report.content for report in reports}