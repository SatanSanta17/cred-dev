import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db, AnalysisJob, Report, SessionLocal
from services.report_generator import ReportGenerator
from services.raw_data_loader import RawDataLoader
from services.report_storage import ReportStorageService
from services.progress_manager import progress_manager
from services.email_service import get_email_service

logger = logging.getLogger(__name__)

router = APIRouter()


def _run_generation_pipeline(job_id: str):
    """
    Pipeline with progress tracking:
    1. Load raw platform data
    2. Generate each report individually (with progress updates between)
    3. Store reports
    4. Send email
    """
    db = SessionLocal()

    try:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if not job:
            return

        # Delete any old reports from previous attempts (retry support)
        db.query(Report).filter(Report.job_id == job_id).delete()
        db.commit()

        # Phase 1: Load raw platform data
        progress_manager.update(job_id, "loading_data")
        loader = RawDataLoader(db)
        raw_data = loader.load_job_raw_data(job_id)

        # Phase 2: Generate reports individually with progress tracking
        report_gen = ReportGenerator()
        context = report_gen._build_llm_context(raw_data)

        progress_manager.update(job_id, "generating_extensive")
        extensive = report_gen._call_llm(
            report_gen._build_system_message("extensive"),
            report_gen._extensive_prompt(context),
        )

        progress_manager.update(job_id, "generating_developer")
        developer = report_gen._call_llm(
            report_gen._build_system_message("developer"),
            report_gen._developer_prompt(context),
        )

        progress_manager.update(job_id, "generating_recruiter")
        recruiter = report_gen._call_llm(
            report_gen._build_system_message("recruiter"),
            report_gen._recruiter_prompt(context),
        )

        reports = {
            "extensive_report": extensive,
            "developer_insight": developer,
            "recruiter_insight": recruiter,
        }

        # Phase 3: Store
        progress_manager.update(job_id, "storing")
        storage = ReportStorageService()
        storage.save_reports(job_id, {
            "raw_data": raw_data,
            "reports": reports,
        })

        # Phase 4: Send email
        progress_manager.update(job_id, "sending_email")
        try:
            email_service = get_email_service()
            email_service.send_reports(
                to_email=job.candidate_email,
                candidate_name=job.candidate_name,
                reports=reports,
            )
        except Exception as email_err:
            logger.warning(f"Email failed for {job_id}: {email_err}")
            # Email failure is non-fatal — reports are still stored

        # Done
        progress_manager.update(job_id, "completed")
        job.status = "completed"
        job.error_message = None
        job.updated_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        logger.error(f"Generation pipeline failed for {job_id}: {e}", exc_info=True)
        progress_manager.update(job_id, "failed")
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
    Supports retries — allows 'extracted', 'failed', or 'generating' status.
    """

    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    allowed = ["extracted", "failed", "generating"]
    if job.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot generate reports. Current status: {job.status}. Allowed: {allowed}"
        )

    # Reset state for retry
    job.status = "generating"
    job.error_message = None
    job.updated_at = datetime.utcnow()
    db.commit()

    # Initialize progress tracking
    progress_manager.init(job_id)

    # Run generation in background
    background_tasks.add_task(_run_generation_pipeline, job_id)

    return {
        "job_id": job_id,
        "status": "generating",
        "message": "Report generation started. Connect to SSE at GET /api/v1/generate/{job_id}/stream for live progress."
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
        progress = progress_manager.get(job_id)
        return {
            "job_id": job_id,
            "status": job.status,
            "progress": progress,
            "message": f"Current status: {job.status}. Poll again for updates."
        }
