from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://user:password@localhost/cred_dev"

    # External APIs
    github_token: Optional[str] = None
    openai_api_key: Optional[str] = None

    # Service URLs
    supabase_url: str
    supabase_service_key: str

    # App settings
    debug: bool = False
    cors_origins: list = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()