"""Resume Parser — Raw Text Extraction Only

Converts resume files to raw text.
No structured parsing, no field extraction.
The LLM receives the raw text and does all the reasoning.
"""

import io
import logging
from typing import Dict, Any
import PyPDF2

logger = logging.getLogger(__name__)


class ResumeParser:

    def parse_resume_bytes(self, content: bytes, filename: str = "") -> Dict[str, Any]:
        logger.info(f"Resume parse started — filename={filename}, size={len(content)} bytes")
        try:
            if filename and filename.lower().endswith(".pdf"):
                raw_text = self._extract_pdf_text(content)
            else:
                raw_text = content.decode("utf-8", errors="ignore")

            logger.info(f"Resume parse succeeded — {len(raw_text)} chars extracted")
            return {"raw_text": raw_text}

        except Exception as e:
            logger.error(f"Resume parse failed for {filename}: {e}", exc_info=True)
            return {"raw_text": "", "error": f"Resume parsing failed: {str(e)}"}

    def _extract_pdf_text(self, pdf_content: bytes) -> str:
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            return f"PDF extraction error: {str(e)}"
