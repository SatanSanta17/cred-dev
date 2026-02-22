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
source venv/bin/activate  # On Windows: venv\Scripts\activate
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

# Start analysis (any combination of platforms)
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -F "resume=@/path/to/resume.pdf" \
  -F "github_url=https://github.com/yourusername" \
  -F "leetcode_url=https://leetcode.com/u/yourusername" \
  -F "linkedin_url=https://linkedin.com/in/yourprofile" \
  -F "candidate_name=Your Name"

# Check results
curl "http://localhost:8000/api/v1/analyze/{job_id}"
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
│       └── analyze.py       # API endpoints
├── services/
│   ├── __init__.py          # Main AnalysisService orchestrator
│   ├── resume_parser.py     # PDF/text resume processing
│   ├── github_fetcher.py    # GitHub API integration
│   ├── leetcode_fetcher.py  # LeetCode GraphQL API
│   ├── linkedin_fetcher.py  # LinkedIn profile scraping
│   ├── verifier.py          # 4-domain analysis engine
│   └── report_generator.py  # Intelligence Core & views
├── models/
│   ├── analysis.py          # API request/response models
│   └── reports.py           # Intelligence data structures
└── utils/
    └── helpers.py           # Utility functions
```

### Intelligence Pipeline

#### Stage 1: Raw Signal Extraction
- **Resume**: Skills, experience claims, project descriptions, contact info
- **GitHub**: Repositories, languages, commit patterns, production indicators
- **LeetCode**: Problem counts, difficulty ratios, activity patterns (GraphQL API)
- **LinkedIn**: Professional experience, company history, credibility signals

#### Stage 2: 4-Domain Analysis

##### 🎯 **Domain 1: Engineering & Development**
- Production capability assessment
- Architecture pattern recognition
- Code complexity evaluation
- System design indicators

##### 🧮 **Domain 2: Problem Solving & Algorithms**
- Algorithmic thinking evaluation
- Interview readiness assessment
- Competitive programming analysis
- Pattern recognition skills

##### ✅ **Domain 3: Professional Credibility**
- Claim verification (VERIFIED/PLAUSIBLE/CLAIMED)
- Timeline consistency checks
- Skills validation across platforms
- Trustworthiness assessment

##### ⚡ **Domain 4: Execution & Consistency**
- Long-term engagement patterns
- Learning velocity analysis
- Quality-over-quantity assessment
- Discipline indicators

#### Stage 3: Intelligence Core Generation
- **Capability Identity** synthesis
- **Cross-domain pattern** recognition
- **Overall scoring** (35% Engineering + 25% Problem Solving + 20% Credibility + 20% Execution)
- **Signal classification** (Green/Yellow/Red flags)

#### Stage 4: Derived Views
- **Developer Insights**: Growth trajectories, skill development focus
- **Recruiter Insights**: Hiring confidence, interview guidance, risk assessment
- **Credibility Card**: Shareable professional positioning

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

#### `POST /api/v1/analyze`
Start a new analysis job using any combination of platforms.

**Request (All Platforms):**
```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -F "resume=@/path/to/resume.pdf" \
  -F "github_url=https://github.com/username" \
  -F "leetcode_url=https://leetcode.com/u/username" \
  -F "linkedin_url=https://linkedin.com/in/profile" \
  -F "candidate_name=John Doe"
```

**Request (Minimum - Any One Platform):**
```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -F "github_url=https://github.com/username"
```

**Response:**
```json
{
  "job_id": "uuid-here",
  "status": "processing",
  "message": "Skill Intelligence Engine analysis started"
}
```

#### `GET /api/v1/analyze/{job_id}`
Get analysis results.

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
# Start analysis
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -F "github_url=https://github.com/microsoft" \
  -F "candidate_name=Test User"

# Response includes job_id, check status:
curl "http://localhost:8000/api/v1/analyze/{job_id}"
```

### Complete System Test
```bash
# Full analysis with all platforms
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -F "resume=@/path/to/resume.pdf" \
  -F "github_url=https://github.com/yourusername" \
  -F "leetcode_url=https://leetcode.com/u/yourusername" \
  -F "linkedin_url=https://linkedin.com/in/yourprofile" \
  -F "candidate_name=Your Name"

# Poll for completion (30-60 seconds)
watch -n 5 "curl -s http://localhost:8000/api/v1/analyze/{job_id} | jq .status"

# View complete intelligence report
curl "http://localhost:8000/api/v1/analyze/{job_id}" | jq
```

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