import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from datetime import datetime
from ..database import get_db, AnalysisJob, Report
from services import AnalysisService
from models.reports import ReportLayer

router = APIRouter()


@router.post("/analyze")
async def start_analysis(
    background_tasks: BackgroundTasks,
    resume: Optional[UploadFile] = File(None),
    github_url: Optional[str] = Form(None),
    leetcode_url: Optional[str] = Form(None),
    candidate_name: Optional[str] = Form("Anonymous Candidate"),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Start a new analysis job using the Skill Intelligence Engine.

    Triggers the complete analysis pipeline:
    1. Raw signal extraction
    2. 4-domain analysis
    3. Intelligence core generation
    4. Derived view creation
    """

    # Validate inputs
    if not any([resume, github_url, leetcode_url]):
        raise HTTPException(
            status_code=400,
            detail="At least one input (resume, github_url, or leetcode_url) required"
        )

    # Create job
    job_id = str(uuid.uuid4())
    job = AnalysisJob(
        id=job_id,
        user_id=user_id,
        status="processing",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        resume_url=None,  # We'll store file later
        github_url=github_url,
        leetcode_url=leetcode_url
    )

    db.add(job)
    db.commit()

    # Trigger background analysis
    analysis_service = AnalysisService()
    background_tasks.add_task(
        analysis_service.run_intelligence_engine,
        job_id=job_id,
        resume_file=resume,
        github_url=github_url,
        leetcode_url=leetcode_url,
        candidate_name=candidate_name
    )

    return {
        "job_id": job_id,
        "status": "processing",
        "message": "Skill Intelligence Engine analysis started. Check status at GET /analyze/{job_id}"
    }


@router.get("/analyze/{job_id}")
async def get_analysis_status(job_id: str, db: Session = Depends(get_db)):
    """
    Get the status and results of an analysis job.

    Returns complete Skill Intelligence Engine results when completed.
    """

    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    response = {
        "job_id": job.id,
        "status": job.status,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }

    if job.status == "completed":
        reports = db.query(Report).filter(Report.job_id == job_id).all()
        report_map = {report.layer: report.content for report in reports}

        def _decode(content: Optional[str]):
            if not content:
                return None
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return {"content": content}

        response.update({
            "intelligence_core": _decode(report_map.get("intelligence_core")),
            "derived_views": {
                "developer_insight": _decode(report_map.get("developer_insight")),
                "recruiter_insight": _decode(report_map.get("recruiter_insight"))
            },
            "credibility_card": _decode(report_map.get("credibility_card"))
        })

    if job.error_message:
        response["error"] = job.error_message

    return response
