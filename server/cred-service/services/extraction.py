from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, RawData, AnalysisJob

from services.resume_parser import ResumeParser
from services.resume_claims_extractor import ResumeClaimsExtractor
from services.github_fetcher import GitHubFetcher
from services.leetcode_fetcher import LeetCodeFetcher
from services.linkedin_fetcher import LinkedInFetcher


class ExtractionService:
    """
    Handles raw signal acquisition only.
    No intelligence or report generation here.
    """

    def __init__(self):
        self.resume_parser = ResumeParser()
        self.claims_extractor = ResumeClaimsExtractor()
        self.github_fetcher = GitHubFetcher()
        self.leetcode_fetcher = LeetCodeFetcher()
        self.linkedin_fetcher = LinkedInFetcher()

    async def run_extraction(
        self,
        job_id: str,
        resume_file,
        github_url: str,
        leetcode_url: str,
        linkedin_url: str,
    ):
        db: Session = SessionLocal()

        try:
            self._update_job_status(db, job_id, "extracting")

            # ---------------------------
            # RESUME EXTRACTION
            # ---------------------------
            resume_payload = {}
            if resume_file:
                resume_data = await self.resume_parser.parse_resume(resume_file)
                raw_text = resume_data.get("raw_text", "")
                parsed_resume = resume_data.get("parsed_resume", {})
                claims = self.claims_extractor.extract_claims(raw_text) if raw_text else {}

                resume_payload = {
                    "raw_text": raw_text,
                    "parsed": parsed_resume,
                    "claims": claims,
                } 

                self._store_raw(db, job_id, "resume", resume_payload)

            # ---------------------------
            # GITHUB EXTRACTION
            # ---------------------------
            if github_url:
                username = self._extract_github_username(github_url)
                if username:
                    github_data = await self.github_fetcher.fetch_user_data(username)
                    self._store_raw(db, job_id, "github", github_data)

            # ---------------------------
            # LEETCODE EXTRACTION
            # ---------------------------
            if leetcode_url:
                username = self._extract_leetcode_username(leetcode_url)
                if username:
                    leetcode_data = await self.leetcode_fetcher.fetch_user_data(username)
                    self._store_raw(db, job_id, "leetcode", leetcode_data)

            # ---------------------------
            # LINKEDIN EXTRACTION (OPTIONAL)
            # ---------------------------
            if linkedin_url:
                linkedin_data = await self.linkedin_fetcher.fetch_user_data(linkedin_url)
                self._store_raw(db, job_id, "linkedin", linkedin_data)

            # ---------------------------
            # DONE
            # ---------------------------
            self._update_job_status(db, job_id, "extracted")

        except Exception as e:
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
            return url.split("github.com/")[1].split("/")[0]
        return ""

    def _extract_leetcode_username(self, url: str) -> str:
        if "leetcode.com/" in url:
            path = url.split("leetcode.com/")[1].strip("/")
            if path.startswith("u/"):
                return path.split("/")[1]
            return path.split("/")[0]
        return ""