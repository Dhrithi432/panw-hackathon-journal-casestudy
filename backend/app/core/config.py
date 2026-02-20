from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    anthropic_api_key: str = "mock-key"  # Default to mock
    port: int = 8000
    use_mock_ai: bool = True  # Enable mock mode by default
    database_url: str = "sqlite+aiosqlite:///./mindspace.db"

    # Request body and rate limiting
    max_body_bytes: int = 1_000_000  # 1MB
    rate_limit: str = "60/minute"  # Per-IP limit (slowapi format)

    class Config:
        env_file = ".env"

settings = Settings()