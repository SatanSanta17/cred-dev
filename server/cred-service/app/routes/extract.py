from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import logging
from datetime import datetime
from ..database import get_db, AnalysisJob, SessionLocal
from services.extraction import ExtractionService
from services.raw_data_loader import RawDataLoader

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/extract")
async def extract_raw_data(
    background_tasks: BackgroundTasks,
    resume: Optional[UploadFile] = File(None),
    github_url: Optional[str] = Form(None),
    leetcode_url: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    candidate_name: Optional[str] = Form("Anonymous Candidate"),
    candidate_email: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Extract raw data from resume, github, leetcode, and linkedin.
    Triggers background extraction pipeline.
    """

    # Validate inputs
    if not any([resume, github_url, leetcode_url, linkedin_url]):
        raise HTTPException(
            status_code=400,
            detail="At least one input (resume, github_url, leetcode_url, or linkedin_url) required"
        )

    # Create job
    job_id = str(uuid.uuid4())
    job = AnalysisJob(
        id=job_id,
        candidate_name=candidate_name,
        candidate_email=candidate_email,
        user_id=user_id,
        status="pending",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        resume_url=None,
        github_url=github_url,
        leetcode_url=leetcode_url,
        linkedin_url=linkedin_url
    )

    try:
        db.add(job)
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create job: {str(e)}"
        )

    # Read resume bytes NOW — before the request closes and UploadFile becomes invalid
    resume_bytes = None
    resume_filename = None
    if resume:
        resume_bytes = await resume.read()
        resume_filename = resume.filename

    extraction_service = ExtractionService()

    # Wrapper to catch any crash and mark job as failed
    async def safe_extraction():
        try:
            await extraction_service.run_extraction(
                job_id=job_id,
                resume_bytes=resume_bytes,
                resume_filename=resume_filename,
                github_url=github_url,
                leetcode_url=leetcode_url,
                linkedin_url=linkedin_url,
                candidate_name=candidate_name,
            )
        except Exception as e:
            logger.error(f"Background extraction crashed for {job_id}: {e}")
            try:
                db_session = SessionLocal()
                job = db_session.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
                if job and job.status not in ("extracted", "failed"):
                    job.status = "failed"
                    job.error_message = f"Extraction crashed: {str(e)}"
                    job.updated_at = datetime.utcnow()
                    db_session.commit()
                db_session.close()
            except Exception:
                pass

    background_tasks.add_task(safe_extraction)

    return {
        "job_id": job_id,
        "status": "extracting",
        "message": "Extraction started. Poll GET /api/v1/extract/{job_id} for status."
    }


@router.get("/extract/{job_id}")
async def get_extraction_status(job_id: str, db: Session = Depends(get_db)):
    """Get the status and results of an extraction job."""
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Extraction sets status to "extracted" when done
    if job.status == "extracted":
        loader = RawDataLoader(db)
        try:
            raw_data = loader.load_job_raw_data(job_id)
        except ValueError:
            raise HTTPException(status_code=404, detail="Raw data not found")

        return {
            "job_id": job_id,
            "status": job.status,
            "candidate_name": job.candidate_name,
            "raw_data": raw_data
        }

    elif job.status == "failed":
        return {
            "job_id": job_id,
            "status": job.status,
            "error": job.error_message
        }

    else:
        return {
            "job_id": job_id,
            "status": job.status,
            "message": f"Current status: {job.status}. Poll again for updates."
        }
