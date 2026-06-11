# UNDP Damage Reporting — Tile Pipeline Setup

## What this does
Two jobs:
1. **One-time setup**: Converts .pbf files into .mbtiles files using Planetiler
2. **Permanent tile serving**: Martin serves those tiles to the React frontend

---

## Directory structure

```
tile-pipeline/
├── docker-compose.yml       
├── config/
│   └── martin.yaml          
├── data/
│   ├── pbf/                 ← PUT YOUR .pbf FILES HERE
│   └── tiles/               ← .mbtiles files written here automatically
└── README.md                
```

---

## Step 1 — Place your .pbf files

Copy your Geofabrik files into `data/pbf/`. Files must be named exactly:

```
data/pbf/ethiopia-latest.osm.pbf
data/pbf/kenya-latest.osm.pbf
data/pbf/somalia-latest.osm.pbf
data/pbf/sudan-latest.osm.pbf
data/pbf/south-sudan-latest.osm.pbf
data/pbf/djibouti-latest.osm.pbf
data/pbf/eritrea-latest.osm.pbf
```

---

## Step 2 — Create data directories

```bash
mkdir -p data/pbf data/tiles
```

---

## Step 3 — Allocate RAM to Docker

Planetiler needs RAM to process large countries.
In Docker Desktop → Settings → Resources → Memory: set to at least 6GB.

Ethiopia alone needs ~2-4GB during processing.

---

## Step 4 — Run Planetiler per country (one time only)

Run one command per country. Each takes several minutes.
They can be run one at a time — you do not need to run all at once.

```bash
docker compose --profile setup run --rm planetiler-ethiopia
docker compose --profile setup run --rm planetiler-kenya
docker compose --profile setup run --rm planetiler-somalia
docker compose --profile setup run --rm planetiler-sudan
docker compose --profile setup run --rm planetiler-south-sudan
docker compose --profile setup run --rm planetiler-djibouti
docker compose --profile setup run --rm planetiler-eritrea
```

Each command:
- Reads the .pbf file from data/pbf/
- Generates tiles for zoom levels 10-16
- Applies ~15km overlap buffer at country borders
- Writes one .mbtiles file to data/tiles/
- Exits when done

When a country finishes you will see output ending with something like:
```
Finished in 4m 32s
```

---

## Step 5 — Start Martin tile server

```bash
docker compose up martin db
```

Martin is now running at http://localhost:3000

---

## Step 6 — Verify Martin is working

Check all available tile sources:
```
http://localhost:3000/catalog
```

This returns JSON listing every tile source Martin is serving.
You should see ethiopia, kenya, somalia, sudan, south_sudan, djibouti, eritrea listed.

---

## Step 7 — What Django returns to the client on map load

```json
{
  "bbox": {
    "min_lng": 36.5,
    "min_lat": 8.5,
    "max_lng": 37.5,
    "max_lat": 9.5
  },
  "tile_sources": {
    "ethiopia": "http://localhost:3000/ethiopia/{z}/{x}/{y}",
    "kenya": "http://localhost:3000/kenya/{z}/{x}/{y}"
  },
  "building_footprints": "http://localhost:3000/buildings/{z}/{x}/{y}",
  "zoom_range": { "min": 10, "max": 16 }
}
```

The client uses this to pre-fetch and cache tiles in IndexedDB.

---

## Adding a new country later

1. Download .pbf from https://download.geofabrik.de → place in data/pbf/
2. Add a new planetiler service in docker-compose.yml (copy any existing one, update name/path/bounds)
3. Add new entry in config/martin.yaml under mbtiles
4. Run: `docker compose --profile setup run --rm planetiler-{newcountry}`
5. Restart Martin: `docker compose restart martin`

---

## Environment variables

Update the database connection in docker-compose.yml:
```
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@db:5432/YOUR_DB_NAME
```
Must match your Django database settings exactly.

---

## Notes

- If a country fails with out-of-memory, increase `JAVA_TOOL_OPTIONS: "-Xmx4g"` to `-Xmx6g` for that country
- Martin is lightweight — runs on ~512MB RAM
- The `data/` folder is a bind mount — files persist on your local machine
- PostGIS here is shared with Django. If Django has its own PostGIS, remove the `db` service and update DATABASE_URL