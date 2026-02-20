"""Report generation service using Skill Intelligence Engine Model."""

from typing import Dict, Any, List
from models.reports import (
    SkillDomain, IntelligenceCore, DerivedView, ReportLayer,
    BenchmarkPosition, DomainAnalysis
)

class ReportGenerator:
    """Generates intelligence core and derived views using Skill Intelligence Engine Model."""

    def __init__(self):
        # TODO: Initialize LLM client for natural language generation
        pass

    def generate_intelligence_core(self, name: str, domain_analyses: Dict[SkillDomain, dict],
                                 verified_claims: List[dict], plausible_claims: List[dict],
                                 claimed_claims: List[dict]) -> IntelligenceCore:
        """
        Generate the Intelligence Core - the single source of truth analysis.

        Args:
            name: Candidate name
            domain_analyses: Results from domain analysis
            verified_claims: List of verified claims
            plausible_claims: List of plausible claims
            claimed_claims: List of unverified claims

        Returns:
            IntelligenceCore: Complete intelligence analysis
        """
        # Calculate overall score with domain weighting
        overall_score = self._calculate_overall_score(domain_analyses)

        # Generate capability identity line
        capability_identity = self._generate_capability_identity(name, domain_analyses, overall_score)

        # Generate cross-domain pattern
        cross_domain_pattern = self._analyze_cross_domain_patterns(domain_analyses)

        # Convert domain analyses to proper format
        formatted_domain_analyses = {}
        all_green_signals = []
        all_yellow_signals = []
        all_red_signals = []

        for domain, analysis in domain_analyses.items():
            formatted_domain_analyses[domain] = DomainAnalysis(
                domain=domain,
                classification=analysis['classification'],
                maturity_statement=analysis['maturity_statement'],
                score=analysis['score'],
                benchmark_position=analysis['benchmark_position'],
                signals=analysis['signals'],
                green_signals=analysis['green_signals'],
                yellow_signals=analysis['yellow_signals'],
                red_signals=analysis['red_signals']
            )

            all_green_signals.extend(analysis['green_signals'])
            all_yellow_signals.extend(analysis['yellow_signals'])
            all_red_signals.extend(analysis['red_signals'])

        return IntelligenceCore(
            capability_identity=capability_identity,
            overall_score=overall_score,
            domain_analyses=formatted_domain_analyses,
            cross_domain_pattern=cross_domain_pattern,
            verified_claims=verified_claims,
            plausible_claims=plausible_claims,
            claimed_only=claimed_claims,
            green_signals=all_green_signals,
            yellow_signals=all_yellow_signals,
            red_signals=all_red_signals
        )

    def generate_derived_views(self, intelligence_core: IntelligenceCore) -> Dict[str, DerivedView]:
        """
        Generate derived views from the intelligence core.

        Returns:
            Dict with 'developer_insight' and 'recruiter_insight' views
        """
        return {
            'developer_insight': self._generate_developer_insight_view(intelligence_core),
            'recruiter_insight': self._generate_recruiter_insight_view(intelligence_core)
        }

    def _calculate_overall_score(self, domain_analyses: Dict[SkillDomain, dict]) -> float:
        """Calculate overall score using domain weighting."""
        # Weighting based on guidelines: Engineering 35%, Problem Solving 25%, Credibility 20%, Execution 20%
        weights = {
            SkillDomain.ENGINEERING_DEVELOPMENT: 0.35,
            SkillDomain.PROBLEM_SOLVING: 0.25,
            SkillDomain.PROFESSIONAL_CREDIBILITY: 0.20,
            SkillDomain.EXECUTION_CONSISTENCY: 0.20
        }

        weighted_score = 0.0
        for domain, analysis in domain_analyses.items():
            weighted_score += analysis['score'] * weights[domain]

        return round(weighted_score, 1)

    def _generate_capability_identity(self, name: str, domain_analyses: Dict[SkillDomain, dict],
                                    overall_score: float) -> str:
        """Generate the capability identity line."""
        # Determine primary role based on strongest domain
        engineering_score = domain_analyses[SkillDomain.ENGINEERING_DEVELOPMENT]['score']
        problem_solving_score = domain_analyses[SkillDomain.PROBLEM_SOLVING]['score']

        if engineering_score >= problem_solving_score:
            primary_role = "backend-focused engineer" if engineering_score > 6 else "developing engineer"
        else:
            primary_role = "algorithm-focused developer" if problem_solving_score > 6 else "problem-solving oriented developer"

        # Determine maturity level
        if overall_score >= 8:
            maturity = "senior-level"
        elif overall_score >= 6:
            maturity = "mid-level"
        else:
            maturity = "junior-to-mid level"

        # Determine strength bias
        credibility_score = domain_analyses[SkillDomain.PROFESSIONAL_CREDIBILITY]['score']
        execution_score = domain_analyses[SkillDomain.EXECUTION_CONSISTENCY]['score']

        if credibility_score < 5:
            risk_note = "with credibility verification needs"
        elif execution_score < 5:
            risk_note = "showing execution consistency concerns"
        else:
            risk_note = ""

        identity = f"{maturity} {primary_role}"
        if risk_note:
            identity += f" {risk_note}"

        return identity.capitalize()

    def _analyze_cross_domain_patterns(self, domain_analyses: Dict[SkillDomain, dict]) -> str:
        """Analyze patterns across all domains."""
        patterns = []

        eng_score = domain_analyses[SkillDomain.ENGINEERING_DEVELOPMENT]['score']
        ps_score = domain_analyses[SkillDomain.PROBLEM_SOLVING]['score']
        cred_score = domain_analyses[SkillDomain.PROFESSIONAL_CREDIBILITY]['score']
        exec_score = domain_analyses[SkillDomain.EXECUTION_CONSISTENCY]['score']

        # Strong engineering but weak problem solving
        if eng_score >= 7 and ps_score < 5:
            patterns.append("strong production engineering capabilities with limited algorithmic depth")

        # Strong problem solving but weak engineering
        elif ps_score >= 7 and eng_score < 5:
            patterns.append("excellent algorithmic skills with limited production engineering experience")

        # High credibility and execution
        elif cred_score >= 7 and exec_score >= 7:
            patterns.append("high credibility alignment with consistent execution discipline")

        # Low credibility signals
        elif cred_score < 5:
            patterns.append("credibility gaps requiring additional verification")

        # Inconsistent execution
        elif exec_score < 5:
            patterns.append("irregular execution patterns suggesting inconsistent engagement")

        # Balanced profile
        elif abs(eng_score - ps_score) < 2 and cred_score >= 6:
            patterns.append("balanced technical profile with good credibility alignment")

        if not patterns:
            patterns.append("emerging technical profile requiring further development")

        return "Profile shows " + "; ".join(patterns) + "."

    def _generate_developer_insight_view(self, intelligence_core: IntelligenceCore) -> DerivedView:
        """Generate developer-focused growth insights."""
        key_insights = []

        # Growth direction based on weakest domains
        weakest_domain = min(intelligence_core.domain_analyses.items(),
                           key=lambda x: x[1].score)

        if weakest_domain[0] == SkillDomain.ENGINEERING_DEVELOPMENT:
            key_insights.append("Focus on building production-scale projects with modern architecture patterns")
        elif weakest_domain[0] == SkillDomain.PROBLEM_SOLVING:
            key_insights.append("Strengthen algorithmic thinking through consistent LeetCode practice")
        elif weakest_domain[0] == SkillDomain.EXECUTION_CONSISTENCY:
            key_insights.append("Build consistent coding habits with daily/weekly project work")

        # 30-60 day improvement focus
        if intelligence_core.overall_score < 6:
            key_insights.append("Next 30 days: Focus on portfolio building and skill verification")
        elif intelligence_core.overall_score < 8:
            key_insights.append("Next 60 days: Deepen expertise in strongest domain while addressing gaps")

        # Role positioning
        key_insights.append(f"Position as: {intelligence_core.capability_identity}")

        content = f"""## Developer Growth Insights

**Current Position:** {intelligence_core.capability_identity}

**Key Focus Areas:**
{chr(10).join(f"• {insight}" for insight in key_insights)}

**Strength Reinforcement:**
{chr(10).join(f"• {signal}" for signal in intelligence_core.green_signals[:3])}

**Growth Opportunities:**
{chr(10).join(f"• {signal}" for signal in intelligence_core.yellow_signals[:2])}
"""

        return DerivedView(
            view_type=ReportLayer.DEVELOPER_INSIGHT,
            content=content,
            key_insights=key_insights
        )

    def _generate_recruiter_insight_view(self, intelligence_core: IntelligenceCore) -> DerivedView:
        """Generate recruiter-focused hiring insights."""
        key_insights = []

        # Screening clarity
        if intelligence_core.overall_score >= 8:
            key_insights.append("High-confidence hire with verified technical capabilities")
        elif intelligence_core.overall_score >= 6:
            key_insights.append("Solid candidate requiring standard technical interview")
        else:
            key_insights.append("Needs additional verification and skills assessment")

        # Interview depth indicator
        if intelligence_core.domain_analyses[SkillDomain.PROBLEM_SOLVING].score >= 7:
            key_insights.append("Can handle advanced technical interviews")
        elif intelligence_core.domain_analyses[SkillDomain.PROBLEM_SOLVING].score >= 5:
            key_insights.append("Ready for standard coding interviews")
        else:
            key_insights.append("May need simplified technical screening")

        # Risk awareness
        if intelligence_core.red_signals:
            key_insights.append(f"Risk factors: {len(intelligence_core.red_signals)} red signals identified")
        elif intelligence_core.yellow_signals:
            key_insights.append(f"Caution areas: {len(intelligence_core.yellow_signals)} yellow signals to verify")

        content = f"""## Recruiter Hiring Insights

**Capability Identity:** {intelligence_core.capability_identity}

**Hiring Confidence:** {intelligence_core.overall_score}/10

**Key Assessment Points:**
{chr(10).join(f"• {insight}" for insight in key_insights)}

**Verified Signals:**
{chr(10).join(f"✅ {signal}" for signal in intelligence_core.green_signals[:3])}

**Areas Requiring Verification:**
{chr(10).join(f"⚠️ {signal}" for signal in intelligence_core.yellow_signals[:2])}

**Overall Pattern:** {intelligence_core.cross_domain_pattern}
"""

        return DerivedView(
            view_type=ReportLayer.RECRUITER_INSIGHT,
            content=content,
            key_insights=key_insights
        )

    def generate_credibility_card(self, intelligence_core: IntelligenceCore) -> Dict[str, Any]:
        """Generate credibility card for social visibility."""
        return {
            "identity": intelligence_core.capability_identity,
            "score": intelligence_core.overall_score,
            "verified_signals": len(intelligence_core.verified_claims),
            "total_signals": len(intelligence_core.verified_claims) +
                           len(intelligence_core.plausible_claims) +
                           len(intelligence_core.claimed_only),
            "top_strengths": intelligence_core.green_signals[:3],
            "generated_at": "2026-01-01"  # Would be dynamic
        }