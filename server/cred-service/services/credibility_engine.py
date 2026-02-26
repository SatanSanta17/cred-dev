from typing import Dict, Any, List


class CredibilityEngine:
    """
    Credibility Engine v1

    Validates resume claims against GitHub + LeetCode signals.
    Produces structured credibility intelligence.
    """

    def __init__(self):
        pass

    # =============================
    # PUBLIC ENTRY
    # =============================

    def evaluate(
        self,
        resume_claims: Dict[str, Any],
        github_raw: Dict[str, Any],
        leetcode_raw: Dict[str, Any]
    ) -> Dict[str, Any]:

        validated_claims = []
        unverified_claims = []
        contradicted_claims = []
        external_strengths = []

        # -------------------------
        # DEVELOPMENT CLAIM VALIDATION
        # -------------------------
        dev_claims = resume_claims.get("development_claims", [])

        for claim in dev_claims:
            result = self._validate_development_claim(claim, github_raw)

            if result["status"] == "validated":
                validated_claims.append(result)

            elif result["status"] == "contradicted":
                contradicted_claims.append(result)

            else:
                unverified_claims.append(result)

        # -------------------------
        # PROBLEM SOLVING VALIDATION
        # -------------------------
        problem_claims = resume_claims.get("problem_solving_claims", [])

        for claim in problem_claims:
            result = self._validate_problem_claim(claim, leetcode_raw)

            if result["status"] == "validated":
                validated_claims.append(result)

            elif result["status"] == "contradicted":
                contradicted_claims.append(result)

            else:
                unverified_claims.append(result)

        # -------------------------
        # PRODUCTION CLAIM VALIDATION
        # -------------------------
        production_claims = resume_claims.get("production_claims", [])

        for claim in production_claims:
            result = self._validate_production_claim(claim, github_raw)

            if result["status"] == "validated":
                validated_claims.append(result)
            else:
                unverified_claims.append(result)

        # -------------------------
        # DETECT EXTERNAL STRENGTHS
        # -------------------------
        external_strengths.extend(
            self._detect_github_strengths(github_raw)
        )

        external_strengths.extend(
            self._detect_leetcode_strengths(leetcode_raw)
        )

        # -------------------------
        # BUILD SUMMARY
        # -------------------------
        credibility_score = self._compute_credibility_score(
            validated_claims,
            unverified_claims,
            contradicted_claims
        )

        risk_flags = []

        if len(contradicted_claims) > 0:
            risk_flags.append("contradicted_resume_claims")

        if credibility_score < 3:
            risk_flags.append("low_claim_alignment")

        return {
            "validated_claims": validated_claims,
            "unverified_claims": unverified_claims,
            "contradicted_claims": contradicted_claims,
            "external_strengths_not_claimed": external_strengths,
            "credibility_score": credibility_score,
            "risk_flags": risk_flags
        }

    # =============================
    # VALIDATORS
    # =============================

    def _validate_development_claim(self, claim: Dict, github_raw: Dict) -> Dict:

        repos = github_raw.get("repositories", [])
        languages = set()

        for repo in repos:
            repo_langs = repo.get("codebase_signals", {}).get("languages", {})
            languages.update(repo_langs.keys())

        skill = claim.get("skill")

        if skill and skill.lower() in [l.lower() for l in languages]:
            return {
                "claim": claim,
                "status": "validated",
                "supporting_signal": "language_presence"
            }

        if skill and len(repos) == 0:
            return {
                "claim": claim,
                "status": "contradicted",
                "reason": "no development repos found"
            }

        return {
            "claim": claim,
            "status": "unverified"
        }

    # -----------------------------

    def _validate_problem_claim(self, claim: Dict, leetcode_raw: Dict) -> Dict:

        stats = leetcode_raw.get("data", {}).get("matched_user", {}).get("submitStats", {})
        ac_stats = stats.get("acSubmissionNum", [])

        total_solved = 0
        for row in ac_stats:
            if row.get("difficulty") == "All":
                total_solved = row.get("count", 0)

        if total_solved > 150:
            return {
                "claim": claim,
                "status": "validated",
                "supporting_signal": f"{total_solved}_problems_solved"
            }

        if total_solved < 20:
            return {
                "claim": claim,
                "status": "contradicted",
                "reason": "very_low_problem_solving_activity"
            }

        return {
            "claim": claim,
            "status": "unverified"
        }

    # -----------------------------

    def _validate_production_claim(self, claim: Dict, github_raw: Dict) -> Dict:

        repos = github_raw.get("repositories", [])

        for repo in repos:
            config_files = repo.get("codebase_signals", {}).get("config_files", [])
            if "dockerfile" in [c.lower() for c in config_files]:
                return {
                    "claim": claim,
                    "status": "validated",
                    "supporting_signal": "deployment_config_detected"
                }

        return {
            "claim": claim,
            "status": "unverified"
        }

    # =============================
    # EXTERNAL STRENGTH DETECTION
    # =============================

    def _detect_github_strengths(self, github_raw: Dict) -> List[Dict]:

        strengths = []
        repos = github_raw.get("repositories", [])

        if len(repos) > 25:
            strengths.append({
                "signal": "high_repository_volume",
                "source": "github"
            })

        for repo in repos:
            commits = repo.get("codebase_signals", {}).get("recent_commit_count", 0)
            if commits > 20:
                strengths.append({
                    "signal": "active_development_repo",
                    "source": "github"
                })
                break

        return strengths

    # -----------------------------

    def _detect_leetcode_strengths(self, leetcode_raw: Dict) -> List[Dict]:

        strengths = []

        stats = leetcode_raw.get("data", {}).get("matched_user", {}).get("submitStats", {})
        ac_stats = stats.get("acSubmissionNum", [])

        for row in ac_stats:
            if row.get("difficulty") == "Hard" and row.get("count", 0) > 50:
                strengths.append({
                    "signal": "strong_algorithmic_depth",
                    "source": "leetcode"
                })

        return strengths

    # =============================
    # SCORING
    # =============================

    def _compute_credibility_score(
        self,
        validated: List,
        unverified: List,
        contradicted: List
    ) -> float:

        score = len(validated) * 2
        score -= len(contradicted) * 1.5

        if score < 0:
            score = 0

        return round(score, 2)