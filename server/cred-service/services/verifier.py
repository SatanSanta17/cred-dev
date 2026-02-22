"""Fact-checking and verification service."""

from typing import List, Dict, Any
from models.reports import VerificationStatus, SkillDomain

class Claim:
    """Represents a claim made in resume or profile."""

    def __init__(self, text: str, source: str, category: str):
        self.text = text
        self.source = source  # "resume", "github", "leetcode"
        self.category = category  # "experience", "skill", "metric", etc.
        self.status = VerificationStatus.CLAIMED
        self.evidence = []
        self.confidence = 0.0

class Verifier:
    """Skill Intelligence Engine - Fact-checking and domain analysis service."""

    def __init__(self):
        pass

    def analyze_domains(self, resume_data: dict, github_data: dict, leetcode_data: dict, linkedin_data: dict = None) -> Dict[SkillDomain, dict]:
        """
        Perform domain-based analysis following the Skill Intelligence Engine Model.

        Returns domain analyses for:
        - Engineering & Development
        - Problem Solving & Algorithms
        - Professional Credibility
        - Execution & Consistency
        """
        return {
            SkillDomain.ENGINEERING_DEVELOPMENT: self._analyze_engineering_domain(resume_data, github_data),
            SkillDomain.PROBLEM_SOLVING: self._analyze_problem_solving_domain(leetcode_data),
            SkillDomain.PROFESSIONAL_CREDIBILITY: self._analyze_credibility_domain(resume_data, github_data, linkedin_data),
            SkillDomain.EXECUTION_CONSISTENCY: self._analyze_execution_domain(github_data, leetcode_data)
        }

    def verify_claims(self, resume_data: dict, github_data: dict, leetcode_data: dict, linkedin_data: dict = None) -> Dict[str, List[dict]]:
        """
        Extract and verify all claims from resume against platform data.

        Returns:
            Dict with keys: 'verified', 'plausible', 'claimed'
        """
        claims = self._extract_all_claims(resume_data)

        verified = []
        plausible = []
        claimed = []

        for claim in claims:
            verified_claim = self._verify_single_claim(claim, github_data, leetcode_data)

            if verified_claim['status'] == VerificationStatus.VERIFIED:
                verified.append(verified_claim)
            elif verified_claim['status'] == VerificationStatus.PLAUSIBLE:
                plausible.append(verified_claim)
            else:
                claimed.append(verified_claim)

        return {
            'verified': verified,
            'plausible': plausible,
            'claimed': claimed
        }

    def _extract_all_claims(self, resume_data: dict) -> List[dict]:
        """Extract all verifiable claims from resume data."""
        claims = []

        # Experience claims
        if "experience_years" in resume_data:
            claims.append({
                'text': f"{resume_data['experience_years']} years of experience",
                'source': 'resume',
                'category': 'experience',
                'type': 'metric'
            })

        # Skill claims
        if "skills" in resume_data:
            for skill in resume_data["skills"]:
                claims.append({
                    'text': f"Proficient in {skill}",
                    'source': 'resume',
                    'category': 'skill',
                    'type': 'competency'
                })

        # Company claims
        if "companies" in resume_data:
            for company in resume_data["companies"]:
                claims.append({
                    'text': f"Worked at {company}",
                    'source': 'resume',
                    'category': 'employment',
                    'type': 'experience'
                })

        # Project claims (if available)
        if "projects" in resume_data:
            for project in resume_data["projects"]:
                if "description" in project:
                    claims.append({
                        'text': project.get('description', ''),
                        'source': 'resume',
                        'category': 'project',
                        'type': 'achievement'
                    })

        return claims

    def _verify_single_claim(self, claim: dict, github_data: dict, leetcode_data: dict, linkedin_data: dict = None) -> dict:
        """Verify a single claim and return enriched claim data."""
        verified_claim = claim.copy()
        verified_claim['status'] = VerificationStatus.CLAIMED
        verified_claim['evidence'] = []
        verified_claim['confidence'] = 0.0

        if claim['category'] == 'experience':
            self._verify_experience_claim(verified_claim, github_data)
        elif claim['category'] == 'skill':
            self._verify_skill_claim(verified_claim, github_data)
        elif claim['category'] == 'employment':
            self._verify_employment_claim(verified_claim, github_data, linkedin_data)
        elif claim['category'] == 'project':
            self._verify_project_claim(verified_claim, github_data)

        return verified_claim

    def _verify_experience_claim(self, claim: dict, github_data: dict):
        """Verify experience duration claims."""
        if github_data and "stats" in github_data:
            years_active = self._calculate_github_years(github_data)
            claimed_years = float(claim['text'].split()[0])

            if abs(years_active - claimed_years) <= 0.5:  # Within 6 months
                claim['status'] = VerificationStatus.VERIFIED
                claim['evidence'].append(f"GitHub account active for ~{years_active} years")
                claim['confidence'] = 0.8
            elif abs(years_active - claimed_years) <= 1.5:  # Within 18 months
                claim['status'] = VerificationStatus.PLAUSIBLE
                claim['evidence'].append(f"GitHub shows {years_active} years activity vs {claimed_years} claimed")
                claim['confidence'] = 0.6

    def _verify_skill_claim(self, claim: dict, github_data: dict):
        """Verify skill proficiency claims."""
        if github_data and "repositories" in github_data:
            skill_name = claim['text'].replace("Proficient in ", "").lower()
            repo_languages = self._extract_repo_languages(github_data)

            if skill_name in [lang.lower() for lang in repo_languages]:
                claim['status'] = VerificationStatus.VERIFIED
                claim['evidence'].append(f"Found {skill_name} usage in GitHub repositories")
                claim['confidence'] = 0.9
            else:
                # Check for related technologies
                related_skills = self._get_related_skills(skill_name)
                if any(rel.lower() in [lang.lower() for lang in repo_languages] for rel in related_skills):
                    claim['status'] = VerificationStatus.PLAUSIBLE
                    claim['evidence'].append(f"Found related technologies: {', '.join(related_skills)}")
                    claim['confidence'] = 0.7

    def _verify_employment_claim(self, claim: dict, github_data: dict, linkedin_data: dict = None):
        """Verify employment claims using GitHub and LinkedIn data."""
        company_name = claim['text'].replace("Worked at ", "").strip()

        # Check LinkedIn data first (more reliable for employment)
        if linkedin_data and 'professional_summary' in linkedin_data:
            companies = linkedin_data['professional_summary'].get('companies', [])
            if companies and any(company_name.lower() in company.lower() for company in companies):
                claim['status'] = VerificationStatus.VERIFIED
                claim['evidence'].append(f"Employment at {company_name} verified on LinkedIn")
                claim['confidence'] = 0.9
                return

        # Fallback to GitHub activity as secondary signal
        if github_data and len(github_data.get("repositories", [])) > 0:
            claim['status'] = VerificationStatus.PLAUSIBLE
            claim['evidence'].append("GitHub activity suggests professional development work")
            claim['confidence'] = 0.5

    def _verify_project_claim(self, claim: dict, github_data: dict):
        """Verify project description claims."""
        # Look for matching project descriptions in GitHub repos
        if github_data and "repositories" in github_data:
            project_text = claim['text'].lower()
            for repo in github_data["repositories"]:
                repo_desc = (repo.get('description') or '').lower()
                repo_name = (repo.get('name') or '').lower()

                if any(keyword in project_text for keyword in ['api', 'web', 'app', 'system', 'platform']):
                    if any(keyword in repo_desc or keyword in repo_name for keyword in ['api', 'web', 'app', 'system', 'platform']):
                        claim['status'] = VerificationStatus.PLAUSIBLE
                        claim['evidence'].append(f"Found similar project type in GitHub: {repo.get('name')}")
                        claim['confidence'] = 0.6
                        break

    def _analyze_engineering_domain(self, resume_data: dict, github_data: dict) -> dict:
        """Analyze Engineering & Development domain."""
        signals = []
        green_signals = []
        yellow_signals = []
        red_signals = []

        # Extract engineering signals
        if github_data:
            repos = github_data.get("repositories", [])
            stats = github_data.get("stats", {})

            # Repository analysis
            total_repos = len(repos)
            original_repos = sum(1 for r in repos if not r.get('fork', False))

            signals.append(f"{total_repos} total repos, {original_repos} original")

            # Language diversity
            languages = self._extract_repo_languages(github_data)
            signals.append(f"Languages: {', '.join(languages[:3])}")

            # Production indicators
            production_indicators = ['docker', 'kubernetes', 'aws', 'azure', 'ci', 'cd', 'env', 'config']
            prod_repos = sum(1 for r in repos if any(ind in (r.get('description') or '').lower() for ind in production_indicators))

            if prod_repos > 0:
                green_signals.append(f"{prod_repos} repos show production deployment patterns")
            else:
                yellow_signals.append("Limited production deployment evidence")

        # Classification logic
        classification = "foundational"  # default
        score = 5.0  # default
        benchmark = "average"

        # More sophisticated classification would go here
        if github_data and len(github_data.get("repositories", [])) > 10:
            classification = "production_capable"
            score = 7.0
            benchmark = "above"

        return {
            'classification': classification,
            'maturity_statement': f"Shows {classification.replace('_', ' ')} engineering capabilities with {len(green_signals)} production indicators.",
            'score': score,
            'benchmark_position': benchmark,
            'signals': signals,
            'green_signals': green_signals,
            'yellow_signals': yellow_signals,
            'red_signals': red_signals
        }

    def _analyze_problem_solving_domain(self, leetcode_data: dict) -> dict:
        """Analyze Problem Solving & Algorithms domain."""
        signals = []
        green_signals = []
        yellow_signals = []
        red_signals = []

        if leetcode_data:
            stats = leetcode_data.get("stats", {})
            solved = stats.get("total_solved", 0)
            easy = stats.get("easy_count", 0)
            medium = stats.get("medium_count", 0)
            hard = stats.get("hard_count", 0)

            signals.append(f"Solved: {solved} problems ({easy}E/{medium}M/{hard}H)")

            if solved > 200:
                green_signals.append("Strong algorithmic foundation")
            elif solved > 50:
                yellow_signals.append("Moderate problem-solving exposure")
            else:
                red_signals.append("Limited algorithmic practice")

        classification = "beginner_dsa"  # default
        score = 4.0
        benchmark = "below"

        # Classification logic
        if leetcode_data:
            solved = leetcode_data.get("stats", {}).get("total_solved", 0)
            if solved > 300:
                classification = "contest_grade"
                score = 8.0
                benchmark = "above"
            elif solved > 150:
                classification = "strong_algorithmic_depth"
                score = 7.0
                benchmark = "above"
            elif solved > 50:
                classification = "interview_prep_ready"
                score = 6.0
                benchmark = "average"

        return {
            'classification': classification,
            'maturity_statement': f"Demonstrates {classification.replace('_', ' ')} problem-solving capabilities.",
            'score': score,
            'benchmark_position': benchmark,
            'signals': signals,
            'green_signals': green_signals,
            'yellow_signals': yellow_signals,
            'red_signals': red_signals
        }

    def _analyze_credibility_domain(self, resume_data: dict, github_data: dict, linkedin_data: dict = None) -> dict:
        """Analyze Professional Credibility domain."""
        signals = []
        green_signals = []
        yellow_signals = []
        red_signals = []

        # Check timeline consistency across platforms
        resume_years = resume_data.get("experience_years", 0)
        if resume_years > 0:
            github_years = self._calculate_github_years(github_data) if github_data else 0
            linkedin_years = linkedin_data.get('professional_summary', {}).get('experience_years') if linkedin_data else None

            # Cross-platform timeline verification
            platforms_data = []
            if github_years > 0:
                platforms_data.append(("GitHub", github_years))
            if linkedin_years:
                platforms_data.append(("LinkedIn", linkedin_years))

            if len(platforms_data) >= 2:
                # Check consistency across platforms
                years_values = [data[1] for data in platforms_data]
                max_diff = max(years_values) - min(years_values)

                if max_diff < 1:  # Within 1 year across platforms
                    green_signals.append(f"Timeline consistency across {len(platforms_data)} platforms")
                elif max_diff < 2:
                    yellow_signals.append(f"Minor timeline variations across platforms (diff: {max_diff:.1f} years)")
                else:
                    red_signals.append(f"Significant timeline inconsistencies across platforms")

            # Individual platform checks
            if abs(github_years - resume_years) < 1 and github_years > 0:
                green_signals.append("Resume-GitHub timeline alignment")
            elif github_years > 0:
                yellow_signals.append(f"Resume-GitHub timeline gap: {resume_years} vs {github_years} years")

            if linkedin_years and abs(linkedin_years - resume_years) < 1:
                green_signals.append("Resume-LinkedIn timeline alignment")
            elif linkedin_years:
                yellow_signals.append(f"Resume-LinkedIn timeline gap: {resume_years} vs {linkedin_years} years")

        # Skills verification across platforms
        if "skills" in resume_data:
            claimed_skills = set(s.lower() for s in resume_data["skills"])

            # GitHub verification
            github_verified = set()
            if github_data:
                github_languages = set(lang.lower() for lang in self._extract_repo_languages(github_data))
                github_verified = claimed_skills.intersection(github_languages)

            # LinkedIn verification
            linkedin_verified = set()
            if linkedin_data and 'professional_summary' in linkedin_data:
                linkedin_skills = set(s.lower() for s in linkedin_data['professional_summary'].get('skills', []))
                linkedin_verified = claimed_skills.intersection(linkedin_skills)

            # Combine verification results
            all_verified = github_verified.union(linkedin_verified)
            if all_verified:
                green_signals.append(f"Skills verified across platforms: {', '.join(list(all_verified)[:3])}")
            elif github_verified or linkedin_verified:
                yellow_signals.append(f"Partial skill verification on {'GitHub' if github_verified else 'LinkedIn'}")
            else:
                yellow_signals.append("Limited skill verification across platforms")

        # Employment verification using LinkedIn
        if linkedin_data and 'professional_summary' in linkedin_data:
            linkedin_companies = linkedin_data['professional_summary'].get('companies', [])
            resume_companies = resume_data.get('companies', [])

            if linkedin_companies and resume_companies:
                linkedin_set = set(c.lower() for c in linkedin_companies)
                resume_set = set(c.lower() for c in resume_companies)
                matching_companies = linkedin_set.intersection(resume_set)

                if matching_companies:
                    green_signals.append(f"Employment history verified: {', '.join(list(matching_companies)[:2])}")
                else:
                    yellow_signals.append("Employment history discrepancies between resume and LinkedIn")

        classification = "evidence_gap"  # default
        score = 5.0
        benchmark = "stable"

        # Count verification signals
        total_signals = len(green_signals) + len(yellow_signals) + len(red_signals)
        green_ratio = len(green_signals) / max(total_signals, 1)

        if green_ratio > 0.7:
            classification = "high_alignment"
            score = 8.0
            benchmark = "strong"
        elif green_ratio > 0.4:
            classification = "minor_claim_inflation"
            score = 6.0
            benchmark = "stable"
        elif red_signals:
            classification = "credibility_risk"
            score = 3.0
            benchmark = "weak"

        return {
            'classification': classification,
            'maturity_statement': f"Professional credibility shows {classification.replace('_', ' ')} with evidence alignment.",
            'score': score,
            'benchmark_position': benchmark,
            'signals': signals,
            'green_signals': green_signals,
            'yellow_signals': yellow_signals,
            'red_signals': red_signals
        }

    def _analyze_execution_domain(self, github_data: dict, leetcode_data: dict) -> dict:
        """Analyze Execution & Consistency domain."""
        signals = []
        green_signals = []
        yellow_signals = []
        red_signals = []

        # GitHub activity analysis
        if github_data:
            repos = github_data.get("repositories", [])
            total_repos = len(repos)

            signals.append(f"{total_repos} GitHub repositories")

            if total_repos > 20:
                green_signals.append("High repository volume indicates consistent execution")
            elif total_repos > 10:
                yellow_signals.append("Moderate repository activity")
            else:
                red_signals.append("Limited public execution evidence")

        # LeetCode consistency
        if leetcode_data:
            recent_activity = leetcode_data.get("recent_submissions", [])
            signals.append(f"{len(recent_activity)} recent LeetCode submissions")

            if len(recent_activity) > 50:
                green_signals.append("High LeetCode engagement shows execution discipline")
            elif len(recent_activity) > 10:
                yellow_signals.append("Moderate problem-solving consistency")

        classification = "moderate_engagement"  # default
        score = 5.0
        benchmark = "moderate"

        # Calculate execution score based on activity volume
        github_score = min(len(github_data.get("repositories", [])) / 10, 1) if github_data else 0
        leetcode_score = min(len(leetcode_data.get("recent_submissions", [])) / 30, 1) if leetcode_data else 0

        combined_score = (github_score + leetcode_score) / 2

        if combined_score > 0.8:
            classification = "high_consistency"
            score = 8.0
            benchmark = "strong"
        elif combined_score > 0.4:
            classification = "moderate_engagement"
            score = 6.0
            benchmark = "moderate"
        elif combined_score < 0.2:
            classification = "concerning_inactivity"
            score = 3.0
            benchmark = "weak"
        else:
            classification = "irregular_effort"
            score = 4.0
            benchmark = "weak"

        return {
            'classification': classification,
            'maturity_statement': f"Execution pattern shows {classification.replace('_', ' ')} with activity consistency.",
            'score': score,
            'benchmark_position': benchmark,
            'signals': signals,
            'green_signals': green_signals,
            'yellow_signals': yellow_signals,
            'red_signals': red_signals
        }

    def _calculate_github_years(self, github_data: dict) -> float:
        """Calculate years of GitHub activity."""
        if "stats" in github_data and "created_at" in github_data["stats"]:
            # This would need proper date parsing in production
            return 2.5  # Placeholder - would calculate from actual dates
        return 0

    def _extract_repo_languages(self, github_data: dict) -> List[str]:
        """Extract programming languages from repositories."""
        languages = []
        if "repositories" in github_data:
            for repo in github_data["repositories"]:
                if "language" in repo and repo["language"]:
                    languages.append(repo["language"])
        return list(set(languages))  # Remove duplicates

    def _get_related_skills(self, skill: str) -> List[str]:
        """Get related technologies for a given skill."""
        skill_map = {
            'javascript': ['typescript', 'node.js', 'react', 'vue', 'angular'],
            'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy'],
            'java': ['spring', 'hibernate', 'maven', 'gradle'],
            'csharp': ['.net', 'asp.net', 'entity framework'],
            'php': ['laravel', 'symfony', 'wordpress'],
            'ruby': ['rails', 'sinatra'],
            'go': ['gin', 'fiber'],
            'rust': ['actix', 'rocket']
        }
        return skill_map.get(skill.lower(), [])