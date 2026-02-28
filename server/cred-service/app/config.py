from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database — maps to POSTGRES_URL or POSTGRES_URL_NON_POOLING in .env
    database_url: Optional[str] = None
    postgres_url: Optional[str] = None
    postgres_url_non_pooling: Optional[str] = None

    # External APIs
    github_token: Optional[str] = None
    openai_api_key: Optional[str] = None

    # Supabase
    supabase_url: Optional[str] = None
    next_public_supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    supabase_service_key: Optional[str] = None

    # App settings
    debug: bool = False
    cors_origins: list = ["http://localhost:3000"]

    class Config:
        # Priority: cred-service/.env first, then root .env
        env_file = (".env")
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore extra env vars not defined here

    def get_database_url(self) -> str:
        """Return the best available database URL."""
        url = None
        if self.database_url:
            url = self.database_url
        elif self.postgres_url_non_pooling:
            url = self.postgres_url_non_pooling
        elif self.postgres_url:
            url = self.postgres_url

        if url:
            # SQLAlchemy requires "postgresql://" not "postgres://"
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url

        # Fallback to SQLite for local dev
        return "sqlite:///./creddev_local.db"

    def get_supabase_url(self) -> str:
        return self.supabase_url or self.next_public_supabase_url or ""

    def get_supabase_key(self) -> str:
        return self.supabase_service_role_key or self.supabase_service_key or ""


settings = Settings()
