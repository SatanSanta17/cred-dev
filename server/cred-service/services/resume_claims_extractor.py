import re
from typing import Dict, Any, List


class ResumeClaimsExtractor:
    """
    Resume Claims Extractor v2

    Purpose:
    Convert resume text into structured, validation-ready claims
    for credibility engine and domain intelligence.

    Output is NOT linguistic noise.
    Output = capability claims.
    """

    def __init__(self):

        # --- Technical skills mapped to development domains
        self.skill_domain_map = {
            "backend": ["java", "spring", "node", "django", "flask"],
            "frontend": ["react", "angular", "vue", "javascript", "typescript"],
            "infra": ["docker", "kubernetes", "terraform", "ci/cd"],
            "cloud": ["aws", "gcp", "azure"],
            "data": ["sql", "mongodb", "redis", "kafka"],
            "ai_ml": ["machine learning", "deep learning", "nlp"]
        }

        # --- Problem solving indicators
        self.problem_solving_terms = [
            "dsa", "algorithms", "competitive programming",
            "leetcode", "codeforces", "optimization",
            "problem solving", "complexity"
        ]

        # --- Responsibility verbs grouped
        self.responsibility_verbs = {
            "ownership": ["owned", "led", "headed", "managed"],
            "architecture": ["architected", "designed", "planned"],
            "implementation": ["built", "implemented", "developed", "created"],
            "optimization": ["optimized", "improved", "enhanced"],
            "scaling": ["scaled", "distributed", "high traffic"]
        }

        # --- Production signals
        self.production_terms = [
            "production", "deployment", "live system",
            "scalable", "real-time", "distributed", "microservices"
        ]

        # --- Domain indicators
        self.domain_terms = {
            "fintech": ["payment", "kyc", "loan", "nbfc", "banking"],
            "healthcare": ["ehr", "patient", "medical"],
            "ecommerce": ["cart", "checkout", "inventory"],
            "ai_ml": ["machine learning", "deep learning", "nlp"],
            "infra": ["kubernetes", "docker", "devops"]
        }

        # --- Impact detection
        self.impact_pattern = r"(improved|reduced|increased|optimized).{0,40}(\d+%)"

        # --- Weak language
        self.generic_phrases = ["worked on", "involved in", "responsible for"]


    # =========================
    # PUBLIC ENTRY
    # =========================

    def extract_claims(self, raw_text: str) -> Dict[str, Any]:

        text = raw_text.lower()

        development_claims = self._extract_development_claims(text)
        problem_claims = self._extract_problem_solving_claims(text)
        production_claims = self._extract_production_claims(text)

        return {
            "development_claims": development_claims,
            "problem_solving_claims": problem_claims,
            "production_claims": production_claims,
            "domain_experience": self._extract_domain_claims(text),
            "seniority_signals": self._extract_seniority_signals(text),
            "language_quality": self._extract_language_quality(text)
        }


    # =========================
    # DEVELOPMENT CLAIMS
    # =========================

    def _extract_development_claims(self, text: str) -> List[Dict[str, Any]]:
        claims = []

        for domain, skills in self.skill_domain_map.items():
            for skill in skills:
                if skill in text:
                    claims.append({
                        "claim_type": "development",
                        "sub_type": domain,
                        "skill": skill,
                        "strength": self._estimate_claim_strength(text, skill)
                    })

        return claims


    # =========================
    # PROBLEM SOLVING CLAIMS
    # =========================

    def _extract_problem_solving_claims(self, text: str) -> List[Dict[str, Any]]:
        claims = []

        for term in self.problem_solving_terms:
            if term in text:
                claims.append({
                    "claim_type": "problem_solving",
                    "signal": term,
                    "strength": self._estimate_claim_strength(text, term)
                })

        return claims


    # =========================
    # PRODUCTION CLAIMS
    # =========================

    def _extract_production_claims(self, text: str) -> List[Dict[str, Any]]:
        claims = []

        for term in self.production_terms:
            if term in text:
                claims.append({
                    "claim_type": "production",
                    "signal": term
                })

        return claims


    # =========================
    # DOMAIN EXPERIENCE
    # =========================

    def _extract_domain_claims(self, text: str) -> List[str]:
        detected = []
        for domain, keywords in self.domain_terms.items():
            if any(keyword in text for keyword in keywords):
                detected.append(domain)
        return detected


    # =========================
    # SENIORITY SIGNALS
    # =========================

    def _extract_seniority_signals(self, text: str) -> Dict[str, int]:
        signals = {
            "ownership": 0,
            "architecture": 0,
            "implementation": 0
        }

        for category, verbs in self.responsibility_verbs.items():
            for verb in verbs:
                count = len(re.findall(rf"\b{verb}\b", text))
                signals[category] += count

        return signals


    # =========================
    # LANGUAGE QUALITY
    # =========================

    def _extract_language_quality(self, text: str) -> Dict[str, Any]:

        generic_count = sum(text.count(p) for p in self.generic_phrases)
        impact_matches = re.findall(self.impact_pattern, text)

        specificity_score = max(len(impact_matches) - generic_count, 0)

        return {
            "specificity_score": specificity_score,
            "impact_statements": len(impact_matches),
            "generic_phrases": generic_count
        }


    # =========================
    # CLAIM STRENGTH ESTIMATION
    # =========================

    def _estimate_claim_strength(self, text: str, keyword: str) -> str:

        # Impact nearby?
        impact = re.search(rf"{keyword}.{{0,40}}(\d+%)", text)

        # Leadership verbs nearby?
        leadership = re.search(rf"(led|architected|owned).{{0,40}}{keyword}", text)

        if impact:
            return "high"

        if leadership:
            return "high"

        if keyword in text:
            return "medium"

        return "low"