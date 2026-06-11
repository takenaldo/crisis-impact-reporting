# app/schemas/spatial.py
#
# Pydantic models for request validation and response serialization.
# These are separate from the SQLAlchemy ORM models.
#
# Naming convention:
#   *Request  — data coming IN to the API
#   *Response — data going OUT from the API

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ─────────────────────────────────────────────
# BBOX ENDPOINT SCHEMAS
# POST /api/map/bbox/
# Citizen/Responder sends GPS coordinates,
# gets back bounding box + tile server URLs
# ─────────────────────────────────────────────

class BBoxRequest(BaseModel):
    """
    Sent by the React client when the map loads.
    Contains the user's GPS coordinates and optionally
    a custom radius override.
    """
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    # Optional radius override — defaults to settings.default_bbox_radius_km
    radius_km: float | None = Field(None, gt=0, le=50)


class BBoxBounds(BaseModel):
    """
    The calculated bounding box returned to the client.
    Client uses this to pre-fetch tiles from Martin.
    """
    min_lng: float
    min_lat: float
    max_lng: float
    max_lat: float


class TileSource(BaseModel):
    """
    A single tile source URL for one country.
    MapLibre uses {z}/{x}/{y} placeholders natively.
    """
    name: str
    url: str


class BBoxResponse(BaseModel):
    """
    Full response to the client on map load.
    Contains everything MapLibre needs to start
    pre-fetching and rendering tiles.
    """
    bbox: BBoxBounds
    # List of tile sources that intersect this bbox
    # Usually 1 country, occasionally 2 at borders
    tile_sources: list[TileSource]
    # Building footprint tile URL from Martin (PostGIS source)
    building_footprints_url: str
    # Zoom range to pre-fetch
    zoom_range: dict[str, int] = {"min": 10, "max": 16}


# ─────────────────────────────────────────────
# REPORT LOCATION SCHEMAS
# POST /api/map/reports/
# Called by cir-backend when a new report is submitted
# ─────────────────────────────────────────────

class ReportLocationRequest(BaseModel):
    """
    Sent by cir-backend when a new report is submitted.
    Contains only the spatial + display data the map needs.
    The full report lives in cir-backend.
    """
    # Must match the report ID in cir-backend exactly
    id: int
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    damage_level: str = Field(..., pattern="^(minimal|partial|complete)$")
    ai_suggested_damage_level: str | None = Field(
        None, pattern="^(minimal|partial|complete)$"
    )
    crisis_type: str
    infrastructure_type: str
    reporter_role: str = Field(..., pattern="^(citizen|responder)$")
    building_id: int | None = None
    crisis_event_id: int | None = None


class ReportLocationResponse(BaseModel):
    """
    Returned after a report location is stored.
    Confirms storage and returns the ID.
    """
    id: int
    latitude: float
    longitude: float
    damage_level: str
    building_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# BUILDING SCHEMAS
# GET /api/map/buildings/?bbox=...
# Returns building footprints as GeoJSON
# for the MapLibre interactive layer
# ─────────────────────────────────────────────

class BuildingResponse(BaseModel):
    """
    Single building footprint returned to the client.
    footprint_geojson is the GeoJSON representation
    of the MultiPolygon geometry — MapLibre renders this directly.
    """
    id: int
    footprint_geojson: dict[str, Any]
    name: str | None
    country_code: str
    # Latest damage level for this building
    # None if no reports exist for this building
    latest_damage_level: str | None = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# ZONE SCHEMAS
# GET /api/map/zones/{user_id}/
# Returns the zone boundary for a Role 3 user
# Used to scope the responder map view
# ─────────────────────────────────────────────

class ZoneResponse(BaseModel):
    """
    Zone boundary returned to the client.
    boundary_geojson is the GeoJSON Polygon —
    MapLibre renders this as the zone overlay.
    """
    id: int
    name: str
    boundary_geojson: dict[str, Any]
    country_code: str

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# CRISIS EVENT SCHEMAS
# POST /api/map/crisis-events/
# GET /api/map/crisis-events/
# Created by Role 1 admins, used for admin map filtering
# ─────────────────────────────────────────────

class CrisisEventRequest(BaseModel):
    """
    Sent by cir-backend when a Role 1 admin creates a crisis event.
    The affected_area is a GeoJSON Polygon defining
    the geographic boundary of this crisis.
    """
    name: str
    crisis_type: str
    # GeoJSON Polygon — drawn by admin on the map
    affected_area_geojson: dict[str, Any]
    started_at: datetime
    ended_at: datetime | None = None
    created_by_user_id: int


class CrisisEventResponse(BaseModel):
    id: int
    name: str
    crisis_type: str
    affected_area_geojson: dict[str, Any]
    started_at: datetime
    ended_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
