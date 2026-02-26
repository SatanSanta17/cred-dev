from typing import Dict, Any


class SignalSummaryBuilder:
    """
    Converts intelligence engine output into compact LLM-ready signal summaries.
    This is the ONLY input that goes into report_generator.
    """

    def build_summary(
        self,
        intelligence_output: Dict[str, Any],
        credibility_output: Dict[str, Any]
    ) -> Dict[str, Any]:

        return {
            "capability_identity": intelligence_output.get("capability_identity"),

            "development_signals": self._development_summary(intelligence_output),
            "problem_solving_signals": self._problem_solving_summary(intelligence_output),
            "consistency_signals": self._consistency_summary(intelligence_output),
            "credibility_signals": self._credibility_summary(credibility_output),

            "cross_domain_patterns": intelligence_output.get("cross_domain_pattern", [])
        }

    # ======================================================
    # DEVELOPMENT DOMAIN
    # ======================================================

    def _development_summary(self, intelligence: Dict[str, Any]) -> Dict[str, Any]:

        domain = intelligence.get("domain_analyses", {}).get("engineering_development", {})

        return {
            "score": domain.get("score"),
            "classification": domain.get("classification"),
            "maturity": domain.get("maturity_statement"),

            "repo_scale": domain.get("signals", []),
            "production_indicators": domain.get("green_signals", []),

            "risk_flags": domain.get("red_signals", [])
        }

    # ======================================================
    # PROBLEM SOLVING DOMAIN
    # ======================================================

    def _problem_solving_summary(self, intelligence: Dict[str, Any]) -> Dict[str, Any]:

        domain = intelligence.get("domain_analyses", {}).get("problem_solving", {})

        return {
            "score": domain.get("score"),
            "classification": domain.get("classification"),
            "maturity": domain.get("maturity_statement"),

            "activity_signals": domain.get("signals", []),
            "strength_signals": domain.get("green_signals", []),
            "risk_flags": domain.get("red_signals", [])
        }

    # ======================================================
    # CONSISTENCY DOMAIN
    # ======================================================

    def _consistency_summary(self, intelligence: Dict[str, Any]) -> Dict[str, Any]:

        domain = intelligence.get("domain_analyses", {}).get("execution_consistency", {})

        return {
            "score": domain.get("score"),
            "classification": domain.get("classification"),
            "pattern": domain.get("maturity_statement"),

            "activity_volume": domain.get("signals", []),
            "consistency_strengths": domain.get("green_signals", []),
            "gaps": domain.get("red_signals", [])
        }

    # ======================================================
    # CREDIBILITY DOMAIN
    # ======================================================

    def _credibility_summary(self, credibility: Dict[str, Any]) -> Dict[str, Any]:

        return {
            "validated_claims": credibility.get("validated_claims", []),
            "contradicted_claims": credibility.get("contradicted_claims", []),
            "unverified_claims": credibility.get("unverified_claims", []),

            "credibility_score": credibility.get("credibility_score"),
            "risk_flags": credibility.get("risk_flags", [])
        }