"""Centralized logging configuration for CredDev backend.

Call setup_logging() once at app startup (before any other imports that use logging).

Production (DEBUG=false): JSON format — one JSON object per line, searchable in Render logs.
Development (DEBUG=true): Human-readable format with timestamps and colors.
"""

import logging
import json
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """Outputs each log record as a single JSON line for structured log aggregation."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include exception info if present
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        # Include any extra fields (e.g., job_id, duration_ms)
        for key in ("job_id", "duration_ms", "method", "path", "status_code"):
            val = getattr(record, key, None)
            if val is not None:
                log_entry[key] = val

        return json.dumps(log_entry, default=str)


class DevFormatter(logging.Formatter):
    """Human-readable format for local development."""

    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # Shorten logger name: "services.extraction" → "extraction"
        short_name = record.name.rsplit(".", 1)[-1] if "." in record.name else record.name
        base = f"{timestamp} [{record.levelname:<7}] {short_name}: {record.getMessage()}"

        if record.exc_info and record.exc_info[0] is not None:
            base += "\n" + self.formatException(record.exc_info)

        return base


def setup_logging(debug: bool = False, log_level: str = "INFO") -> None:
    """Configure logging for the entire application.

    Args:
        debug: If True, use human-readable format and set level to DEBUG.
        log_level: Log level string (DEBUG, INFO, WARNING, ERROR). Overridden to DEBUG if debug=True.
    """
    level = logging.DEBUG if debug else getattr(logging, log_level.upper(), logging.INFO)

    # Choose formatter
    formatter = DevFormatter() if debug else JSONFormatter()

    # Configure root logger
    root = logging.getLogger()
    root.setLevel(level)

    # Remove any existing handlers (prevents duplicate logs on reload)
    root.handlers.clear()

    # Single handler: stdout
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    handler.setFormatter(formatter)
    root.addHandler(handler)

    # Quiet noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
