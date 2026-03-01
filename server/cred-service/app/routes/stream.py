import logging
import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db, AnalysisJob, SessionLocal
from services.progress_manager import progress_manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/generate/{job_id}/stream")
async def stream_generation_progress(job_id: str, db: Session = Depends(get_db)):
    """
    Server-Sent Events endpoint for real-time generation progress.
    Frontend connects: const es = new EventSource('/api/v1/generate/{job_id}/stream')
    """

    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_stream():
        timeout = 600  # 10 minutes max
        elapsed = 0

        while elapsed < timeout:
            progress = progress_manager.get(job_id)

            if progress:
                yield f"data: {json.dumps(progress)}\n\n"

                # Stop streaming on terminal states
                if progress["stage"] in ("completed", "failed"):
                    break
            else:
                # Job might already be done (no progress tracked) — check DB
                check_db = SessionLocal()
                try:
                    check_job = check_db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
                    if check_job and check_job.status in ("completed", "failed"):
                        final = {
                            "stage": check_job.status,
                            "status": check_job.status,
                            "percentage": 100 if check_job.status == "completed" else 0,
                            "message": "Complete!" if check_job.status == "completed" else (check_job.error_message or "Failed"),
                            "timestamp": (check_job.updated_at or "").isoformat() if check_job.updated_at else "",
                        }
                        yield f"data: {json.dumps(final)}\n\n"
                        break
                finally:
                    check_db.close()

            await asyncio.sleep(1)
            elapsed += 1

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
