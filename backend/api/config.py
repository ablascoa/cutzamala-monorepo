from typing import List
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    DATABASE_PATH: str = os.path.join(os.path.dirname(__file__), "..", "cutzamala.db")
    RATE_LIMIT_PER_HOUR: int = 1000
    RATE_LIMIT_PER_MINUTE: int = 50
    MAX_LIMIT: int = 10000
    DEFAULT_LIMIT: int = 1000
    CORS_ORIGINS: List[str] = ["*"]
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"


settings = Settings()