# app/routers/map.py
#
# All map-related API endpoints.
# These are called by:
#   - React frontend (bbox, buildings, zones)
#   - cir-backend (report locations, crisis events)

import json
import math

from fastapi import APIRouter, Depends, HTTPException, Query
from geoalchemy2.functions import ST_AsGeoJSON, ST_Intersects, ST_MakeEnvelope, ST_Within
from geoalchemy2.shape import from_shape
from shapely.geometry import Point, shape
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_db
from app.models.spatial import Building, CrisisEvent, ReportLocation, Zone
from app.schemas.spatial import (
    BBoxRequest,
    BBoxResponse,
    BBoxBounds,
    BuildingResponse,
    CrisisEventRequest,
    CrisisEventResponse,
    ReportLocationRequest,
    ReportLocationResponse,
    TileSource,
    ZoneResponse,
)

router = APIRouter(prefix="/api/map", tags=["map"])


# ─────────────────────────────────────────────
# HELPER: CALCULATE BOUNDING BOX
#
# Converts a GPS point + radius in km
# into a bounding box (min_lng, min_lat, max_lng, max_lat)
#
# How it works:
# 1 degree of latitude = ~111km everywhere
# 1 degree of longitude = ~111km * cos(latitude)
# (longitude degrees get smaller as you move toward the poles)
#
# We divide radius_km by these values to get
# the degree offset in each direction
# ─────────────────────────────────────────────
def calculate_bbox(lat: float, lng: float, radius_km: float) -> BBoxBounds:
    # Latitude offset — same everywhere
    lat_offset = radius_km / 111.0

    # Longitude offset — varies by latitude
    # cos() expects radians, math.radians() converts degrees to radians
    lng_offset = radius_km / (111.0 * math.cos(math.radians(lat)))

    return BBoxBounds(
        min_lng=lng - lng_offset,
        min_lat=lat - lat_offset,
        max_lng=lng + lng_offset,
        max_lat=lat + lat_offset,
    )


# ─────────────────────────────────────────────
# HELPER: DETERMINE TILE SOURCES FOR BBOX
#
# Given a bounding box, returns which country
# tile sources from Martin overlap with it.
#
# This handles the border case — if a user is
# at the Ethiopia-Kenya border, both sources
# are returned so MapLibre requests tiles from both.
#
# Country bounding boxes (approximate natural bounds):
# Used to check which countries overlap with the user's bbox
# ─────────────────────────────────────────────
COUNTRY_BOUNDS = {
    "ET": {"min_lng": 33.0, "min_lat": 3.4,  "max_lng": 47.9, "max_lat": 14.9},
    "KE": {"min_lng": 33.9, "min_lat": -4.7, "max_lng": 41.9, "max_lat": 5.0},
    "SO": {"min_lng": 40.9, "min_lat": -1.7, "max_lng": 51.4, "max_lat": 12.0},
    "SD": {"min_lng": 21.8, "min_lat": 8.7,  "max_lng": 38.6, "max_lat": 22.2},
    "SS": {"min_lng": 24.1, "min_lat": 3.5,  "max_lng": 35.9, "max_lat": 12.2},
    "DJ": {"min_lng": 41.7, "min_lat": 10.9, "max_lng": 43.4, "max_lat": 12.7},
    "ER": {"min_lng": 36.4, "min_lat": 12.4, "max_lng": 43.1, "max_lat": 18.0},
}


def get_tile_sources_for_bbox(bbox: BBoxBounds) -> list[TileSource]:
    """
    Returns tile source URLs for all countries that overlap
    with the given bounding box.
    """
    sources = []

    for country_code, bounds in COUNTRY_BOUNDS.items():
        # Check if bbox overlaps with this country's bounds
        # Two rectangles overlap if neither is completely outside the other
        overlaps = (
            bbox.min_lng <= bounds["max_lng"]
            and bbox.max_lng >= bounds["min_lng"]
            and bbox.min_lat <= bounds["max_lat"]
            and bbox.max_lat >= bounds["min_lat"]
        )

        if overlaps:
            source_name = settings.country_tile_sources.get(country_code)
            if source_name:
                sources.append(
                    TileSource(
                        name=source_name,
                        url=f"{settings.martin_url}/{source_name}/{{z}}/{{x}}/{{y}}",
                    )
                )

    return sources


# ─────────────────────────────────────────────
# ENDPOINT 1: BBOX
# POST /api/map/bbox/
#
# Called by React client on map load.
# Receives GPS coordinates, returns:
# - Bounding box
# - Tile source URLs from Martin
# - Building footprint URL
# - Zoom range
# ─────────────────────────────────────────────
@router.post("/bbox/", response_model=BBoxResponse)
async def get_bbox(request: BBoxRequest):
    radius = request.radius_km or settings.default_bbox_radius_km
    bbox = calculate_bbox(request.latitude, request.longitude, radius)
    tile_sources = get_tile_sources_for_bbox(bbox)

    return BBoxResponse(
        bbox=bbox,
        tile_sources=tile_sources,
        building_footprints_url=f"{settings.martin_url}/buildings/{{z}}/{{x}}/{{y}}",
        zoom_range={"min": 10, "max": 16},
    )


# ─────────────────────────────────────────────
# ENDPOINT 2: BUILDINGS
# GET /api/map/buildings/?min_lng=...&min_lat=...&max_lng=...&max_lat=...
#
# Returns building footprints as GeoJSON
# for a given bounding box.
#
# Used by the citizen map to render the interactive
# building selection layer.
#
# Note: At high zoom levels Martin serves buildings
# directly as vector tiles. This endpoint is used
# for lower zoom levels and for the building selector
# interaction layer.
# ─────────────────────────────────────────────
@router.get("/buildings/", response_model=list[BuildingResponse])
async def get_buildings(
    min_lng: float = Query(...),
    min_lat: float = Query(...),
    max_lng: float = Query(...),
    max_lat: float = Query(...),
    db: AsyncSession = Depends(get_db),
):
    # ST_MakeEnvelope creates a PostGIS bounding box rectangle
    # from four coordinates + SRID
    # ST_Intersects returns buildings whose footprint
    # intersects with this rectangle
    # This uses the spatial GIST index we defined on footprint
    result = await db.execute(
        select(
            Building.id,
            Building.name,
            Building.country_code,
            ST_AsGeoJSON(Building.footprint).label("footprint_geojson"),
        ).where(
            ST_Intersects(
                Building.footprint,
                ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326),
            )
        )
    )

    buildings = result.fetchall()

    return [
        BuildingResponse(
            id=b.id,
            footprint_geojson=json.loads(b.footprint_geojson),
            name=b.name,
            country_code=b.country_code,
        )
        for b in buildings
    ]


# ─────────────────────────────────────────────
# ENDPOINT 3: ZONE FOR USER
# GET /api/map/zones/{user_id}/
#
# Returns the zone boundary for a Role 3 field responder.
# Used to:
# 1. Scope the responder's map view to their assigned area
# 2. Calculate the bounding box for tile pre-fetch
#    (instead of GPS radius, use zone boundary extent)
# ─────────────────────────────────────────────
@router.get("/zones/{user_id}/", response_model=ZoneResponse)
async def get_zone_for_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            Zone.id,
            Zone.name,
            Zone.country_code,
            ST_AsGeoJSON(Zone.boundary).label("boundary_geojson"),
        ).where(Zone.assigned_to_user_id == user_id)
    )

    zone = result.fetchone()

    if not zone:
        raise HTTPException(
            status_code=404,
            detail=f"No zone found for user {user_id}",
        )

    return ZoneResponse(
        id=zone.id,
        name=zone.name,
        boundary_geojson=json.loads(zone.boundary_geojson),
        country_code=zone.country_code,
    )


# ─────────────────────────────────────────────
# ENDPOINT 4: CREATE REPORT LOCATION
# POST /api/map/reports/
#
# Called by cir-backend when a new report is submitted.
# Stores the minimal spatial data the map needs.
# ─────────────────────────────────────────────
@router.post("/reports/", response_model=ReportLocationResponse, status_code=201)
async def create_report_location(
    request: ReportLocationRequest,
    db: AsyncSession = Depends(get_db),
):
    # Check if report location already exists (idempotent)
    existing = await db.get(ReportLocation, request.id)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Report location with id {request.id} already exists",
        )

    # from_shape converts a Shapely geometry to a GeoAlchemy2 geometry
    # Point(longitude, latitude) — note: longitude first, then latitude
    # This is the GeoJSON convention (x, y = lng, lat)
    point = from_shape(
        Point(request.longitude, request.latitude),
        srid=4326,
    )

    report_location = ReportLocation(
        id=request.id,
        location=point,
        damage_level=request.damage_level,
        ai_suggested_damage_level=request.ai_suggested_damage_level,
        crisis_type=request.crisis_type,
        infrastructure_type=request.infrastructure_type,
        reporter_role=request.reporter_role,
        building_id=request.building_id,
        crisis_event_id=request.crisis_event_id,
    )

    db.add(report_location)
    await db.commit()
    await db.refresh(report_location)

    return ReportLocationResponse(
        id=report_location.id,
        latitude=request.latitude,
        longitude=request.longitude,
        damage_level=report_location.damage_level,
        building_id=report_location.building_id,
        created_at=report_location.created_at,
    )


# ─────────────────────────────────────────────
# ENDPOINT 5: CREATE CRISIS EVENT
# POST /api/map/crisis-events/
#
# Called by cir-backend when a Role 1 admin
# creates a new crisis event on the admin map.
# ─────────────────────────────────────────────
@router.post("/crisis-events/", response_model=CrisisEventResponse, status_code=201)
async def create_crisis_event(
    request: CrisisEventRequest,
    db: AsyncSession = Depends(get_db),
):
    # Convert GeoJSON polygon to GeoAlchemy2 geometry
    # shape() converts GeoJSON dict to Shapely geometry
    # from_shape() converts Shapely to GeoAlchemy2
    polygon = from_shape(
        shape(request.affected_area_geojson),
        srid=4326,
    )

    crisis_event = CrisisEvent(
        name=request.name,
        crisis_type=request.crisis_type,
        affected_area=polygon,
        started_at=request.started_at,
        ended_at=request.ended_at,
        created_by_user_id=request.created_by_user_id,
    )

    db.add(crisis_event)
    await db.commit()
    await db.refresh(crisis_event)

    return CrisisEventResponse(
        id=crisis_event.id,
        name=crisis_event.name,
        crisis_type=crisis_event.crisis_type,
        affected_area_geojson=request.affected_area_geojson,
        started_at=crisis_event.started_at,
        ended_at=crisis_event.ended_at,
        created_at=crisis_event.created_at,
    )


# ─────────────────────────────────────────────
# ENDPOINT 6: GET CRISIS EVENTS
# GET /api/map/crisis-events/
#
# Returns all crisis events for admin map filtering
# ─────────────────────────────────────────────
@router.get("/crisis-events/", response_model=list[CrisisEventResponse])
async def get_crisis_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            CrisisEvent.id,
            CrisisEvent.name,
            CrisisEvent.crisis_type,
            CrisisEvent.started_at,
            CrisisEvent.ended_at,
            CrisisEvent.created_at,
            ST_AsGeoJSON(CrisisEvent.affected_area).label("affected_area_geojson"),
        )
    )

    events = result.fetchall()

    return [
        CrisisEventResponse(
            id=e.id,
            name=e.name,
            crisis_type=e.crisis_type,
            affected_area_geojson=json.loads(e.affected_area_geojson),
            started_at=e.started_at,
            ended_at=e.ended_at,
            created_at=e.created_at,
        )
        for e in events
    ]
