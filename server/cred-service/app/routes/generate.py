import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db, AnalysisJob, SessionLocal
from services.report_generator import ReportGenerator
from services.raw_data_loader import RawDataLoader
from services.report_storage import ReportStorageService

logger = logging.getLogger(__name__)

router = APIRouter()


def _run_generation_pipeline(job_id: str):
    """
    Pipeline:
    1. Load raw platform data
    2. Feed raw data directly to LLM — it handles credibility, company research, analysis, everything
    3. Store raw data + reports

    No intermediate engines, no web scraping, no pre-processing.
    The LLM sees all raw signals and does all the reasoning using its own knowledge.
    """
    db = SessionLocal()

    try:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if not job:
            return

        # Phase 1: Load raw platform data
        loader = RawDataLoader(db)
        raw_data = loader.load_job_raw_data(job_id)

        # Phase 2: LLM generates everything — credibility, company assessment, analysis, reports
        report_gen = ReportGenerator()
        reports = report_gen.generate_reports(raw_data)

        # Phase 3: Store everything
        storage = ReportStorageService()
        storage.save_reports(job_id, {
            "raw_data": raw_data,
            "reports": reports,
        })

        job.status = "completed"
        job.updated_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        logger.error(f"Generation pipeline failed for {job_id}: {e}", exc_info=True)
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.error_message = str(e)
            job.updated_at = datetime.utcnow()
            db.commit()

    finally:
        db.close()


@router.post("/generate/{job_id}")
async def generate_reports(
    job_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Generate intelligence reports from previously extracted raw data.
    Flow: extracted -> generating -> completed
    """

    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != "extracted":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot generate reports. Current job status: {job.status}. Must be 'extracted'."
        )

    # Move job to generating state
    job.status = "generating"
    job.updated_at = datetime.utcnow()
    db.commit()

    # Run generation in background (non-blocking)
    background_tasks.add_task(_run_generation_pipeline, job_id)

    return {
        "job_id": job_id,
        "status": "generating",
        "message": "Intelligence generation started. Poll GET /api/v1/generate/{job_id} for results."
    }


@router.get("/generate/{job_id}")
async def get_generation_status(job_id: str, db: Session = Depends(get_db)):
    """Get report generation status and results."""
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status == "completed":
        reports = ReportStorageService().get_reports(job_id)
        return {
            "job_id": job_id,
            "status": "completed",
            "candidate_name": job.candidate_name,
            "reports": reports
        }

    elif job.status == "failed":
        return {
            "job_id": job_id,
            "status": "failed",
            "error": job.error_message
        }

    else:
        return {
            "job_id": job_id,
            "status": job.status,
            "message": f"Current status: {job.status}. Poll again for updates."
        }
