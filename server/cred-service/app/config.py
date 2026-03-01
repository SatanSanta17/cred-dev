from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database — maps to POSTGRES_URL or POSTGRES_URL_NON_POOLING in .env
    cred_service_database_url: Optional[str] = None
    cred_service_postgres_url: Optional[str] = None
    cred_service_postgres_url_non_pooling: Optional[str] = None

    # External APIs
    github_token: Optional[str] = None
    openai_api_key: Optional[str] = None

    # Supabase
    cred_service_supabase_url: Optional[str] = None
    cred_service_supabase_service_role_key: Optional[str] = None
    cred_service_supabase_service_key: Optional[str] = None

    # Email (SMTP)
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None  # defaults to smtp_user if not set
    smtp_from_name: str = "CredDev"

    # App settings
    debug: bool = False
    # should i add my production url here? 
    production_url: Optional[str] = None
    cors_origins: list = ["http://localhost:3000",production_url]

    class Config:
        # Priority: cred-service/.env first, then root .env
        env_file = (".env")
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore extra env vars not defined here

    def get_database_url(self) -> str:
        """Return the best available database URL."""
        url = None
        if self.cred_service_database_url:
            url = self.cred_service_database_url
        elif self.cred_service_postgres_url_non_pooling:
            url = self.cred_service_postgres_url_non_pooling
        elif self.cred_service_postgres_url:
            url = self.cred_service_postgres_url

        if url:
            # SQLAlchemy requires "postgresql://" not "postgres://"
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url

        # Fallback to SQLite for local dev
        return "sqlite:///./creddev_local.db"

    def get_supabase_url(self) -> str:
        return self.cred_service_supabase_url or ""

    def get_supabase_key(self) -> str:
        return self.cred_service_supabase_service_role_key or self.cred_service_supabase_service_key or ""


settings = Settings()
