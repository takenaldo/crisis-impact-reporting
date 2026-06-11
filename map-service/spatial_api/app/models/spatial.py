# app/models/spatial.py
#
# SQLAlchemy ORM models for all spatial data.
# GeoAlchemy2 provides the geometry column types.
# Every geometry uses SRID 4326 (WGS84 — standard GPS coordinates).
#
# These are the four tables we designed in the PostGIS schema:
# Building, ReportLocation, Zone, CrisisEvent

from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Building(Base):
    """
    Building footprint polygons.

    Source: OSM or Microsoft GlobalML Building Footprints.
    Imported via the import script (scripts/import_buildings.py).

    The footprint column is a MultiPolygon because some buildings
    in OSM are represented as multiple polygons (buildings with
    courtyards, connected structures etc).
    MultiPolygon safely handles both single and multi cases.
    """

    __tablename__ = "buildings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # GeoAlchemy2 MultiPolygon column
    # geometry_type='MULTIPOLYGON' — enforces the geometry type at DB level
    # srid=4326 — WGS84, standard GPS coordinate system
    footprint: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326),
        nullable=False,
    )

    # 'osm' or 'microsoft'
    # Tracks data source for reliability assessment and future updates
    source: Mapped[str] = mapped_column(String(20), nullable=False)

    # Original ID from the data source
    # OSM way/relation ID or Microsoft building ID
    # Prevents duplicate imports on re-runs
    external_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Human readable name from OSM if available
    # Most buildings won't have this — nullable
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ISO 3166-1 alpha-2 country code
    # ET=Ethiopia, KE=Kenya, SO=Somalia, SD=Sudan,
    # SS=South Sudan, DJ=Djibouti, ER=Eritrea
    country_code: Mapped[str] = mapped_column(String(3), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationship — one building can have many report locations
    report_locations: Mapped[list["ReportLocation"]] = relationship(
        back_populates="building"
    )



class ReportLocation(Base):
    """
    Minimal spatial record for each report submitted via cir-backend.

    This is NOT the full report — that lives in cir-backend.
    This stores only what the map needs to display and query reports.

    When cir-backend receives a new report submission, it POSTs
    the spatial data to this service. We store it here in PostGIS
    so Martin can serve it as vector tiles and the map can display it.

    The id field matches the report ID in cir-backend — this is
    the link between the two services.
    """

    __tablename__ = "report_locations"

    # This ID is set by cir-backend — not auto-incremented here
    # It must match the report ID in cir-backend exactly
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=False)

    # Point geometry — exact location of the report
    # Point is used for proximity queries (faster than polygon centroid)
    # Even when a building footprint is selected, we store the centroid
    # as a Point for efficient spatial indexing
    location: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326),
        nullable=False,
    )

    # Damage level — drives map color coding
    # minimal=green, partial=orange, complete=red
    damage_level: Mapped[str] = mapped_column(String(20), nullable=False)

    # AI suggested damage level — stored separately
    # Never used as the authoritative value
    # Displayed as secondary indicator on map popup
    ai_suggested_damage_level: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )

    # Used for admin map filter panel
    crisis_type: Mapped[str] = mapped_column(String(50), nullable=False)
    infrastructure_type: Mapped[str] = mapped_column(String(50), nullable=False)

    # Map indicator flags
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False)

    # Reporter role — affects verification weight display on map
    # 'citizen' for Role 2, 'responder' for Role 3
    reporter_role: Mapped[str] = mapped_column(String(20), nullable=False)

    # Verification counts shown on map popup
    # Two separate counts — field responder verification
    # carries higher weight than citizen upvote
    citizen_verification_count: Mapped[int] = mapped_column(Integer, default=0)
    responder_verification_count: Mapped[int] = mapped_column(Integer, default=0)

    # FK to building — nullable because a report may come in
    # before the building footprint exists, or the user placed
    # a manual pin with no footprint match
    building_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("buildings.id", ondelete="SET NULL"), nullable=True
    )

    # FK to crisis event — nullable because reports flow in freely
    # Crisis events are assigned retrospectively by admins
    crisis_event_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("crisis_events.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    building: Mapped["Building | None"] = relationship(
        back_populates="report_locations"
    )
    crisis_event: Mapped["CrisisEvent | None"] = relationship(
        back_populates="report_locations"
    )



class Zone(Base):
    """
    Geographic zones assigned to Role 3 field responders.

    Used for:
    1. Scoping the field responder map view to their assigned area
    2. Rendering zone boundary overlays on the admin map
    3. Point-in-polygon check: is this user's GPS inside their zone?
    """

    __tablename__ = "zones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Zone boundary as a Polygon
    # Why Polygon not MultiPolygon:
    # Zones are admin-defined — always a single continuous area
    boundary: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POLYGON", srid=4326),
        nullable=False,
    )

    # ID of the Role 3 user this zone is assigned to
    # References the user in cir-backend's auth system
    # Nullable — a zone may exist before a responder is assigned
    assigned_to_user_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    country_code: Mapped[str] = mapped_column(String(3), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )



class CrisisEvent(Base):
    """
    A named crisis event created by Role 1 admins.

    Reports are not gated by crisis events — they flow in freely.
    Crisis events are a retrospective admin tool for grouping reports
    by geography + crisis type + time window.

    The affected_area polygon is used to:
    1. Group reports that fall within this area
    2. Filter reports on the admin map by crisis event
    """

    __tablename__ = "crisis_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    crisis_type: Mapped[str] = mapped_column(String(50), nullable=False)

    # Geographic boundary of this crisis event
    # Reports within this polygon + time window are associated
    # with this crisis event
    affected_area: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POLYGON", srid=4326),
        nullable=False,
    )

    # Time window for grouping reports
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # ID of the Role 1 admin who created this event
    # References user in cir-backend's auth system
    created_by_user_id: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationship
    report_locations: Mapped[list["ReportLocation"]] = relationship(
        back_populates="crisis_event"
    )