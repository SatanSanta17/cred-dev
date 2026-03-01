import sys
import os

# Ensure the cred-service root is on the path so "services" can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .routes import extract, generate, stream

app = FastAPI(
    title="CredDev Skill Intelligence Engine",
    description="Two-phase developer credibility analysis: extract raw data, generate intelligence reports",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes - Two-phase architecture
app.include_router(extract.router, prefix="/api/v1", tags=["extraction"])
app.include_router(generate.router, prefix="/api/v1", tags=["generation"])
app.include_router(stream.router, prefix="/api/v1", tags=["streaming"])


@app.on_event("startup")
def on_startup():
    """Create DB tables on startup."""
    init_db()


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": settings.get_database_url().split("@")[-1] if "@" in settings.get_database_url() else "sqlite"
    }
