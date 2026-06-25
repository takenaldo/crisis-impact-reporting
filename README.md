# Crisis Impact Reporting (CIR)

A field-ready web application for reporting and mapping infrastructure damage during crisis events. Reporters can submit geo-located damage assessments with photos, map annotations, and structured severity data. A live dashboard shows all reports on an interactive map for situational awareness.

---

## Overview

CIR is built for use in the field during natural disasters, industrial accidents, and human-made crises. It supports both authenticated and anonymous reporting, works on mobile browsers, and is available in 7 languages.

**Crisis categories supported:**
- Natural Hazards
- Technological / Industrial Hazards
- Human-Made Crisis

**Infrastructure damage fields:**
- Damage severity (None / Minimal / Partial / Complete)
- Electricity condition
- Health services status
- Debris presence
- Pressing needs (free text)
- Photos with EXIF data
- GeoJSON map annotations (polygon, radius, point, direction)

---

## Architecture

```
crisis-impact-reporting/
├── cir-frontend/     # React 19 SPA
├── cir-backend/      # Django 5 + DRF + Django Channels
└── map-service/      # Spatial API (PostGIS / tile service)
```

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Mantine v9 | Component library |
| React Leaflet + Leaflet | Interactive maps |
| react-i18next | Internationalization |
| Axios | HTTP client |
| Recharts | Data visualizations |
| @react-pdf/renderer | PDF report export |
| react-webcam | In-browser photo capture |

### Backend

| Technology | Purpose |
|---|---|
| Django 5.2 | Web framework |
| Django REST Framework | REST API |
| Django Channels + Daphne | WebSocket / ASGI server |
| SimpleJWT | JWT authentication |
| drf_spectacular | OpenAPI schema generation |
| SQLite | Database (development) |

---

## Features

- **Interactive map dashboard** — browse all submitted impact reports on a Leaflet map with clustering and filtering
- **Impact report form** — structured form with GPS auto-detection, manual pin placement, and damage fields
- **Map annotations** — draw polygons, radii, points, and direction indicators directly on the map and attach them to a report
- **Photo capture** — upload images or use the device camera; EXIF data is preserved
- **Anonymous reporting** — users without an account get an auto-generated pseudonym
- **Real-time updates** — WebSocket channel pushes new reports to connected dashboards instantly
- **Survey/questions system** — location-aware follow-up questions linked to impact reports
- **Admin dashboard** — internal view for managing reports, users, and question groups
- **PDF export** — generate a printable summary of any impact report
- **Multi-language** — English, Arabic (ar), Amharic (am), Chinese (ch), Spanish (es), French (fr), Russian (ru)

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- pip / virtualenv

### Backend

```bash
cd cir-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The backend runs on `http://localhost:8000`. Django admin is at `/backend/admin/`.

### Frontend

```bash
cd cir-frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000`.

To point the frontend at a different backend, edit [cir-frontend/src/constants.js](cir-frontend/src/constants.js):

```js
export const SERVER_IP = "http://localhost:8000"
```

### Docker (frontend only)

```bash
docker-compose up
```

---

## API Reference

The backend exposes a REST API under `/backend/api/` and an auto-generated OpenAPI schema.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login/` | Obtain JWT access + refresh tokens |
| POST | `/api/token/refresh/` | Refresh an access token |
| CRUD | `/api/impact-reports/` | Impact reports |
| CRUD | `/api/user/` | User management |
| CRUD | `/api/questions/` | Survey questions |
| CRUD | `/api/answers/` | Survey answers |
| GET | `/api/map/bbox/` | Reports within a bounding box |

Interactive API docs (Swagger UI) are available at `/backend/api/schema/swagger-ui/`.

### WebSocket

The backend uses Django Channels. Clients connect to receive real-time report updates pushed to the group channel layer.

---

## Frontend Routes

| Path | Component | Description |
|---|---|---|
| `/` | SplashScreen | Landing / entry point |
| `/home` | CrisisReportingApp | Map dashboard with all reports |
| `/add-report/:id?/:name?` | ImpactReportForm | Submit or edit an impact report |
| `/login/` | LoginPage | Authentication |
| `/admin` | CrisisImpactAdminDashboard | Internal admin UI |
| `/auth_check/` | CIRAuthChecker | Auth validation redirect |

---

## Data Model (key entities)

- **ImpactReport** — core report: infrastructure details, damage severity, electricity/health status, debris, photos, GeoJSON annotations, quality score
- **InfrastructureLocation** — dual-location model: where the reporter was standing vs. where the damaged infrastructure is, with distance and bearing
- **CIRUser** — extended Django user with job title, organization, and auto-generated pseudonym for anonymous display
- **QuestionGroup** — location + time-bounded set of survey questions auto-assigned to nearby reporters
- **Photo** — uploaded image with EXIF data

---

## Internationalization

Translation files live in [cir-frontend/src/locales/](cir-frontend/src/locales/). Each subdirectory is an ISO 639-1 language code (`en`, `ar`, `am`, `ch`, `es`, `fr`, `ru`). Add a new language by copying the `en` folder and translating the JSON values.
