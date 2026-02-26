from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db, AnalysisJob
from services.pipeline_runner import CandidateAnalysisPipeline
from services.credibility_engine import CredibilityEngine
from services.intelligence_engine import IntelligenceEngine
from services.raw_data_loader import RawDataLoader
from services.report_storage import ReportStorageService
router = APIRouter()

@router.post("/generate/{job_id}")
async def generate_reports(
    job_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Generate intelligence reports from previously extracted raw data.

    Flow:
    extracted → generating → completed
    """

    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Guard 1: extraction must be completed
    if job.status != "extracted":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot generate reports. Current job status: {job.status}"
        )

    # Move job to generating state
    job.status = "generating"
    job.updated_at = datetime.utcnow()
    db.commit()

    loader = RawDataLoader(db)
    raw_data = loader.load_job_raw_data(job_id)
    if not raw_data:
        raise HTTPException(status_code=404, detail="Raw data not found")

    resume_claims = raw_data["resume"].get("claims", {})
    github_raw = raw_data["github"]
    leetcode_raw = raw_data["leetcode"]

    credibility_output = CredibilityEngine().evaluate(
        resume_claims,
        github_raw,
        leetcode_raw
    )

    intelligence_output = IntelligenceEngine().generate_intelligence(
        github_raw,
        leetcode_raw,
        resume_claims,
        credibility_output
    ) 

    pipeline = CandidateAnalysisPipeline()
    try:
        result = pipeline.run_analysis(intelligence_output, credibility_output)

        ReportStorageService().save_reports(job_id, result)
        job.status = "completed"
        job.updated_at = datetime.utcnow()
        db.commit()
        # background_tasks.add_task(
        #     pipeline_runner.run_generation_pipeline,
        #     job_id=job_id
        # )

    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        job.updated_at = datetime.utcnow()
        db.commit()

    return {
        "job_id": job_id,
        "status": "generating",
        "message": "Intelligence generation started. Check status at GET /generate/{job_id}"
    }

@router.get("/generate/{job_id}")
async def get_generation_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # return report
    reports = ReportStorageService().get_reports(job_id)
    return reports