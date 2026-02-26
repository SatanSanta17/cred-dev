from typing import Dict, Any, List


class IntelligenceEngine:
    """
    Core Intelligence Engine v1

    Converts raw signals + credibility output
    into structured domain intelligence.
    """

    def __init__(self):
        pass

    # ============================
    # PUBLIC ENTRY
    # ============================

    def generate_intelligence(
        self,
        github_raw: Dict[str, Any],
        leetcode_raw: Dict[str, Any],
        resume_claims: Dict[str, Any],
        credibility_output: Dict[str, Any]
    ) -> Dict[str, Any]:

        development = self._evaluate_development(
            github_raw,
            credibility_output
        )

        problem_solving = self._evaluate_problem_solving(
            leetcode_raw,
            credibility_output
        )

        consistency = self._evaluate_consistency(
            github_raw,
            leetcode_raw
        )

        professional_credibility = self._evaluate_professional_credibility(
            credibility_output
        )

        overall_score = self._compute_overall_score(
            development,
            problem_solving,
            consistency,
            professional_credibility
        )
        return {
            "capability_identity": self._build_capability_identity(resume_claims),
            "domain_analyses": {
                "engineering_development": development,
                "problem_solving": problem_solving,
                "execution_consistency": consistency,
                "professional_credibility": professional_credibility,
            },
            "overall_score": overall_score,
            "cross_domain_pattern": self._detect_cross_pattern(development, problem_solving, consistency, professional_credibility)
        }
    # ==========================================================
    # DOMAIN 1 — DEVELOPMENT STRENGTH
    # ==========================================================

    def _evaluate_development(self, github_raw, credibility_output):

        repos = github_raw.get("repositories", [])
        validated = credibility_output.get("validated_claims", [])

        repo_volume = len(repos)

        production_indicators = 0
        for repo in repos:
            config_files = repo.get("codebase_signals", {}).get("config_files", [])
            if config_files:
                production_indicators += 1

        validated_dev_claims = [
            c for c in validated
            if c.get("claim", {}).get("claim_type") == "development"
        ]

        score = min(
            repo_volume * 0.1 +
            production_indicators * 0.5 +
            len(validated_dev_claims) * 1.5,
            10
        )

        return {
            "score": round(score, 2),
            "repo_volume": repo_volume,
            "production_indicators": production_indicators,
            "validated_dev_claims": len(validated_dev_claims)
        }

    # ==========================================================
    # DOMAIN 2 — PROBLEM SOLVING
    # ==========================================================

    def _evaluate_problem_solving(self, leetcode_raw, credibility_output):

        matched_user = leetcode_raw.get("data", {}).get("matched_user", {})
        submit_stats = matched_user.get("submitStats", {})

        ac_stats = submit_stats.get("acSubmissionNum", [])
        total_solved = 0
        hard_solved = 0

        for row in ac_stats:
            if row.get("difficulty") == "All":
                total_solved = row.get("count", 0)
            if row.get("difficulty") == "Hard":
                hard_solved = row.get("count", 0)

        validated_problem_claims = [
            c for c in credibility_output.get("validated_claims", [])
            if c.get("claim", {}).get("claim_type") == "problem_solving"
        ]

        score = min(
            total_solved * 0.01 +
            hard_solved * 0.05 +
            len(validated_problem_claims) * 2,
            10
        )

        return {
            "score": round(score, 2),
            "total_solved": total_solved,
            "hard_solved": hard_solved,
            "validated_problem_claims": len(validated_problem_claims)
        }

    # ==========================================================
    # DOMAIN 3 — CONSISTENCY
    # ==========================================================

    def _evaluate_consistency(self, github_raw, leetcode_raw):

        repos = github_raw.get("repositories", [])

        active_repos = 0
        for repo in repos:
            commits = repo.get("codebase_signals", {}).get("recent_commit_count", 0)
            if commits > 5:
                active_repos += 1

        recent_activity = leetcode_raw.get(
            "data", {}
        ).get(
            "recent_activity_metrics", {}
        )

        submissions_last_30 = recent_activity.get("submissions_last_30_days", 0)

        score = min(
            active_repos * 0.5 +
            submissions_last_30 * 0.1,
            10
        )

        return {
            "score": round(score, 2),
            "active_repos": active_repos,
            "recent_leetcode_activity": submissions_last_30
        }

    # ==========================================================
    # DOMAIN 4 — PROFESSIONAL CREDIBILITY
    # ==========================================================

    def _evaluate_professional_credibility(self, credibility_output):

        validated = len(credibility_output.get("validated_claims", []))
        contradicted = len(credibility_output.get("contradicted_claims", []))

        score = validated * 1.5 - contradicted * 2

        if score < 0:
            score = 0

        if score > 10:
            score = 10

        return {
            "score": round(score, 2),
            "validated_claims": validated,
            "contradicted_claims": contradicted
        }

    # ==========================================================
    # OVERALL SCORE
    # ==========================================================

    def _compute_overall_score(self, d, p, c, pc):

        weighted = (
            d["score"] * 0.35 +
            p["score"] * 0.30 +
            c["score"] * 0.20 +
            pc["score"] * 0.15
        )

        return round(min(weighted, 10), 2)

    # ==========================================================
    # CAPABILITY IDENTITY
    # ==========================================================
    def _build_capability_identity(self, dev, prob, cons):
        if dev["score"] > 7 and prob["score"] < 4:
            return "Production-oriented engineer with limited algorithmic depth"

        if prob["score"] > 7 and dev["score"] < 5:
            return "Algorithmically strong but limited production exposure"

        return "Balanced early-to-mid level engineer"

    # ==========================================================
    # CROSS-DOMAIN PATTERN
    # ==========================================================
    def _detect_cross_pattern(self, dev, prob, cons, pc):

        patterns = []

        if dev["score"] > prob["score"]:
            patterns.append("engineering_heavier_than_algorithmic")

        if cons["score"] < 3:
            patterns.append("inconsistent_execution_pattern")

        if pc["score"] < 4:
            patterns.append("credibility_risk_present")

        return patterns