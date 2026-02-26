from typing import Dict, Any

from .signal_summary_builder import SignalSummaryBuilder
from .report_generator import ReportGenerator


class CandidateAnalysisPipeline:
    """
    End-to-end execution layer.

    intelligence_output  -> signal summary
    credibility_output   -> signal summary
                          -> LLM reports
    """

    def __init__(self):
        self.summary_builder = SignalSummaryBuilder()
        self.report_generator = ReportGenerator()

    # =====================================================
    # PUBLIC ENTRY
    # =====================================================

    def run_analysis(
        self,
        intelligence_output: Dict[str, Any],
        credibility_output: Dict[str, Any]
    ) -> Dict[str, Any]:

        # Step 1: Build LLM-ready signal summary
        signal_summary = self.summary_builder.build_summary(
            intelligence_output,
            credibility_output
        )

        # Step 2: Generate reports via LLM
        reports = self.report_generator.generate_reports(
            intelligence_output=signal_summary,
            credibility_output=credibility_output
        )

        return {
            "signal_summary": signal_summary,
            "reports": reports
        }