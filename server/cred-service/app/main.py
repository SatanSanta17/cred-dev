from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes import analyze

app = FastAPI(
    title="CredDev Analysis Service",
    description="Fact-checking and report generation for developer credibility",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(analyze.router, prefix="/api/v1", tags=["analysis"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}