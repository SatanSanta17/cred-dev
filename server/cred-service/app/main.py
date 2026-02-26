from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes import extract
from .routes import generate
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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}