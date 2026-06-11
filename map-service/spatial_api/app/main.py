from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.db import engine, Base
from app.routers import map_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import models so Base knows about them
    from app.models import Building, ReportLocation, Zone, CrisisEvent  # noqa

    async with engine.begin() as conn:
        # Create tables only — indexes handled separately below
        # checkfirst=True skips tables that already exist
        await conn.run_sync(Base.metadata.create_all)

    # Create indexes in a separate connection using IF NOT EXISTS
    # This never fails on restart regardless of existing state
    async with engine.begin() as conn:
        for sql in [
            "CREATE INDEX IF NOT EXISTS idx_buildings_footprint ON buildings USING gist (footprint)",
            "CREATE INDEX IF NOT EXISTS idx_buildings_country_code ON buildings (country_code)",
            "CREATE INDEX IF NOT EXISTS idx_buildings_external_id ON buildings (external_id)",
            "CREATE INDEX IF NOT EXISTS idx_report_locations_location ON report_locations USING gist (location)",
            "CREATE INDEX IF NOT EXISTS idx_report_locations_damage_level ON report_locations (damage_level)",
            "CREATE INDEX IF NOT EXISTS idx_report_locations_crisis_type ON report_locations (crisis_type)",
            "CREATE INDEX IF NOT EXISTS idx_report_locations_infrastructure_type ON report_locations (infrastructure_type)",
            "CREATE INDEX IF NOT EXISTS idx_report_locations_created_at ON report_locations (created_at)",
            "CREATE INDEX IF NOT EXISTS idx_report_locations_is_duplicate ON report_locations (is_duplicate)",
            "CREATE INDEX IF NOT EXISTS idx_report_locations_is_flagged ON report_locations (is_flagged)",
            "CREATE INDEX IF NOT EXISTS idx_report_locations_building_id ON report_locations (building_id)",
            "CREATE INDEX IF NOT EXISTS idx_report_locations_crisis_event_id ON report_locations (crisis_event_id)",
            "CREATE INDEX IF NOT EXISTS idx_zones_boundary ON zones USING gist (boundary)",
            "CREATE INDEX IF NOT EXISTS idx_zones_country_code ON zones (country_code)",
            "CREATE INDEX IF NOT EXISTS idx_zones_assigned_to_user_id ON zones (assigned_to_user_id)",
            "CREATE INDEX IF NOT EXISTS idx_crisis_events_affected_area ON crisis_events USING gist (affected_area)",
            "CREATE INDEX IF NOT EXISTS idx_crisis_events_crisis_type ON crisis_events (crisis_type)",
            "CREATE INDEX IF NOT EXISTS idx_crisis_events_started_at ON crisis_events (started_at)",
        ]:
            await conn.execute(text(sql))

    yield
    await engine.dispose()


app = FastAPI(
    title="UNDP Crisis Map — Spatial API",
    description="Spatial data service for the UNDP damage reporting platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(map_router)


@app.get("/health")
async def health():
    return {"status": "ok"}