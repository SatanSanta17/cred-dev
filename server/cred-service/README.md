# CredDev Skill Intelligence Engine

**The Fact-Checking Layer for Developer Credibility**

A sophisticated Python-based service that implements the **Skill Intelligence Engine Model** to analyze developer capabilities across four critical domains: Engineering & Development, Problem Solving & Algorithms, Professional Credibility, and Execution & Consistency.

---

## 🎯 What This Service Does

CredDev's Skill Intelligence Engine does **NOT** analyze platforms. It analyzes **capability**.

### Core Philosophy
```
✅ WE ANALYZE: Engineering depth, Problem-solving ability, Credibility signals, Execution patterns
❌ WE IGNORE: Platform metrics, Vanity statistics, Resume hype, Social media presence
```

### Intelligence Architecture

#### 🧠 **Intelligence Core (Primary)**
The single source of truth containing:
- **Capability Identity**: One-sentence role positioning
- **4-Domain Analysis**: Engineering, Problem Solving, Credibility, Execution
- **VERIFIED/PLAUSIBLE/CLAIMED** claim classification
- **Cross-domain correlations** and patterns

#### 📊 **Derived Views (Secondary)**
Generated from the Intelligence Core:
- **Developer Insight View**: Growth-focused guidance
- **Recruiter Insight View**: Decision-oriented assessment
- **Credibility Card**: Social visibility summary

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL database (Supabase recommended)
- GitHub Personal Access Token (optional, improves rate limits)

### Installation

1. **Clone and setup:**
```bash
cd server/cred-service
python3.11 -m venv venv
source venv/bin/activate  
# On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment configuration:**
```bash
cp .env.example .env
# Edit .env with your database URL and API keys
```

3. **Database setup:**
The service uses these tables (auto-created in development):
- `analysis_jobs` - Job tracking
- `raw_data` - Platform data snapshots
- `reports` - Generated analysis results

4. **Start the service:**
```bash
uvicorn app.main:app --reload --port 8000
```

### Test the API
```bash
# Health check
curl http://localhost:8000/health

# Phase 1: Extract raw data (any combination of platforms)
curl -X POST "http://localhost:8000/api/v1/extract" \
  -F "resume=@/path/to/resume.pdf" \
  -F "github_url=https://github.com/yourusername" \
  -F "leetcode_url=https://leetcode.com/u/yourusername" \
  -F "linkedin_url=https://linkedin.com/in/yourprofile" \
  -F "candidate_name=Your Name"

# Phase 2: Generate intelligence reports
curl -X POST "http://localhost:8000/api/v1/generate/{job_id}"

# Check generation status and results
curl "http://localhost:8000/api/v1/generate/{job_id}"
```

---

## 🏗️ Architecture

### Directory Structure
```
server/cred-service/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Environment & settings
│   ├── database.py          # SQLAlchemy models
│   └── routes/
│       ├── extract.py       # Raw data extraction endpoints
│       └── generate.py      # Intelligence generation endpoints
├── services/
│   ├── extraction.py        # Raw data collection service
│   ├── pipeline_runner.py   # Analysis orchestration
│   ├── credibility_engine.py # Claim validation engine
│   ├── intelligence_engine.py # 4-domain analysis engine
│   ├── resume_parser.py     # PDF/text resume processing
│   ├── github_fetcher.py    # GitHub API integration
│   ├── leetcode_fetcher.py  # LeetCode GraphQL API
│   ├── linkedin_fetcher.py  # LinkedIn profile scraping
│   ├── verifier.py          # Legacy 4-domain analysis
│   ├── report_generator.py  # Report generation service
│   ├── report_storage.py    # Report persistence
│   ├── raw_data_loader.py   # Raw data retrieval
│   └── resume_claims_extractor.py # Claim extraction
└── requirements.txt         # Python dependencies
```

### Two-Phase Intelligence Pipeline

#### Phase 1: Raw Signal Extraction (`/extract`)
**Purpose**: Collect and normalize data from all platforms without analysis.

- **Resume Processing**: PDF/text parsing, claim extraction, structured data
- **GitHub Analysis**: Repository metadata, language stats, activity patterns
- **LeetCode Integration**: GraphQL API data, submission calendar, tag analysis
- **LinkedIn Scraping**: Professional experience, company history, skills validation
- **Data Storage**: Raw signals persisted for analysis

#### Phase 2: Intelligence Generation (`/generate`)
**Purpose**: Transform raw data into actionable developer intelligence.

##### Stage 2.1: Claim Validation
- **Credibility Engine**: Cross-platform claim verification (VERIFIED/PLAUSIBLE/CLAIMED)
- **Timeline Consistency**: Employment and project history validation
- **Skills Correlation**: Technical ability assessment across platforms

##### Stage 2.2: 4-Domain Analysis

###### 🎯 **Domain 1: Engineering & Development**
- Production capability assessment from GitHub repositories
- Architecture pattern recognition and system design indicators
- Code quality evaluation and technical depth analysis

###### 🧮 **Domain 2: Problem Solving & Algorithms**
- Algorithmic thinking evaluation from LeetCode patterns
- Interview readiness assessment and competitive programming analysis
- Problem-solving consistency and difficulty progression

###### ✅ **Domain 3: Professional Credibility**
- Claim verification across resume, LinkedIn, and GitHub
- Timeline consistency checks and career progression validation
- Trustworthiness assessment and professional network analysis

###### ⚡ **Domain 4: Execution & Consistency**
- Long-term engagement patterns across all platforms
- Learning velocity and skill development trajectory
- Discipline indicators and sustained performance analysis

##### Stage 2.3: Intelligence Core Generation
- **Capability Identity** synthesis (one-sentence professional positioning)
- **Cross-domain pattern** recognition and correlation analysis
- **Overall scoring** (35% Engineering + 25% Problem Solving + 20% Credibility + 20% Execution)
- **Signal classification** (Green/Yellow/Red flags with evidence)

##### Stage 2.4: Derived Views Creation
- **Developer Insights**: Growth trajectories and skill development guidance
- **Recruiter Insights**: Hiring confidence, interview guidance, risk assessment
- **Credibility Card**: Shareable professional positioning summary

---

## 📡 API Documentation

### Endpoints

#### `GET /health`
Health check endpoint.
```json
{
  "status": "healthy"
}
```

#### `POST /api/v1/extract`
Extract raw data from resume, GitHub, LeetCode, and LinkedIn platforms.

**Request (All Platforms):**
```bash
curl -X POST "http://localhost:8000/api/v1/extract" \
  -F "resume=@/path/to/resume.pdf" \
  -F "github_url=https://github.com/username" \
  -F "leetcode_url=https://leetcode.com/u/username" \
  -F "linkedin_url=https://linkedin.com/in/profile" \
  -F "candidate_name=John Doe"
```

**Request (Minimum - Any One Platform):**
```bash
curl -X POST "http://localhost:8000/api/v1/extract" \
  -F "github_url=https://github.com/username"
```

**Response:**
```json
{
  "job_id": "uuid-here",
  "status": "extracting",
  "message": "Raw data extraction started"
}
```

#### `POST /api/v1/generate/{job_id}`
Generate intelligence reports from previously extracted raw data.

**Response:**
```json
{
  "job_id": "uuid-here",
  "status": "generating",
  "message": "Intelligence generation started"
}
```

#### `GET /api/v1/generate/{job_id}`
Get generation status and completed intelligence reports.

**Response (Completed):**
```json
{
  "job_id": "uuid-here",
  "status": "completed",
  "intelligence_core": {
    "capability_identity": "Mid-level backend engineer with solid algorithmic foundation and emerging system design skills",
    "overall_score": 7.5,
    "domain_analyses": {
      "engineering_development": {
        "classification": "production_capable",
        "score": 8.5,
        "maturity_statement": "Demonstrates production-grade engineering with system architecture awareness"
      },
      "problem_solving": {
        "classification": "interview_prep_ready",
        "score": 7.8,
        "maturity_statement": "Shows solid algorithmic thinking with good interview preparation"
      },
      "professional_credibility": {
        "classification": "high_alignment",
        "score": 8.0,
        "maturity_statement": "High credibility with verified claims and consistent professional presence"
      },
      "execution_consistency": {
        "classification": "high_consistency",
        "score": 8.3,
        "maturity_statement": "Strong execution discipline with consistent long-term engagement"
      }
    },
    "cross_domain_pattern": "Profile shows strong production engineering with solid problem-solving foundation and high credibility alignment",
    "verified_claims": [...],
    "plausible_claims": [...],
    "claimed_only": [...],
    "green_signals": ["Production deployments", "Consistent GitHub activity"],
    "yellow_signals": ["Limited open source contributions"],
    "red_signals": []
  },
  "derived_views": {
    "developer_insight": {
      "content": "Focus on expanding open source contributions...",
      "key_insights": ["Build portfolio visibility", "Strengthen system design skills"]
    },
    "recruiter_insight": {
      "content": "High-confidence hire with verified technical capabilities...",
      "key_insights": ["Ready for senior backend roles", "Strong cultural fit potential"]
    }
  },
  "credibility_card": {
    "identity": "Senior Backend Engineer",
    "score": 8.2,
    "verified_signals": 12,
    "top_strengths": ["Production Engineering", "System Architecture"]
  }
}
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# External APIs
GITHUB_TOKEN=your_github_token_here  # Optional, improves rate limits
OPENAI_API_KEY=your_openai_key_here  # Optional, for enhanced analysis

# Supabase (for user management)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# Application
DEBUG=true
```

### Database Schema

The service expects these PostgreSQL tables:

```sql
-- Analysis jobs
CREATE TABLE analysis_jobs (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR,
    status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    resume_uri VARCHAR,
    github_url VARCHAR,
    leetcode_url VARCHAR,
    linkedin_url VARCHAR

);

-- Raw platform data
CREATE TABLE raw_data (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR REFERENCES analysis_jobs(id),
    data_type VARCHAR, -- 'github', 'leetcode', 'resume'
    data JSONB,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated reports
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR REFERENCES analysis_jobs(id),
    layer VARCHAR, -- 'intelligence_core', 'developer_insight', 'recruiter_insight'
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎯 Key Features

### Intelligence-Driven Analysis
- **Platform Agnostic**: Analyzes capability, not platform metrics
- **Evidence-Based**: Every conclusion backed by verifiable data
- **Contextual**: Considers experience level and role expectations
- **Balanced**: Weights multiple factors for comprehensive assessment

### Multi-Platform Data Sources
- **Resume Processing**: PDF/text parsing with structured extraction
- **GitHub Integration**: Repository analysis and engineering signals
- **LeetCode GraphQL**: Official API for problem-solving statistics
- **LinkedIn Scraping**: Professional credibility and career validation

### Advanced Verification
- **VERIFIED**: Observable evidence supports claim
- **PLAUSIBLE**: Consistent with context but not fully verifiable
- **CLAIMED**: Stated but lacking supporting evidence

### Domain Expertise
- **Engineering Depth**: Beyond tutorials to production systems
- **Problem Solving**: Algorithmic thinking and interview readiness
- **Credibility Signals**: Trust indicators across platforms
- **Execution Patterns**: Long-term discipline and consistency

---

## 🚦 Development Status

### ✅ **COMPLETED - Production Ready**
- **Skill Intelligence Engine**: Full 4-domain analysis architecture
- **Multi-Platform Integration**: Resume, GitHub, LeetCode (GraphQL), LinkedIn
- **Intelligence Core Generation**: Capability identity and cross-domain patterns
- **Derived Views**: Developer insights + Recruiter assessments
- **API Infrastructure**: FastAPI with async processing and background jobs
- **Database Integration**: PostgreSQL with proper job/result storage
- **Error Handling**: Comprehensive error handling and fallbacks
- **Data Processing**: PDF parsing, web scraping, API integrations

### 🎯 **Current Capabilities**
- **Resume Analysis**: PDF/text parsing with structured skill/experience extraction
- **GitHub Intelligence**: Repository patterns, language analysis, production indicators
- **LeetCode Assessment**: Official GraphQL API with fallback scraping
- **LinkedIn Verification**: Professional credibility and career timeline validation
- **Cross-Platform Correlation**: Timeline consistency and claim verification
- **Intelligence Reports**: VERIFIED/PLAUSIBLE/CLAIMED claim classification

### 🔧 **Optional Enhancements**
- LLM-enhanced natural language generation
- Result caching for performance
- Advanced analytics dashboard
- Batch processing for enterprise use
- Additional platform integrations

---

## 🧪 Testing

### Basic API Test
```bash
# Phase 1: Extract raw data
curl -X POST "http://localhost:8000/api/v1/extract" \
  -F "github_url=https://github.com/microsoft" \
  -F "candidate_name=Test User"

# Phase 2: Generate intelligence
curl -X POST "http://localhost:8000/api/v1/generate/{job_id}"

# Check generation status:
curl "http://localhost:8000/api/v1/generate/{job_id}"
```

### Complete System Test
```bash
# Phase 1: Extract raw data from all platforms
curl -X POST "http://localhost:8000/api/v1/extract" \
  -F "resume=@/path/to/resume.pdf" \
  -F "github_url=https://github.com/yourusername" \
  -F "leetcode_url=https://leetcode.com/u/yourusername" \
  -F "linkedin_url=https://linkedin.com/in/yourprofile" \
  -F "candidate_name=Your Name"

# Phase 2: Generate intelligence reports
curl -X POST "http://localhost:8000/api/v1/generate/{job_id}"

# Poll for completion (45-90 seconds total)
watch -n 10 "curl -s http://localhost:8000/api/v1/generate/{job_id} | jq .status"

# View complete intelligence report
curl "http://localhost:8000/api/v1/generate/{job_id}" | jq
```

### Two-Phase Benefits
- **Phase 1** extracts raw data once (faster, ~15-30 seconds)
- **Phase 2** generates intelligence (slower, ~30-60 seconds)
- **Separation** allows retrying analysis without re-extraction
- **Debugging** isolates issues in data collection vs intelligence generation

---

## 🤝 Contributing

This service implements CredDev's fact-checking methodology:

1. **Evidence over claims** - Every conclusion must be data-driven
2. **Capability over platforms** - Focus on what someone can build
3. **Intelligence over metrics** - Generate insights, not just statistics
4. **Trust over hype** - Build credibility through transparency

### Development Guidelines
- Follow the 9-stage workflow from `REPORT_CHECKLIST.md`
- Implement domain-based analysis
- Use VERIFIED/PLAUSIBLE/CLAIMED classification
- Generate Intelligence Core before derived views

---

*"We don't analyze platforms. We analyze capability."*

**CredDev - The Skill Intelligence Engine**