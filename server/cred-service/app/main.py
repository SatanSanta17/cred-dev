import sys
import os
import re
import time
import logging

# Ensure the cred-service root is on the path so "services" can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from starlette.types import ASGIApp, Receive, Scope, Send, Message
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .logging_config import setup_logging
from .database import init_db
from .routes import extract, generate, stream

# --- Logging must be configured before anything else uses it ---
setup_logging(debug=settings.debug, log_level=settings.log_level)
logger = logging.getLogger(__name__)

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

# --- Request logging middleware (pure ASGI — does NOT buffer StreamingResponse) ---
# Using raw ASGI instead of @app.middleware("http") / BaseHTTPMiddleware because
# BaseHTTPMiddleware wraps StreamingResponse bodies, which buffers SSE events and
# prevents real-time progress streaming to the frontend.
JOB_ID_PATTERN = re.compile(r"/api/v1/(?:extract|generate)/([a-f0-9\-]{36})")


class RequestLoggingMiddleware:
    """Pure ASGI middleware that logs requests without buffering streaming responses."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")

        # Skip health checks
        if path == "/health":
            await self.app(scope, receive, send)
            return

        method = scope.get("method", "?")
        start = time.time()
        status_code = 0

        async def send_wrapper(message: Message):
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message.get("status", 0)
            await send(message)

        await self.app(scope, receive, send_wrapper)

        duration_ms = round((time.time() - start) * 1000)
        match = JOB_ID_PATTERN.search(path)
        job_id = match.group(1) if match else None

        extra = {"duration_ms": duration_ms, "method": method, "path": path, "status_code": status_code}
        if job_id:
            extra["job_id"] = job_id

        logger.info(
            f"{method} {path} → {status_code} ({duration_ms}ms)"
            + (f" job_id={job_id}" if job_id else ""),
            extra=extra,
        )


app.add_middleware(RequestLoggingMiddleware)


# Routes - Two-phase architecture
app.include_router(extract.router, prefix="/api/v1", tags=["extraction"])
app.include_router(generate.router, prefix="/api/v1", tags=["generation"])
app.include_router(stream.router, prefix="/api/v1", tags=["streaming"])


@app.on_event("startup")
def on_startup():
    """Create DB tables on startup and log configuration."""
    init_db()
    db_type = "PostgreSQL" if "postgresql" in settings.get_database_url() else "SQLite"
    logger.info(
        f"CredDev backend started — db={db_type}, log_level={settings.log_level}, debug={settings.debug}, cors={settings.cors_origins}"
    )


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": settings.get_database_url().split("@")[-1] if "@" in settings.get_database_url() else "sqlite"
    }
