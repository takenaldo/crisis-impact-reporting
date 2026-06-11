FROM python:3.12-slim

# Install system dependencies required by GeoAlchemy2/PostGIS
# libgdal-dev: GDAL library for geometry processing
# libgeos-dev: GEOS library for spatial operations
# These are required by Shapely which GeoAlchemy2 depends on
RUN apt-get update && apt-get install -y \
    libgdal-dev \
    libgeos-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run with uvicorn
# --host 0.0.0.0: listen on all interfaces (required in Docker)
# --port 8001: different from cir-backend which runs on 8000
# --reload: auto-reload on code changes (development only)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8009", "--reload"]