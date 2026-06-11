# app/config.py
#
# All environment-based configuration lives here.
# Pydantic Settings reads values from environment variables
# or a .env file automatically.
# Nothing is hardcoded — values come from docker-compose environment section.

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # ─────────────────────────────────────────────
    # DATABASE
    # asyncpg requires the postgresql+asyncpg:// prefix
    # for SQLAlchemy async engine
    # ─────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://postgres:password@db:5432/undp_damage_db"

    # ─────────────────────────────────────────────
    # MARTIN TILE SERVER
    # Base URL where Martin is serving tiles
    # Returned to the client in the bbox endpoint response
    # ─────────────────────────────────────────────
    martin_url: str = "http://martin:3000"

    # ─────────────────────────────────────────────
    # BBOX RADIUS
    # Default radius in kilometers for bounding box calculation
    # Configurable — can be overridden per request
    # ─────────────────────────────────────────────
    default_bbox_radius_km: float = 7.5

    # ─────────────────────────────────────────────
    # CORS
    # Origins allowed to call this API
    # In production replace * with actual frontend domain
    # ─────────────────────────────────────────────
    allowed_origins: list[str] = ["*"]

    # ─────────────────────────────────────────────
    # COUNTRY TILE SOURCES
    # Maps country codes to Martin tile source names
    # Used to determine which tile sources to return
    # for a given bounding box
    # ─────────────────────────────────────────────
    country_tile_sources: dict[str, str] = {
        "ET": "ethiopia",
        "KE": "kenya",
        "SO": "somalia",
        "SD": "sudan",
        "SS": "south_sudan",
        "DJ": "djibouti",
        "ER": "eritrea",
    }

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Single settings instance imported everywhere
settings = Settings()
