# app/db.py
#
# Database engine and session setup.
#
# SQLAlchemy 2.0 async pattern:
# - create_async_engine: creates the connection pool
# - AsyncSession: the session used in each request
# - get_db: FastAPI dependency that provides a session
#   per request and closes it when the request is done

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


# ─────────────────────────────────────────────
# ENGINE
# The connection pool to PostgreSQL.
# echo=False in production — set to True temporarily
# if you want to see the raw SQL queries in logs
# pool_pre_ping=True: tests connections before using them
# prevents errors from stale connections
# ─────────────────────────────────────────────
engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
)

# ─────────────────────────────────────────────
# SESSION FACTORY
# Creates AsyncSession instances.
# expire_on_commit=False: keeps model attributes
# accessible after a commit without re-querying
# ─────────────────────────────────────────────
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ─────────────────────────────────────────────
# BASE CLASS
# All SQLAlchemy models inherit from this.
# DeclarativeBase is the SQLAlchemy 2.0 way
# of defining the base for ORM models.
# ─────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ─────────────────────────────────────────────
# DEPENDENCY
# Used in FastAPI route handlers as:
#   async def my_route(db: AsyncSession = Depends(get_db)):
# Opens a session for the request, yields it,
# then closes it when the request finishes.
# If an exception occurs, the session is still closed.
# ─────────────────────────────────────────────
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
