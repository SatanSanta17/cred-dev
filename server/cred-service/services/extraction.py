import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, RawData, AnalysisJob
from app.config import settings

from services.resume_parser import ResumeParser
from services.github_fetcher import GitHubFetcher
from services.leetcode_fetcher import LeetCodeFetcher
from services.linkedin_fetcher import LinkedInFetcher

logger = logging.getLogger(__name__)


class ExtractionService:
    """
    Handles raw signal acquisition only.
    Each platform extraction is independent — one failure doesn't block others.
    """

    def __init__(self):
        self.resume_parser = ResumeParser()
        self.github_fetcher = GitHubFetcher(token=settings.github_token)
        self.leetcode_fetcher = LeetCodeFetcher()
        self.linkedin_fetcher = LinkedInFetcher()

    async def run_extraction(
        self,
        job_id: str,
        resume_bytes: bytes = None,
        resume_filename: str = None,
        github_url: str = None,
        leetcode_url: str = None,
        linkedin_url: str = None,
        candidate_name: str = None,
    ):
        db: Session = SessionLocal()
        errors = []

        try:
            self._update_job_status(db, job_id, "extracting")

            # ---------------------------
            # RESUME EXTRACTION
            # ---------------------------
            if resume_bytes:
                try:
                    resume_data = self.resume_parser.parse_resume_bytes(resume_bytes, resume_filename)
                    self._store_raw(db, job_id, "resume", resume_data)
                except Exception as e:
                    logger.error(f"Resume extraction failed for {job_id}: {e}")
                    errors.append(f"resume: {str(e)}")
                    self._store_raw(db, job_id, "resume", {"error": str(e)})

            # ---------------------------
            # GITHUB EXTRACTION
            # ---------------------------
            if github_url:
                try:
                    username = self._extract_github_username(github_url)
                    if username:
                        github_data = await self.github_fetcher.fetch_user_data(username)
                        self._store_raw(db, job_id, "github", github_data)
                    else:
                        errors.append("github: could not extract username from URL")
                        self._store_raw(db, job_id, "github", {"error": "invalid URL", "profile": {}, "repository_intelligence": {"total_repositories": 0, "top_repositories": [], "all_repositories": []}})
                except Exception as e:
                    logger.error(f"GitHub extraction failed for {job_id}: {e}")
                    errors.append(f"github: {str(e)}")
                    self._store_raw(db, job_id, "github", {"error": str(e), "profile": {}, "repository_intelligence": {"total_repositories": 0, "top_repositories": [], "all_repositories": []}})

            # ---------------------------
            # LEETCODE EXTRACTION
            # ---------------------------
            if leetcode_url:
                try:
                    username = self._extract_leetcode_username(leetcode_url)
                    if username:
                        leetcode_data = await self.leetcode_fetcher.fetch_user_data(username)
                        self._store_raw(db, job_id, "leetcode", leetcode_data)
                    else:
                        errors.append("leetcode: could not extract username from URL")
                        self._store_raw(db, job_id, "leetcode", {"error": "invalid URL", "problem_solving_stats": {"total_solved": 0}})
                except Exception as e:
                    logger.error(f"LeetCode extraction failed for {job_id}: {e}")
                    errors.append(f"leetcode: {str(e)}")
                    self._store_raw(db, job_id, "leetcode", {"error": str(e), "problem_solving_stats": {"total_solved": 0}})

            # ---------------------------
            # LINKEDIN EXTRACTION (OPTIONAL)
            # ---------------------------
            if linkedin_url:
                try:
                    linkedin_data = await self.linkedin_fetcher.fetch_user_data(linkedin_url)
                    self._store_raw(db, job_id, "linkedin", linkedin_data)
                except Exception as e:
                    logger.error(f"LinkedIn extraction failed for {job_id}: {e}")
                    errors.append(f"linkedin: {str(e)}")
                    self._store_raw(db, job_id, "linkedin", {"error": str(e)})

            # ---------------------------
            # DONE — mark as extracted even if some platforms had errors
            # ---------------------------
            # Pseudocode for desired logic:
            total_sources_requested = sum([bool(resume_bytes), bool(github_url), bool(leetcode_url), bool(linkedin_url)])
            successful_extractions = total_sources_requested - len(errors)

            if successful_extractions == 0 and total_sources_requested > 0:
                # All sources failed - fail the entire extraction
                self._update_job_status(db, job_id, "failed", "All requested data sources failed to extract")
            else:
                # Some sources succeeded or none were requested
                error_msg = "; ".join(errors) if errors else None
                self._update_job_status(db, job_id, "extracted", error_msg)
        except Exception as e:
            logger.error(f"Extraction completely failed for {job_id}: {e}")
            self._update_job_status(db, job_id, "failed", str(e))

        finally:
            db.close()

    # ---------------------------
    # HELPERS
    # ---------------------------

    def _store_raw(self, db: Session, job_id: str, data_type: str, payload: dict):
        db.add(
            RawData(
                job_id=job_id,
                data_type=data_type,
                data=payload,
                fetched_at=datetime.utcnow()
            )
        )
        db.commit()

    def _update_job_status(self, db: Session, job_id: str, status: str, error: str = None):
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if job:
            job.status = status
            job.updated_at = datetime.utcnow()
            if error:
                job.error_message = error
            db.commit()

    def _extract_github_username(self, url: str) -> str:
        if "github.com/" in url:
            parts = url.split("github.com/")[1].split("/")[0].split("?")[0]
            return parts.strip()
        return ""

    def _extract_leetcode_username(self, url: str) -> str:
        if "leetcode.com/" in url:
            path = url.split("leetcode.com/")[1].strip("/")
            if path.startswith("u/"):
                return path.split("/")[1].split("?")[0]
            return path.split("/")[0].split("?")[0]
        return ""
