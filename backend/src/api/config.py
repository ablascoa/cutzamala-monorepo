from typing import List
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
import os
import json


class Settings(BaseSettings):
    # Database configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:password@localhost:5432/cutzamala"
    )
    USE_SQLITE: bool = os.getenv("USE_SQLITE", "false").lower() == "true"
    DATABASE_PATH: str = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cutzamala.db")
    
    # Rate limiting
    RATE_LIMIT_PER_HOUR: int = 1000
    RATE_LIMIT_PER_MINUTE: int = 50
    MAX_LIMIT: int = 10000
    DEFAULT_LIMIT: int = 1000
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse CORS_ORIGINS from environment variable if it's a JSON string
        cors_env = os.getenv("CORS_ORIGINS")
        if cors_env:
            try:
                parsed_origins = json.loads(cors_env)
                if isinstance(parsed_origins, list):
                    self.CORS_ORIGINS = parsed_origins
            except (json.JSONDecodeError, TypeError):
                # If parsing fails, split by comma as fallback
                self.CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",")]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    model_config = ConfigDict(env_file=".env")


settings = Settings()