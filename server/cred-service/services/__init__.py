# Import services here
from datetime import datetime
import json
from .resume_parser import ResumeParser
from .github_fetcher import GitHubFetcher
from .leetcode_fetcher import LeetCodeFetcher
from .verifier import Verifier
from .report_generator import ReportGenerator
from models.reports import IntelligenceCore, ReportLayer
from app.database import SessionLocal, AnalysisJob, RawData, Report


class AnalysisService:
    """Skill Intelligence Engine - Main orchestrator for complete analysis pipeline."""

    def __init__(self):
        self.resume_parser = ResumeParser()
        self.github_fetcher = GitHubFetcher()
        self.leetcode_fetcher = LeetCodeFetcher()
        self.verifier = Verifier()
        self.report_generator = ReportGenerator()

    async def run_intelligence_engine(self, job_id: str, resume_file, github_url: str,
                                      leetcode_url: str, candidate_name: str) -> dict:
        """
        Run the complete Skill Intelligence Engine pipeline.

        Follows the 9-stage workflow from REPORT_CHECKLIST.md:
        1. Input collection
        2. Raw signal extraction
        3. Domain mapping
        4. Cross-domain correlation
        5. Benchmark positioning
        6. Score generation
        7. Risk & signal flags
        8. Intelligence core completion
        9. Derived output generation

        Returns:
            dict: Complete analysis results including intelligence core and derived views
        """
        try:
            # Stage 1: Input collection (already done via API)

            # Stage 2: Raw signal extraction
            resume_data = await self._extract_resume_signals(resume_file)
            github_data = await self._extract_github_signals(github_url)
            leetcode_data = await self._extract_leetcode_signals(leetcode_url)

            # Store raw data for job
            await self._store_raw_data(job_id, {
                'resume': resume_data,
                'github': github_data,
                'leetcode': leetcode_data
            })

            # Stage 3: Domain mapping
            domain_analyses = self.verifier.analyze_domains(resume_data, github_data, leetcode_data)

            # Stage 4: Claim verification
            claims_analysis = self.verifier.verify_claims(resume_data, github_data, leetcode_data)

            # Stage 5-8: Intelligence Core generation
            intelligence_core = self.report_generator.generate_intelligence_core(
                candidate_name, domain_analyses,
                claims_analysis['verified'],
                claims_analysis['plausible'],
                claims_analysis['claimed']
            )

            # Stage 9: Derived views generation
            derived_views = self.report_generator.generate_derived_views(intelligence_core)

            # Generate credibility card
            credibility_card = self.report_generator.generate_credibility_card(intelligence_core)

            # Store complete results
            await self._store_analysis_results(job_id, intelligence_core, derived_views, credibility_card)

            return {
                'job_id': job_id,
                'intelligence_core': intelligence_core,
                'derived_views': derived_views,
                'credibility_card': credibility_card,
                'status': 'completed'
            }

        except Exception as e:
            # Store error status
            await self._store_error_status(job_id, str(e))
            return {
                'job_id': job_id,
                'error': str(e),
                'status': 'failed'
            }

    async def _extract_resume_signals(self, resume_file) -> dict:
        """Stage 1A: Extract resume signals."""
        if resume_file:
            return await self.resume_parser.parse_resume(resume_file)
        return {}

    async def _extract_github_signals(self, github_url: str) -> dict:
        """Stage 1B: Extract GitHub signals."""
        if github_url:
            username = self._extract_github_username(github_url)
            if username:
                return await self.github_fetcher.fetch_user_data(username)
        return {}

    async def _extract_leetcode_signals(self, leetcode_url: str) -> dict:
        """Stage 1C: Extract LeetCode signals."""
        if leetcode_url:
            username = self._extract_leetcode_username(leetcode_url)
            if username:
                return await self.leetcode_fetcher.fetch_user_data(username)
        return {}

    async def _store_raw_data(self, job_id: str, raw_data: dict):
        """Store raw extracted signals."""
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            records = []
            for data_type in ("resume", "github", "leetcode"):
                data = raw_data.get(data_type)
                if data:
                    records.append(
                        RawData(
                            job_id=job_id,
                            data_type=data_type,
                            data=data,
                            fetched_at=now,
                        )
                    )

            if not records:
                return

            db.add_all(records)
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    async def _store_analysis_results(self, job_id: str, intelligence_core: IntelligenceCore,
                                      derived_views: dict, credibility_card: dict):
        """Store complete analysis results."""
        db = SessionLocal()
        try:
            now = datetime.utcnow()

            db.query(Report).filter(Report.job_id == job_id).delete()

            db.add(Report(
                job_id=job_id,
                layer=ReportLayer.INTELLIGENCE_CORE.value,
                content=intelligence_core.model_dump_json(),
                created_at=now,
            ))
            db.add(Report(
                job_id=job_id,
                layer=ReportLayer.DEVELOPER_INSIGHT.value,
                content=derived_views['developer_insight'].model_dump_json(),
                created_at=now,
            ))
            db.add(Report(
                job_id=job_id,
                layer=ReportLayer.RECRUITER_INSIGHT.value,
                content=derived_views['recruiter_insight'].model_dump_json(),
                created_at=now,
            ))
            db.add(Report(
                job_id=job_id,
                layer=ReportLayer.CREDIBILITY_CARD.value,
                content=json.dumps(credibility_card),
                created_at=now,
            ))

            job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
            if job:
                job.status = "completed"
                job.updated_at = now
                job.error_message = None

            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    async def _store_error_status(self, job_id: str, error: str):
        """Store error status for failed analysis."""
        db = SessionLocal()
        try:
            job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
            if job:
                job.status = "failed"
                job.error_message = error
                job.updated_at = datetime.utcnow()
                db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def _extract_github_username(self, url: str) -> str:
        """Extract GitHub username from URL."""
        # Simple extraction - would use proper parsing in production
        if 'github.com/' in url:
            parts = url.split('github.com/')[1].split('/')[0]
            return parts
        return ""

    def _extract_leetcode_username(self, url: str) -> str:
        """Extract LeetCode username from URL."""
        # Simple extraction - would use proper parsing in production
        if 'leetcode.com/' in url:
            parts = url.split('leetcode.com/')[1].split('/')[0]
            return parts
        return ""
