import logging
from datetime import datetime
from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.database import SessionLocal, RawData, AnalysisJob
from app.config import settings

from services.resume_parser import ResumeParser
from services.github_fetcher import GitHubFetcher
from services.leetcode_fetcher import LeetCodeFetcher
from services.web_search_fetcher import WebSearchFetcher
from services.platform_utils import is_dedicated_platform

logger = logging.getLogger(__name__)


class ExtractionService:
    """
    Handles raw signal acquisition from all platforms.

    Dedicated extractors: GitHub (GraphQL), LeetCode (GraphQL), Resume (PyPDF2).
    All other URLs: WebSearchFetcher (OpenAI web_search_preview).

    Each platform extraction is independent — one failure doesn't block others.
    """

    def __init__(self):
        self.resume_parser = ResumeParser()
        self.github_fetcher = GitHubFetcher(token=settings.github_token)
        self.leetcode_fetcher = LeetCodeFetcher()
        self.web_search_fetcher = WebSearchFetcher()

    async def run_extraction(
        self,
        job_id: str,
        platform_urls: Dict[str, str] = None,
        resume_bytes: bytes = None,
        resume_filename: str = None,
        candidate_name: str = None,
        # Legacy params — converted to platform_urls internally
        github_url: str = None,
        leetcode_url: str = None,
        linkedin_url: str = None,
    ):
        db: Session = SessionLocal()
        errors = []

        # Merge legacy params into platform_urls
        if platform_urls is None:
            platform_urls = {}
        if github_url and "github" not in platform_urls:
            platform_urls["github"] = github_url
        if leetcode_url and "leetcode" not in platform_urls:
            platform_urls["leetcode"] = leetcode_url
        if linkedin_url and "linkedin" not in platform_urls:
            platform_urls["linkedin"] = linkedin_url

        try:
            logger.info(f"Extraction started for job_id={job_id} — platforms={list(platform_urls.keys())}, resume={'yes' if resume_bytes else 'no'}")
            self._update_job_status(db, job_id, "extracting")

            # ---------------------------
            # RESUME EXTRACTION
            # ---------------------------
            if resume_bytes:
                try:
                    resume_data = self.resume_parser.parse_resume_bytes(resume_bytes, resume_filename)
                    self._store_raw(db, job_id, "resume", resume_data)
                except Exception as e:
                    logger.error(f"Resume extraction failed for job_id={job_id}: {e}", exc_info=True)
                    errors.append(f"resume: {str(e)}")
                    self._store_raw(db, job_id, "resume", {"error": str(e)})

            # ---------------------------
            # GITHUB EXTRACTION (dedicated)
            # ---------------------------
            github_url_val = platform_urls.pop("github", None)
            if github_url_val:
                try:
                    username = self._extract_github_username(github_url_val)
                    if username:
                        github_data = await self.github_fetcher.fetch_user_data(username)
                        self._store_raw(db, job_id, "github", github_data)
                    else:
                        errors.append("github: could not extract username from URL")
                        self._store_raw(db, job_id, "github", {"error": "invalid URL", "profile": {}, "repository_intelligence": {"total_repositories": 0, "top_repositories": [], "all_repositories": []}})
                except Exception as e:
                    logger.error(f"GitHub extraction failed for job_id={job_id}: {e}", exc_info=True)
                    errors.append(f"github: {str(e)}")
                    self._store_raw(db, job_id, "github", {"error": str(e), "profile": {}, "repository_intelligence": {"total_repositories": 0, "top_repositories": [], "all_repositories": []}})

            # ---------------------------
            # LEETCODE EXTRACTION (dedicated)
            # ---------------------------
            leetcode_url_val = platform_urls.pop("leetcode", None)
            if leetcode_url_val:
                try:
                    username = self._extract_leetcode_username(leetcode_url_val)
                    if username:
                        leetcode_data = await self.leetcode_fetcher.fetch_user_data(username)
                        self._store_raw(db, job_id, "leetcode", leetcode_data)
                    else:
                        errors.append("leetcode: could not extract username from URL")
                        self._store_raw(db, job_id, "leetcode", {"error": "invalid URL", "problem_solving_stats": {"total_solved": 0}})
                except Exception as e:
                    logger.error(f"LeetCode extraction failed for job_id={job_id}: {e}", exc_info=True)
                    errors.append(f"leetcode: {str(e)}")
                    self._store_raw(db, job_id, "leetcode", {"error": str(e), "problem_solving_stats": {"total_solved": 0}})

            # ---------------------------
            # ALL OTHER PLATFORMS (web search)
            # ---------------------------
            for platform_id, url in platform_urls.items():
                if not url:
                    continue
                try:
                    logger.info(f"Web search extraction for {platform_id}: {url} job_id={job_id}")
                    data = await self.web_search_fetcher.fetch_profile(url, platform_id)
                    self._store_raw(db, job_id, platform_id, data)
                except Exception as e:
                    logger.error(f"{platform_id} extraction failed for job_id={job_id}: {e}", exc_info=True)
                    errors.append(f"{platform_id}: {str(e)}")
                    self._store_raw(db, job_id, platform_id, {"error": str(e), "url": url})

            # ---------------------------
            # DONE — mark as extracted even if some platforms had errors
            # ---------------------------
            total_sources = sum([bool(resume_bytes)]) + len(platform_urls) + (1 if github_url_val else 0) + (1 if leetcode_url_val else 0)
            successful_extractions = total_sources - len(errors)

            if successful_extractions == 0 and total_sources > 0:
                logger.warning(f"All extractions failed for job_id={job_id} — errors: {errors}")
                self._update_job_status(db, job_id, "failed", "All requested data sources failed to extract")
            else:
                error_msg = "; ".join(errors) if errors else None
                logger.info(f"Extraction completed for job_id={job_id} — {successful_extractions}/{total_sources} sources succeeded" + (f", partial errors: {errors}" if errors else ""))
                self._update_job_status(db, job_id, "extracted", error_msg)
        except Exception as e:
            logger.error(f"Extraction completely failed for job_id={job_id}: {e}", exc_info=True)
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
