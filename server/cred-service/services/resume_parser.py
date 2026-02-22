"""Resume parsing service to extract structured data from resume files."""

import re
from typing import Dict, Any, List
import PyPDF2
import io

class ResumeParser:
    """Extracts structured data from resume files (PDF/txt)."""

    def __init__(self):
        pass

    async def parse_resume(self, resume_file) -> Dict[str, Any]:
        """
        Parse resume file and return structured data.

        Args:
            resume_file: Uploaded file object (FastAPI UploadFile)

        Returns:
            dict: Structured resume data
        """
        try:
            # Read file content
            content = await self._read_file_content(resume_file)

            # Extract text from PDF or use as-is for text files
            if resume_file.filename.lower().endswith('.pdf'):
                text_content = self._extract_text_from_pdf(content)
            else:
                text_content = content.decode('utf-8', errors='ignore')

            # Parse structured data from text
            parsed_data = self._parse_resume_text(text_content)

            return parsed_data

        except Exception as e:
            return {
                "name": "Unknown",
                "experience_years": 0,
                "skills": [],
                "companies": [],
                "education": "Not specified",
                "projects": [],
                "error": f"Failed to parse resume: {str(e)}",
                "raw_text": text_content[:500] if 'text_content' in locals() else ""
            }

    async def _read_file_content(self, resume_file) -> bytes:
        """Read file content from UploadFile."""
        content = await resume_file.read()
        # Reset file pointer for potential reuse
        await resume_file.seek(0)
        return content

    def _extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """Extract text content from PDF file."""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            text_content = ""

            for page in pdf_reader.pages:
                text_content += page.extract_text() + "\n"

            return text_content
        except Exception as e:
            return f"Error extracting PDF text: {str(e)}"

    def _parse_resume_text(self, text: str) -> Dict[str, Any]:
        """Parse resume text and extract structured information."""

        # Initialize result structure
        result = {
            "name": self._extract_name(text),
            "experience_years": self._estimate_experience_years(text),
            "skills": self._extract_skills(text),
            "companies": self._extract_companies(text),
            "education": self._extract_education(text),
            "projects": self._extract_projects(text),
            "contact_info": self._extract_contact_info(text),
            "summary": self._extract_summary(text)
        }

        return result

    def _extract_name(self, text: str) -> str:
        """Extract candidate name from resume."""
        lines = text.strip().split('\n')[:10]  # Check first 10 lines

        for line in lines:
            line = line.strip()
            if line and len(line.split()) >= 2 and len(line) < 50:
                # Skip email addresses, phone numbers, URLs
                if not re.search(r'@|\d{3,}|http|www', line):
                    # Check if it looks like a name (title case, proper nouns)
                    words = line.split()
                    if all(word[0].isupper() for word in words if word):
                        return line

        return "Not Found"

    def _estimate_experience_years(self, text: str) -> float:
        """Estimate total years of experience from resume."""
        # Look for experience mentions
        experience_patterns = [
            r'(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(?:of\s*)?experience',
            r'experience:?\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)',
            r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:work\s*)?experience'
        ]

        for pattern in experience_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    continue

        # Fallback: count job entries and estimate
        job_indicators = ['worked', 'employed', 'position', 'role', 'job']
        job_count = sum(1 for indicator in job_indicators
                       if indicator.lower() in text.lower())

        # Rough estimate: 1.5-2 years per job
        if job_count > 0:
            return min(job_count * 1.8, 15.0)  # Cap at 15 years

        return 0.0

    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume."""
        # Common skill keywords
        skill_keywords = [
            # Programming Languages
            'python', 'java', 'javascript', 'typescript', 'c\\+\\+', 'c#', 'php', 'ruby', 'go', 'rust',
            'swift', 'kotlin', 'scala', 'perl', 'r', 'matlab',

            # Web Technologies
            'html', 'css', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
            'spring', 'laravel', 'rails', 'asp\\.net',

            # Databases
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite',

            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',

            # Data Science & ML
            'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy',
            'scikit-learn', 'jupyter', 'tableau',

            # Soft Skills
            'leadership', 'communication', 'problem solving', 'teamwork', 'agile', 'scrum'
        ]

        found_skills = []
        text_lower = text.lower()

        for skill in skill_keywords:
            if re.search(r'\b' + skill + r'\b', text_lower):
                # Convert back to title case for display
                display_skill = skill.replace('\\', '').title()
                if display_skill not in found_skills:
                    found_skills.append(display_skill)

        return found_skills[:20]  # Limit to top 20 skills

    def _extract_companies(self, text: str) -> List[str]:
        """Extract company names from resume."""
        companies = []

        # Look for company-like patterns in employment sections
        lines = text.split('\n')

        for line in lines:
            line = line.strip()
            # Skip very short or long lines
            if len(line) < 3 or len(line) > 50:
                continue

            # Look for lines that might be company names
            # Typically after job titles or in employment sections
            if any(keyword in line.lower() for keyword in ['at', 'inc', 'ltd', 'corp', 'llc', 'technologies']):
                # Clean up the line
                company = re.sub(r'[•●○▪▫]', '', line).strip()
                if company and company not in companies:
                    companies.append(company)

        return companies[:10]  # Limit to 10 companies

    def _extract_education(self, text: str) -> str:
        """Extract education information."""
        education_keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'school']

        lines = text.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in education_keywords):
                return line.strip()

        return "Not specified"

    def _extract_projects(self, text: str) -> List[Dict[str, str]]:
        """Extract project information."""
        projects = []

        # Look for project sections
        project_indicators = ['project', 'built', 'developed', 'created']

        lines = text.split('\n')
        current_project = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check if this line indicates a project
            if any(indicator in line.lower() for indicator in project_indicators):
                if current_project:
                    projects.append(current_project)

                current_project = {
                    "name": line,
                    "description": "",
                    "technologies": []
                }
            elif current_project and not current_project["description"]:
                # This might be the project description
                if len(line) > 20 and len(line) < 200:
                    current_project["description"] = line

        # Add the last project if exists
        if current_project:
            projects.append(current_project)

        return projects[:5]  # Limit to 5 projects

    def _extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information."""
        contact_info = {}

        # Extract email
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        if email_match:
            contact_info["email"] = email_match.group()

        # Extract phone (basic pattern)
        phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        if phone_match:
            contact_info["phone"] = phone_match.group()

        # Extract LinkedIn URL
        linkedin_match = re.search(r'linkedin\.com/in/[^\s]+', text, re.IGNORECASE)
        if linkedin_match:
            contact_info["linkedin"] = linkedin_match.group()

        return contact_info

    def _extract_summary(self, text: str) -> str:
        """Extract professional summary."""
        # Look for summary/objective section
        summary_indicators = ['summary', 'objective', 'about', 'profile']

        lines = text.split('\n')
        for i, line in enumerate(lines):
            if any(indicator in line.lower() for indicator in summary_indicators):
                # Get the next few lines as summary
                summary_lines = []
                for j in range(i + 1, min(i + 4, len(lines))):
                    if lines[j].strip():
                        summary_lines.append(lines[j].strip())
                        if len(' '.join(summary_lines)) > 200:
                            break

                if summary_lines:
                    return ' '.join(summary_lines)

        return ""