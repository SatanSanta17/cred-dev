"""Models for report generation and storage."""

from pydantic import BaseModel
from typing import List, Dict, Any
from enum import Enum

class ReportLayer(str, Enum):
    """Report layers as defined in guidelines."""
    INTELLIGENCE_CORE = "intelligence_core"
    DEVELOPER_INSIGHT = "developer_insight"
    RECRUITER_INSIGHT = "recruiter_insight"
    CREDIBILITY_CARD = "credibility_card"

class VerificationStatus(str, Enum):
    """Verification status for claims."""
    VERIFIED = "verified"
    PLAUSIBLE = "plausible"
    CLAIMED = "claimed"

class SkillDomain(str, Enum):
    """Four skill domains for analysis."""
    ENGINEERING_DEVELOPMENT = "engineering_development"
    PROBLEM_SOLVING = "problem_solving"
    PROFESSIONAL_CREDIBILITY = "professional_credibility"
    EXECUTION_CONSISTENCY = "execution_consistency"

class DomainClassification(str, Enum):
    """Classification levels for each domain."""
    # Engineering
    FOUNDATIONAL = "foundational"
    PRODUCTION_CAPABLE = "production_capable"
    ARCHITECTURE_AWARE = "architecture_aware"
    ADVANCED_SYSTEM_LEVEL = "advanced_system_level"

    # Problem Solving
    BEGINNER_DSA = "beginner_dsa"
    INTERVIEW_PREP_READY = "interview_prep_ready"
    STRONG_ALGORITHMIC_DEPTH = "strong_algorithmic_depth"
    CONTEST_GRADE = "contest_grade"

    # Credibility
    HIGH_ALIGNMENT = "high_alignment"
    MINOR_CLAIM_INFLATION = "minor_claim_inflation"
    EVIDENCE_GAP = "evidence_gap"
    CREDIBILITY_RISK = "credibility_risk"

    # Execution
    HIGH_CONSISTENCY = "high_consistency"
    MODERATE_ENGAGEMENT = "moderate_engagement"
    IRREGULAR_EFFORT = "irregular_effort"
    CONCERNING_INACTIVITY = "concerning_inactivity"

class BenchmarkPosition(str, Enum):
    """Benchmarking positions."""
    BELOW = "below"
    AVERAGE = "average"
    ABOVE = "above"

    # Credibility and Execution specific
    WEAK = "weak"
    STABLE = "stable"
    STRONG = "strong"
    MODERATE = "moderate"

class Claim(BaseModel):
    """A claim extracted from resume or profile."""
    text: str
    source: str  # "resume", "github", "leetcode"
    category: str  # "experience", "skill", "metric", etc.
    status: VerificationStatus
    evidence: List[str] = []
    confidence: float = 0.0

class ReportMetadata(BaseModel):
    """Metadata for generated reports."""
    candidate_name: str
    credibility_score: float
    layer: ReportLayer
    generated_at: str
    verified_claims: int
    plausible_claims: int
    claimed_only: int

class DomainAnalysis(BaseModel):
    """Analysis for a single skill domain."""
    domain: SkillDomain
    classification: DomainClassification
    maturity_statement: str
    score: float  # 0-10 scale
    benchmark_position: BenchmarkPosition
    signals: List[str]
    green_signals: List[str]
    yellow_signals: List[str]
    red_signals: List[str]

class IntelligenceCore(BaseModel):
    """The primary intelligence core analysis."""
    capability_identity: str  # One-sentence identity line
    overall_score: float  # 0-10 scale
    domain_analyses: Dict[SkillDomain, DomainAnalysis]
    cross_domain_pattern: str  # Overall capability pattern
    verified_claims: List[dict]
    plausible_claims: List[dict]
    claimed_only: List[dict]
    green_signals: List[str]
    yellow_signals: List[str]
    red_signals: List[str]

class DerivedView(BaseModel):
    """Developer or Recruiter insight view."""
    view_type: ReportLayer  # developer_insight or recruiter_insight
    content: str
    key_insights: List[str]

class ReportContent(BaseModel):
    """Full report content with intelligence core and derived views."""
    metadata: ReportMetadata
    intelligence_core: IntelligenceCore
    derived_views: Dict[str, DerivedView]  # developer_insight, recruiter_insight
    credibility_card: Dict[str, Any]  # Future use
    raw_data: Dict[str, Any]  # Original data used to generate report