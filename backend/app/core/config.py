from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_name: str = "GNIOT X AWS Builders Hub API"
    api_v1_prefix: str = "/api/v1"
    environment: Literal["development", "staging", "production"] = "development"

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/gniot_builder_hub"

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"

    frontend_url: AnyHttpUrl = "http://localhost:3000"
    cookie_name: str = "gniot_access_token"
    cookie_secure: bool = False
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"

    admin_seed_email: EmailStr = "leader@gniot.edu.in"


@lru_cache
def get_settings() -> Settings:
    return Settings()
