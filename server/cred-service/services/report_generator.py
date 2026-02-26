from typing import Dict, Any
from openai import OpenAI
import json
import os

class ReportGenerator:
    """
    Converts intelligence signals into human-readable reports using LLM.
    """

    def __init__(self, model="gpt-4-turbo-preview"):
        self.model = model
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    # =========================================
    # PUBLIC ENTRY
    # =========================================

    def generate_reports(
        self,
        intelligence_output: Dict[str, Any],
        credibility_output: Dict[str, Any]
    ) -> Dict[str, Any]:

        extensive = self._generate_extensive_report(
            intelligence_output,
            credibility_output
        )

        developer = self._generate_developer_insight(
            intelligence_output,
            credibility_output
        )

        recruiter = self._generate_recruiter_insight(
            intelligence_output,
            credibility_output
        )

        return {
            "extensive_report": extensive,
            "developer_insight": developer,
            "recruiter_insight": recruiter
        }

    # =========================================
    # EXTENSIVE REPORT
    # =========================================

    def _generate_extensive_report(self, intelligence, credibility):

        prompt = f"""
You are a technical hiring intelligence engine.

Analyze the following developer capability signals and produce a DEEP technical intelligence report.

STRICT RULES:
- Only infer from provided signals
- No generic statements
- No motivational tone
- Be analytical, factual, sharp
- Call out strengths, risks, inconsistencies
- Highlight engineering maturity level
- Highlight production exposure
- Highlight algorithmic depth
- Highlight execution patterns
- Highlight credibility gaps

INPUT SIGNALS:
{json.dumps(intelligence, indent=2)}

CREDIBILITY ANALYSIS:
{json.dumps(credibility, indent=2)}

OUTPUT STRUCTURE:

1. Capability Identity
2. Engineering Depth Analysis
3. Problem Solving Depth
4. Execution & Consistency Pattern
5. Production Readiness Signals
6. Credibility Observations
7. Risk Flags
8. Final Technical Positioning
"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.choices[0].message.content

    # =========================================
    # DEVELOPER INSIGHT
    # =========================================

    def _generate_developer_insight(self, intelligence, credibility):

        prompt = f"""
You are a senior engineering mentor.

Given developer capability signals, produce a HIGHLY PRACTICAL growth direction.

STRICT:
- No praise
- No fluff
- Actionable only
- Identify leverage points
- What to double down
- What to fix immediately
- Positioning advice for job market

INPUT:
{json.dumps(intelligence, indent=2)}
{json.dumps(credibility, indent=2)}

OUTPUT:
1. Current Positioning
2. Strength Leverage
3. Skill Gaps
4. 30-Day Direction
5. 90-Day Direction
"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.choices[0].message.content

    # =========================================
    # RECRUITER INSIGHT
    # =========================================

    def _generate_recruiter_insight(self, intelligence, credibility):

        prompt = f"""
You are a hiring intelligence assistant helping recruiters.

Based ONLY on signals, produce hiring decision support.

STRICT:
- Hiring confidence
- Verification requirements
- Interview depth suggestion
- Risk signals
- Where candidate fits
- NOT a resume summary

INPUT SIGNALS:
{json.dumps(intelligence, indent=2)}
{json.dumps(credibility, indent=2)}

OUTPUT:
1. Capability Snapshot
2. Hiring Confidence (0–10 reasoning)
3. Interview Strategy
4. Verification Required
5. Role Fitment
6. Risk Signals
"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.choices[0].message.content