"""
FastAPI dependency for Supabase Auth JWT validation (ES256 / JWKS).

Fetches the public key from Supabase's JWKS endpoint and caches it.
Tokens are verified using asymmetric ES256 — the public key can only
verify signatures, never forge them.

Usage in route handlers:
    @router.post("/protected")
    async def protected_route(current_user: dict = Depends(get_current_user)):
        user_id = current_user["id"]
        ...

    # Optional auth — returns None if no token present
    @router.get("/optional-auth")
    async def optional_route(current_user: dict | None = Depends(get_optional_user)):
        ...
"""

import logging
import time

import httpx
import jwt
from jwt import PyJWKClient
from fastapi import Header, HTTPException

from app.config import settings

logger = logging.getLogger(__name__)

# JWKS client — caches public keys and handles rotation automatically.
# Initialized lazily on first auth request to avoid startup failures
# when the network is unavailable.
_jwks_client: PyJWKClient | None = None
_jwks_client_init_time: float = 0
_JWKS_REFRESH_INTERVAL = 3600  # Re-create client every hour to pick up key rotations


def _get_jwks_client() -> PyJWKClient:
    """Return a cached PyJWKClient, refreshing periodically."""
    global _jwks_client, _jwks_client_init_time

    now = time.time()
    if _jwks_client is None or (now - _jwks_client_init_time) > _JWKS_REFRESH_INTERVAL:
        jwks_url = settings.get_supabase_jwks_url()
        if not jwks_url:
            raise RuntimeError("Supabase JWKS URL is not configured")

        _jwks_client = PyJWKClient(jwks_url)
        _jwks_client_init_time = now
        logger.info(f"JWKS client initialized from {jwks_url}")

    return _jwks_client


async def get_current_user(authorization: str = Header(None)) -> dict:
    """Validate Supabase JWT and return user dict. Raises 401 if invalid."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header",
        )

    token = authorization.split(" ", 1)[1]

    try:
        client = _get_jwks_client()
        signing_key = client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "HS256"],
            audience="authenticated",
        )
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role"),
        }
    except RuntimeError as e:
        logger.error(f"Auth configuration error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Auth configuration error")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.error(f"JWT validation failed: {e}", exc_info=True)
        raise HTTPException(status_code=401, detail="Invalid token")
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch JWKS: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Auth service temporarily unavailable")


async def get_optional_user(authorization: str = Header(None)) -> dict | None:
    """Return user dict if a valid token is present, None otherwise.

    Use this for endpoints that work for both authenticated and anonymous users
    (e.g., extraction — anonymous is allowed, but we attach user_id if available).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None
