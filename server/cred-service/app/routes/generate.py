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


# =========================================
# Section-aware messages for each report type.
# Rotated based on token progress during streaming.
# =========================================

EXTENSIVE_MESSAGES = [
    "Evaluating capability identity and role signals...",
    "Analyzing engineering depth across repositories...",
    "Reviewing problem solving patterns and difficulty spread...",
    "Assessing execution consistency across platforms...",
    "Checking production readiness signals in repos...",
    "Cross-referencing resume claims with platform evidence...",
    "Analyzing company background and domain context...",
    "Scanning for risk flags and discrepancies...",
    "Synthesizing final technical positioning...",
]

DEVELOPER_MESSAGES = [
    "Assessing current standing from platform data...",
    "Identifying verified strengths across your profile...",
    "Pinpointing critical gaps for growth...",
    "Crafting your 30-day action plan...",
    "Mapping 90-day career direction...",
]

RECRUITER_MESSAGES = [
    "Building candidate snapshot from verified data...",
    "Formulating hire recommendation and confidence...",
    "Summarizing verified technical strengths...",
    "Checking for red flags and discrepancies...",
    "Analyzing company background and domain fit...",
    "Determining role and team fit...",
]

WEB_SEARCH_MESSAGES = [
    "Searching the web for verification...",
    "Searching the web for company context...",
    "Searching the web for additional data...",
]


def _make_progress_callback(job_id: str, stage: str, pct_start: int, pct_end: int, messages: list):
    """
    Creates a progress callback for a single report's streaming LLM call.
    Rotates through section-aware messages and increments percentage within the given range.
    """
    state = {"msg_index": 0, "web_search_count": 0}
    pct_range = pct_end - pct_start
    msg_count = len(messages)
    # How many tokens (approx) before rotating to next message
    chars_per_message = 2000  # ~500 tokens, rough estimate

    def callback(event_type: str, detail: str):
        if event_type == "web_search":
            if detail == "searching":
                msg = WEB_SEARCH_MESSAGES[state["web_search_count"] % len(WEB_SEARCH_MESSAGES)]
                state["web_search_count"] += 1
                progress_manager.update_message(job_id, msg)
            # On web_search completed, resume the section message
            elif detail == "completed":
                idx = min(state["msg_index"], msg_count - 1)
                progress_manager.update_message(job_id, messages[idx])

        elif event_type == "text_progress":
            char_count = int(detail) if detail.isdigit() else 0
            # Rotate message based on characters generated
            new_idx = min(char_count // chars_per_message, msg_count - 1)
            if new_idx != state["msg_index"]:
                state["msg_index"] = new_idx
                progress_manager.update_message(job_id, messages[new_idx])
            # Increment percentage proportionally
            pct_step = max(1, pct_range // (msg_count * 2))
            progress_manager.increment_percentage(job_id, pct_step, pct_end)

    return callback


def _run_generation_pipeline(job_id: str):
    """
    Pipeline with streaming progress tracking:
    1. Load raw platform data
    2. Generate each report with streaming LLM calls (live progress messages)
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

        # Phase 2: Generate reports with streaming progress
        report_gen = ReportGenerator()
        context = report_gen._build_llm_context(raw_data)

        # Extensive report: 10% → 48%
        progress_manager.update(job_id, "generating_extensive")
        extensive_cb = _make_progress_callback(job_id, "generating_extensive", 10, 48, EXTENSIVE_MESSAGES)
        extensive = report_gen._call_llm_streaming(
            report_gen._build_system_message("extensive", raw_data=raw_data),
            report_gen._extensive_prompt(context),
            progress_callback=extensive_cb,
        )

        # Developer report: 50% → 78%
        progress_manager.update(job_id, "generating_developer")
        developer_cb = _make_progress_callback(job_id, "generating_developer", 50, 78, DEVELOPER_MESSAGES)
        developer = report_gen._call_llm_streaming(
            report_gen._build_system_message("developer", raw_data=raw_data),
            report_gen._developer_prompt(context),
            progress_callback=developer_cb,
        )

        # Recruiter report: 80% → 93%
        progress_manager.update(job_id, "generating_recruiter")
        recruiter_cb = _make_progress_callback(job_id, "generating_recruiter", 80, 93, RECRUITER_MESSAGES)
        recruiter = report_gen._call_llm_streaming(
            report_gen._build_system_message("recruiter", raw_data=raw_data),
            report_gen._recruiter_prompt(context),
            progress_callback=recruiter_cb,
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
        email_error = None
        try:
            email_service = get_email_service()
            email_service.send_reports(
                to_email=job.candidate_email,
                candidate_name=job.candidate_name,
                reports=reports,
            )
        except Exception as email_err:
            logger.warning(f"Email failed for {job_id}: {email_err}")
            email_error = str(email_err)
            # Email failure is non-fatal — reports are still stored

        # Done — include email_failed flag in SSE so frontend can show resend button
        extra = {"email_failed": True} if email_error else {}
        progress_manager.update(job_id, "completed", extra=extra)
        job.status = "completed"
        job.error_message = f"email_failed: {email_error}" if email_error else None
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

    # Guard: generation already in progress — return 409 with user-friendly message
    if job.status == "generating":
        raise HTTPException(
            status_code=409,
            detail="Report generation is already in progress. Please wait for it to complete."
        )

    # Guard: already completed — only allow with explicit retry flag
    if job.status == "completed":
        raise HTTPException(
            status_code=409,
            detail="Reports have already been generated for this analysis."
        )

    allowed = ["extracted", "failed"]
    if job.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot generate reports. Current status: {job.status}. Allowed: {', '.join(allowed)}"
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


@router.post("/generate/{job_id}/resend-email")
async def resend_email(job_id: str, db: Session = Depends(get_db)):
    """
    Resend report emails for a completed job.
    Only works when job status is 'completed' and reports exist in DB.
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot resend email. Job status is '{job.status}', must be 'completed'."
        )

    if not job.candidate_email:
        raise HTTPException(status_code=400, detail="No email address on file for this job.")

    # Load stored reports
    storage = ReportStorageService()
    stored = storage.get_reports(job_id)

    # Extract only the text reports (not raw_signals)
    reports = {
        k: v for k, v in stored.items()
        if k in ("extensive_report", "developer_insight", "recruiter_insight") and v
    }

    if not reports:
        raise HTTPException(status_code=400, detail="No reports found for this job.")

    try:
        email_service = get_email_service()
        email_service.send_reports(
            to_email=job.candidate_email,
            candidate_name=job.candidate_name,
            reports=reports,
        )
    except Exception as e:
        logger.error(f"Resend email failed for job_id={job_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Email delivery failed: {str(e)}")

    # Clear the email_failed error message since email succeeded now
    job.error_message = None
    job.updated_at = datetime.utcnow()
    db.commit()

    logger.info(f"Resend email successful for {job_id} to {job.candidate_email}")

    return {
        "job_id": job_id,
        "status": "sent",
        "message": f"Reports resent to {job.candidate_email}"
    }
