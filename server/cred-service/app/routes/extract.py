
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from datetime import datetime
from ..database import get_db, AnalysisJob
from services.extraction import ExtractionService
from services.raw_data_loader import RawDataLoader
router = APIRouter()

@router.post("/extract")
async def extract_raw_data(
    background_tasks: BackgroundTasks,
    resume: Optional[UploadFile] = File(None),
    github_url: Optional[str] = Form(None),
    leetcode_url: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    candidate_name: Optional[str] = Form("Anonymous Candidate"),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Extract raw data from the resume, github, leetcode, and linkedin.

    Triggers the extraction pipeline:
    1. Resume extraction
    2. GitHub extraction
    3. Leetcode extraction
    4. LinkedIn extraction
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
        user_id=user_id,
        status="pending",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        resume_url=None,  # We'll store file later
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

    extraction_service = ExtractionService()

    # Trigger background extraction
    background_tasks.add_task(
        extraction_service.run_extraction,
        job_id=job_id,
        resume_file=resume,
        github_url=github_url,
        leetcode_url=leetcode_url,
        linkedin_url=linkedin_url,
        candidate_name=candidate_name
    )

    return {
        "job_id": job_id,
        "status": "extracting",
        "message": "Extraction process started. Check final output at GET /extract/{job_id}"
    }

@router.get("/extract/{job_id}")
async def get_extraction_status(job_id: str, db: Session = Depends(get_db)):
    """
    Get the status and results of an extraction job.
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    
    if job.status == "completed":

        loader = RawDataLoader(db)
        raw_data = loader.load_job_raw_data(job_id)
        if not raw_data:
            raise HTTPException(status_code=404, detail="Raw data not found")

        return {
            "job_id": job_id,
            "status": job.status,
            "raw_data": raw_data
        }
    else:
        return {
            "job_id": job_id,
            "status": job.status,
            "message": "Extraction process in progress. Check final output at GET /extract/{job_id}"
        }   