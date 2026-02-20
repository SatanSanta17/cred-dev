# CredDev Analysis Service

Python-based service for developer credibility analysis and report generation.

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Environment variables:**
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL` & `SUPABASE_SERVICE_KEY`: For user data access
- `GITHUB_TOKEN`: Optional, for higher API rate limits
- `OPENAI_API_KEY`: For LLM-powered analysis

3. **Database setup:**
```bash
# Create tables (using Alembic when ready)
# For now, manually create the tables defined in app/database.py
```

4. **Run the service:**
```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/v1/analyze` - Start analysis job
- `GET /api/v1/analyze/{job_id}` - Get job status

## Architecture

- **app/**: FastAPI application and routes
- **services/**: Business logic (parsing, fetching, verification, reports)
- **models/**: Pydantic data models
- **utils/**: Helper functions

## Development

The service follows this analysis pipeline:
1. **Resume Parser** - Extract structured data from uploaded resume
2. **GitHub Fetcher** - Get profile and repository data
3. **LeetCode Fetcher** - Get problem-solving statistics
4. **Verifier** - Fact-check claims against platform data
5. **Report Generator** - Create reports in different layers

## Testing

Test the API with curl:

```bash
# Start analysis
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -F "github_url=https://github.com/yourusername"

# Check status
curl "http://localhost:8000/api/v1/analyze/{job_id}"
```