"""Resume parsing service upgraded for credibility intelligence (developer resumes)."""

import re
from typing import Dict, Any, List
import PyPDF2
import io


class ResumeParser:
    """
    Extracts structured + signal-ready data from developer resumes.
    """

    # ---------------------------
    # PUBLIC ENTRY
    # ---------------------------

    async def parse_resume(self, resume_file) -> Dict[str, Any]:
        try:
            content = await self._read_file_content(resume_file)

            if resume_file.filename.lower().endswith('.pdf'):
                raw_text = self._extract_text_from_pdf(content)
            else:
                raw_text = content.decode('utf-8', errors='ignore')

            parsed = self._parse_resume_text(raw_text)

            return {
                "raw_text": raw_text,
                "parsed_resume": parsed
            }

        except Exception as e:
            return {
                "raw_text": "",
                "parsed_resume": {},
                "error": f"Failed to parse resume: {str(e)}"
            }

    async def _read_file_content(self, resume_file) -> bytes:
        content = await resume_file.read()
        await resume_file.seek(0)
        return content

    def _extract_text_from_pdf(self, pdf_content: bytes) -> str:
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            return f"PDF extraction error: {str(e)}"

    # ---------------------------
    # CORE PARSING
    # ---------------------------

    def _parse_resume_text(self, text: str) -> Dict[str, Any]:

        return {
            "name": self._extract_name(text),
            "experience_years": self._estimate_experience_years(text),
            "skills": self._extract_skills(text),
            "experience_entries": self._extract_experience_entries(text),
            "projects": self._extract_projects(text),
            "project_technologies": self._extract_project_technologies(text),
            "responsibility_sentences": self._extract_responsibility_sentences(text),
            "impact_statements": self._extract_impact_statements(text),
            "role_seniority": self._detect_role_seniority(text),
            "education": self._normalize_education(text),
            "contact_info": self._extract_contact_info(text),
            "summary": self._extract_summary(text),
            "resume_structure": self._extract_structure_signals(text)
        }

    # ---------------------------
    # EXTRACTION METHODS
    # ---------------------------

    def _extract_name(self, text: str) -> str:
        lines = text.strip().split('\n')[:10]
        for line in lines:
            line = line.strip()
            if line and len(line.split()) >= 2 and not re.search(r'@|\d{3,}|http', line):
                words = line.split()
                if all(word[0].isupper() for word in words if word):
                    return line
        return "Not Found"

    def _estimate_experience_years(self, text: str) -> float:
        patterns = [
            r'(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(?:of\s*)?experience'
        ]
        for p in patterns:
            match = re.search(p, text, re.IGNORECASE)
            if match:
                return float(match.group(1))
        return 0.0

    # ---------------------------
    # EXPERIENCE TIMELINE
    # ---------------------------

    def _extract_experience_entries(self, text: str) -> List[Dict[str, Any]]:
        entries = []

        pattern = r'([A-Za-z0-9 &]+)\s*[-–]\s*([A-Za-z0-9 ]+)\s*[-–]\s*(\d{4})'
        matches = re.findall(pattern, text)

        for match in matches:
            entries.append({
                "company": match[0],
                "role": match[1],
                "year": match[2]
            })

        return entries[:10]

    # ---------------------------
    # SKILLS
    # ---------------------------

    def _extract_skills(self, text: str) -> List[str]:
        skill_keywords = [
            "python","java","javascript","typescript","react","angular","node",
            "spring","kubernetes","docker","aws","sql","mongodb","redis","kafka",
            "system design","ci/cd"
        ]

        text_lower = text.lower()
        return [s for s in skill_keywords if s in text_lower]

    # ---------------------------
    # PROJECTS
    # ---------------------------

    def _extract_projects(self, text: str) -> List[str]:
        project_lines = []

        lines = text.split('\n')
        for line in lines:
            if any(word in line.lower() for word in ["project", "built", "developed", "created"]):
                project_lines.append(line.strip())

        return project_lines[:8]

    def _extract_project_technologies(self, text: str) -> List[str]:
        tech_stack = [
            "spring","react","aws","docker","kubernetes","mongodb","redis",
            "postgresql","kafka","tensorflow"
        ]
        return [t for t in tech_stack if t in text.lower()]

    # ---------------------------
    # RESPONSIBILITY SENTENCES
    # ---------------------------

    def _extract_responsibility_sentences(self, text: str) -> List[str]:
        verbs = ["built","designed","implemented","developed","led","architected","scaled"]

        sentences = re.split(r'\n|\. ', text)
        return [
            s.strip() for s in sentences
            if any(v in s.lower() for v in verbs) and len(s) < 200
        ][:20]

    # ---------------------------
    # IMPACT STATEMENTS
    # ---------------------------

    def _extract_impact_statements(self, text: str) -> List[str]:
        pattern = r'(improved|reduced|increased|optimized).{0,50}\d+%'
        return re.findall(pattern, text.lower())

    # ---------------------------
    # ROLE SENIORITY
    # ---------------------------

    def _detect_role_seniority(self, text: str) -> str:
        if re.search(r'architect|lead|principal', text, re.IGNORECASE):
            return "senior"
        if re.search(r'sde\s?2|mid|software engineer', text, re.IGNORECASE):
            return "mid"
        if re.search(r'intern|junior|trainee', text, re.IGNORECASE):
            return "junior"
        return "unknown"

    # ---------------------------
    # EDUCATION NORMALIZATION
    # ---------------------------

    def _normalize_education(self, text: str) -> Dict[str, str]:
        degree_match = re.search(r'(bachelor|master|phd)', text, re.IGNORECASE)
        institution_match = re.search(r'(university|college|institute)', text, re.IGNORECASE)

        return {
            "degree": degree_match.group(0) if degree_match else "",
            "institution": institution_match.group(0) if institution_match else ""
        }

    # ---------------------------
    # CONTACT
    # ---------------------------

    def _extract_contact_info(self, text: str) -> Dict[str, str]:
        email = re.search(r'\S+@\S+\.\S+', text)
        linkedin = re.search(r'linkedin\.com/in/[^\s]+', text)

        return {
            "email": email.group(0) if email else "",
            "linkedin": linkedin.group(0) if linkedin else ""
        }

    # ---------------------------
    # SUMMARY
    # ---------------------------

    def _extract_summary(self, text: str) -> str:
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if "summary" in line.lower():
                return " ".join(lines[i+1:i+4])
        return ""

    # ---------------------------
    # STRUCTURE SIGNALS
    # ---------------------------

    def _extract_structure_signals(self, text: str) -> Dict[str, bool]:

        return {
            "has_summary": "summary" in text.lower(),
            "has_projects": "project" in text.lower(),
            "has_experience": "experience" in text.lower(),
            "has_metrics": "%" in text
        }