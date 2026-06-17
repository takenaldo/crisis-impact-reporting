import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapContainer, TileLayer, LayersControl, ZoomControl,
  useMap, useMapEvents, Marker, CircleMarker,
} from 'react-leaflet';
import L from 'leaflet';
import { ActionIcon, Box, Paper, Stack, Text, Tooltip } from '@mantine/core';
import {
  IconCircle, IconCurrentLocation, IconMapPin,
  IconNavigation, IconPolygon, IconTrash,
} from '@tabler/icons-react';
import useAnnotationTools, { TOOLS } from './hooks/useAnnotationTools';

// ── Fix Leaflet default icon in webpack/CRA ────────────────────────────────
import markerIconPng    from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowPng  from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadowPng,
});

// ── Constants ──────────────────────────────────────────────────────────────
const COLORS = {
  polygon:   '#f97316',
  radius:    '#3b82f6',
  point:     '#ef4444',
  direction: '#8b5cf6',
  position:  '#22c55e',
};

const DAMAGE_COLORS = {
  minimal:  '#22c55e',
  partial:  '#f97316',
  complete: '#ef4444',
};

const ESRI_SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const MAX_POSITION_RADIUS = 2000; // metres

// Inject animation CSS once globally
function ensureStyles() {
  if (document.getElementById('cir-map-styles')) return;
  const s = document.createElement('style');
  s.id = 'cir-map-styles';
  s.textContent = `
    @keyframes cir-pulse {
      0%   { transform:translate(-50%,-50%) scale(0.5); opacity:0.8; }
      100% { transform:translate(-50%,-50%) scale(2.5); opacity:0; }
    }
    .cir-pos-wrap  { position:relative; width:36px; height:36px; }
    .cir-pos-dot   {
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%);
      width:14px; height:14px; background:${COLORS.position};
      border:3px solid #fff; border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,.3);
    }
    .cir-pulse-ring {
      position:absolute; top:50%; left:50%;
      width:30px; height:30px; border-radius:50%;
      border:2.5px solid ${COLORS.position};
      animation:cir-pulse 2s ease-out infinite;
    }
    .cir-pulse-ring:nth-child(2){ animation-delay:1s; }
    @keyframes cir-dash { to { stroke-dashoffset:-16; } }
    .cir-dir-animated { stroke-dasharray:6 4; animation:cir-dash .4s linear infinite; }
  `;
  document.head.appendChild(s);
}

// ── Geo helpers ────────────────────────────────────────────────────────────
function distanceMeters(a, b) {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
    Math.cos((b[0] * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function bearingDegrees(from, to) {
  const lat1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[0]   * Math.PI) / 180;
  const dLng = ((to[1] - from[1]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function arrowHeadIcon(bearing) {
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            style="transform:rotate(${bearing}deg);display:block">
            <polygon points="12,2 22,22 12,16 2,22" fill="${COLORS.direction}"/>
           </svg>`,
    iconSize:   [24, 24],
    iconAnchor: [12, 12],
  });
}

function positionIcon() {
  return L.divIcon({
    className: '',
    html: `<div class="cir-pos-wrap">
             <div class="cir-pulse-ring"></div>
             <div class="cir-pulse-ring"></div>
             <div class="cir-pos-dot"></div>
           </div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
  });
}

// ── MapController: syncs reactive props to the Leaflet map ─────────────────
function MapController({ center, zoom, maxBounds, minZoom, onMapReady, onRecenter }) {
  const map = useMap();
  const prevRef = useRef(null);

  useEffect(() => { if (onMapReady) onMapReady(map); }, []); // eslint-disable-line

  useEffect(() => {
    if (!center) return;
    const key = center.join(',');
    if (prevRef.current === key) return;
    prevRef.current = key;
    map.flyTo(center, zoom ?? 16, { duration: 1 });
  }, [center, zoom, map]);

  useEffect(() => {
    if (maxBounds) map.setMaxBounds(maxBounds);
  }, [maxBounds, map]);

  useEffect(() => {
    map.setMinZoom(minZoom ?? 2);
  }, [minZoom, map]);

  useEffect(() => {
    if (!onRecenter || !center) return;
    onRecenter(() => map.flyTo(center, zoom ?? 16, { duration: 0.8 }));
  }, [center, zoom, map, onRecenter]);

  return null;
}

// ── AutoLocate: GPS on mount, drives center + userLocation ─────────────────
function AutoLocate({ onLocated }) {
  const map = useMap();
  useEffect(() => {
    const onFound = (e) => {
      map.flyTo(e.latlng, 15, { duration: 1 });
      if (onLocated) onLocated({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    };
    map.on('locationfound', onFound);
    map.locate({ setView: false });
    return () => map.off('locationfound', onFound);
  }, [map, onLocated]);
  return null;
}

// ── LocationPicker: tap to pin, writes into Mantine form ──────────────────
function LocationPicker({ form, onPinChanged }) {
  const [pin, setPin] = useState(null);
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPin([lat, lng]);
      if (form) {
        form.setFieldValue('infrastructure_latitude',  lat);
        form.setFieldValue('infrastructure_longitude', lng);
      }
      if (onPinChanged) onPinChanged({ lat, lng });
    },
  });
  return pin ? <Marker position={pin} /> : null;
}

// ── ReportMarkers: colored circles for damage reports ─────────────────────
function ReportMarkers({ reports }) {
  if (!reports?.length) return null;
  return reports.map((r) => (
    <CircleMarker
      key={r.id}
      center={[r.latitude, r.longitude]}
      radius={10}
      pathOptions={{
        color: '#fff',
        weight: 2,
        fillColor: DAMAGE_COLORS[r.damage_level] || '#aaaaaa',
        fillOpacity: 1,
      }}
    />
  ));
}

// ── AnnotationLayer: all drawing tools, imperative Leaflet ────────────────
function AnnotationLayer({
  activeTool,
  onToolDone,
  userLocation,
  correctedPosition,
  setIncidentPolygon,
  setEffectRadius,
  setIncidentPoint,
  setDirectionBearing,
  setCorrectedPosition,
  polygonVertices,
  onClearLayers,
}) {
  const map = useMap();

  // Persistent layer refs
  const lr = useRef({
    polygon:       null,
    previewLine:   null,
    circle:        null,
    circlePreview: null,
    point:         null,
    dirLine:       null,
    dirHead:       null,
    posMarker:     null,
  });

  // Persistent event handler refs
  const hr = useRef({ click: null, mousemove: null, dblclick: null });
  // Keep latest userLocation accessible inside stale closures
  const userLocationRef = useRef(userLocation);
  useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);

  const drop = useCallback((key) => {
    if (lr.current[key]) { lr.current[key].remove(); lr.current[key] = null; }
  }, []);

  const cleanupEvents = useCallback(() => {
    const h = hr.current;
    if (h.click)    { map.off('click',    h.click);    h.click    = null; }
    if (h.mousemove){ map.off('mousemove',h.mousemove); h.mousemove = null; }
    if (h.dblclick) { map.off('dblclick', h.dblclick); h.dblclick  = null; }
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.getContainer().style.cursor = '';
  }, [map]);

  // Expose clear-all to parent via callback
  useEffect(() => {
    if (!onClearLayers) return;
    onClearLayers(() => {
      cleanupEvents();
      Object.keys(lr.current).filter((k) => k !== 'posMarker').forEach(drop);
      // Reset position marker back to original GPS location
      const loc = userLocationRef.current;
      if (lr.current.posMarker && loc) {
        lr.current.posMarker.setLatLng([loc.latitude, loc.longitude]);
      }
    });
  }, [onClearLayers, cleanupEvents, drop]);

  // ── POLYGON ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTool !== TOOLS.POLYGON) return;
    cleanupEvents();
    polygonVertices.current = [];
    drop('polygon'); drop('previewLine');
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.getContainer().style.cursor = 'crosshair';

    const onClick = (e) => {
      const pt = [e.latlng.lat, e.latlng.lng];
      polygonVertices.current = [...polygonVertices.current, pt];
      drop('previewLine');
      if (polygonVertices.current.length >= 2) {
        lr.current.previewLine = L.polyline(polygonVertices.current, {
          color: COLORS.polygon, weight: 2, dashArray: '6 4',
        }).addTo(map);
      }
    };

    const onMove = (e) => {
      if (!polygonVertices.current.length) return;
      drop('previewLine');
      lr.current.previewLine = L.polyline(
        [...polygonVertices.current, [e.latlng.lat, e.latlng.lng]],
        { color: COLORS.polygon, weight: 2, dashArray: '6 4' }
      ).addTo(map);
    };

    const onDbl = (e) => {
      e.originalEvent?.preventDefault();
      if (polygonVertices.current.length < 3) return;
      drop('previewLine');
      drop('polygon');
      lr.current.polygon = L.polygon(polygonVertices.current, {
        color: COLORS.polygon, fillColor: COLORS.polygon, fillOpacity: 0.25, weight: 2.5,
      }).addTo(map);
      // Store as GeoJSON (lng, lat for GeoJSON spec)
      const coords = polygonVertices.current.map(([lat, lng]) => [lng, lat]);
      setIncidentPolygon({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[...coords, coords[0]]] },
      });
      polygonVertices.current = [];
      cleanupEvents();
      onToolDone();
    };

    hr.current.click    = onClick;
    hr.current.mousemove = onMove;
    hr.current.dblclick  = onDbl;
    map.on('click',    onClick);
    map.on('mousemove', onMove);
    map.on('dblclick',  onDbl);
    return cleanupEvents;
  }, [activeTool]); // eslint-disable-line

  // ── RADIUS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTool !== TOOLS.RADIUS) return;
    cleanupEvents();
    drop('circle'); drop('circlePreview');
    let center = null;
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.getContainer().style.cursor = 'crosshair';

    const onClick = (e) => {
      const pt = [e.latlng.lat, e.latlng.lng];
      if (!center) {
        center = pt;
      } else {
        const r = distanceMeters(center, pt);
        drop('circlePreview');
        lr.current.circle = L.circle(center, {
          radius: r,
          color: COLORS.radius, fillColor: COLORS.radius, fillOpacity: 0.2, weight: 2.5,
        }).addTo(map);
        setEffectRadius({ center, radius_meters: Math.round(r) });
        cleanupEvents();
        onToolDone();
      }
    };

    const onMove = (e) => {
      if (!center) return;
      const r = distanceMeters(center, [e.latlng.lat, e.latlng.lng]);
      drop('circlePreview');
      lr.current.circlePreview = L.circle(center, {
        radius: r,
        color: COLORS.radius, fillColor: COLORS.radius, fillOpacity: 0.1,
        weight: 1.5, dashArray: '5 4',
      }).addTo(map);
    };

    hr.current.click     = onClick;
    hr.current.mousemove = onMove;
    map.on('click',     onClick);
    map.on('mousemove', onMove);
    return cleanupEvents;
  }, [activeTool]); // eslint-disable-line

  // ── POINT ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTool !== TOOLS.POINT) return;
    cleanupEvents();
    drop('point');
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.getContainer().style.cursor = 'crosshair';

    const onClick = (e) => {
      const pt = [e.latlng.lat, e.latlng.lng];
      drop('point');
      lr.current.point = L.circleMarker(pt, {
        radius: 10, color: '#fff', weight: 3,
        fillColor: COLORS.point, fillOpacity: 1,
      }).addTo(map);
      setIncidentPoint({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [e.latlng.lng, e.latlng.lat] },
      });
      cleanupEvents();
      onToolDone();
    };

    hr.current.click = onClick;
    map.on('click', onClick);
    return cleanupEvents;
  }, [activeTool]); // eslint-disable-line

  // ── DIRECTION ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTool !== TOOLS.DIRECTION || !userLocation) return;
    cleanupEvents();
    drop('dirLine'); drop('dirHead');
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.getContainer().style.cursor = 'crosshair';

    const origin = correctedPosition
      ? [correctedPosition.latitude, correctedPosition.longitude]
      : [userLocation.latitude,    userLocation.longitude];

    const drawArrow = (to) => {
      const bearing = bearingDegrees(origin, to);
      drop('dirLine'); drop('dirHead');
      lr.current.dirLine = L.polyline([origin, to], {
        color: COLORS.direction, weight: 3,
      }).addTo(map);
      // Apply animated dash CSS class to the SVG path
      const el = lr.current.dirLine.getElement();
      if (el) el.querySelectorAll('path').forEach((p) => p.classList.add('cir-dir-animated'));
      lr.current.dirHead = L.marker(to, { icon: arrowHeadIcon(bearing), zIndexOffset: 100 }).addTo(map);
      return bearing;
    };

    const onMove = (e) => drawArrow([e.latlng.lat, e.latlng.lng]);

    const onClick = (e) => {
      const bearing = drawArrow([e.latlng.lat, e.latlng.lng]);
      setDirectionBearing(bearing);
      cleanupEvents();
      onToolDone();
    };

    hr.current.click     = onClick;
    hr.current.mousemove = onMove;
    map.on('click',     onClick);
    map.on('mousemove', onMove);
    return cleanupEvents;
  }, [activeTool]); // eslint-disable-line

  // ── POSITION ADJUST ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTool !== TOOLS.POSITION || !userLocation) return;
    cleanupEvents();
    map.getContainer().style.cursor = 'grab';

    const origin = [userLocation.latitude, userLocation.longitude];

    // Ensure position marker exists
    if (!lr.current.posMarker) {
      lr.current.posMarker = L.marker(origin, {
        icon: positionIcon(), draggable: true, zIndexOffset: 200,
      }).addTo(map);
    }
    lr.current.posMarker.setLatLng(origin);
    lr.current.posMarker.options.draggable = true;
    lr.current.posMarker.dragging?.enable();

    const onDragEnd = () => {
      const pos = lr.current.posMarker.getLatLng();
      const newPos = [pos.lat, pos.lng];
      if (distanceMeters(origin, newPos) > MAX_POSITION_RADIUS) {
        lr.current.posMarker.setLatLng(origin);
        return;
      }
      setCorrectedPosition({ latitude: pos.lat, longitude: pos.lng });
      map.getContainer().style.cursor = '';
      onToolDone();
    };

    lr.current.posMarker.on('dragend', onDragEnd);
    const markerAtSetup = lr.current.posMarker;
    return () => {
      markerAtSetup?.off('dragend', onDragEnd);
      markerAtSetup?.options && (markerAtSetup.options.draggable = false);
      markerAtSetup?.dragging?.disable();
      map.getContainer().style.cursor = '';
    };
  }, [activeTool]); // eslint-disable-line

  // Init position marker when userLocation first arrives
  useEffect(() => {
    ensureStyles();
    if (!userLocation || lr.current.posMarker) return;
    lr.current.posMarker = L.marker(
      [userLocation.latitude, userLocation.longitude],
      { icon: positionIcon(), draggable: false, zIndexOffset: 200 }
    ).addTo(map);
    return () => { drop('posMarker'); };
  }, [userLocation]); // eslint-disable-line

  return null;
}

// ── CirMap — the unified public component ──────────────────────────────────
export default function CirMap({
  // Map setup
  center,                  // [lat, lng] — required
  zoom = 13,
  height = '100%',
  minZoom = 2,
  maxBounds,               // [[lat,lng], [lat,lng]] Leaflet format

  // Form location picker
  locationPicker = false,
  form,                    // Mantine form object

  // GPS auto-locate on mount
  autoLocate = false,
  onLocated,               // ({latitude, longitude}) => void

  // Damage report markers
  reports,

  // Annotation toolbar
  showAnnotationTools = false,
  userLocation,            // {latitude, longitude}
  onAnnotationChange,

  // Recenter callback
  onMapReady,
  onRecenter,
}) {
  ensureStyles();

  const tools = useAnnotationTools();
  const {
    activeTool, activateTool,
    incidentPolygon,    setIncidentPolygon,
    effectRadius,       setEffectRadius,
    incidentPoint,      setIncidentPoint,
    directionBearing,   setDirectionBearing,
    correctedPosition,  setCorrectedPosition,
    polygonVertices,
    getAnnotations, clearAll,
  } = tools;

  const clearLayersFnRef = useRef(null);
  const [locatedUser, setLocatedUser] = useState(userLocation ?? null);

  // Merge external userLocation prop with GPS-discovered location
  const effectiveUserLocation = userLocation ?? locatedUser;

  const handleLocated = useCallback((loc) => {
    setLocatedUser(loc);
    if (onLocated) onLocated(loc);
  }, [onLocated]);

  // Notify parent of annotation changes
  useEffect(() => {
    if (onAnnotationChange) onAnnotationChange(getAnnotations());
  }, [incidentPolygon, effectRadius, incidentPoint, directionBearing, correctedPosition]); // eslint-disable-line

  const handleClearAll = () => {
    clearAll();
    if (clearLayersFnRef.current) clearLayersFnRef.current();
  };

  const toolButtons = [
    { tool: TOOLS.POLYGON,   icon: <IconPolygon size={18} />,         label: 'Incident Area',   color: COLORS.polygon,   tip: 'Click vertices, double-click to close' },
    { tool: TOOLS.RADIUS,    icon: <IconCircle size={18} />,          label: 'Effect Radius',   color: COLORS.radius,    tip: 'Click center, then click edge' },
    { tool: TOOLS.POINT,     icon: <IconMapPin size={18} />,          label: 'Incident Point',  color: COLORS.point,     tip: 'Click to place exact location' },
    { tool: TOOLS.DIRECTION, icon: <IconNavigation size={18} />,      label: 'Direction',       color: COLORS.direction, tip: 'Click toward the incident' },
    { tool: TOOLS.POSITION,  icon: <IconCurrentLocation size={18} />, label: 'Adjust Position', color: COLORS.position,  tip: 'Drag your position marker' },
  ];

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      <MapContainer
        center={center ?? [9.032, 38.7486]}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={19}
        style={{ height: '100%', width: '100%' }}
        doubleClickZoom={activeTool === TOOLS.NONE}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street View">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url={ESRI_SATELLITE}
              maxZoom={19}
              maxNativeZoom={18}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController
          center={center}
          zoom={zoom}
          maxBounds={maxBounds}
          minZoom={minZoom}
          onMapReady={onMapReady}
          onRecenter={onRecenter}
        />

        {autoLocate && <AutoLocate onLocated={handleLocated} />}

        {locationPicker && <LocationPicker form={form} />}

        {reports && <ReportMarkers reports={reports} />}

        {showAnnotationTools && (
          <AnnotationLayer
            activeTool={activeTool}
            onToolDone={() => activateTool(TOOLS.NONE)}
            userLocation={effectiveUserLocation}
            correctedPosition={correctedPosition}
            setIncidentPolygon={setIncidentPolygon}
            setEffectRadius={setEffectRadius}
            setIncidentPoint={setIncidentPoint}
            setDirectionBearing={setDirectionBearing}
            setCorrectedPosition={setCorrectedPosition}
            polygonVertices={polygonVertices}
            onClearLayers={(fn) => { clearLayersFnRef.current = fn; }}
          />
        )}
      </MapContainer>

      {/* Annotation toolbar — rendered outside MapContainer, overlays map */}
      {showAnnotationTools && (
        <Box style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, pointerEvents: 'none' }}>
          <Paper
            shadow="md"
            radius="md"
            p="xs"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Stack gap={6}>
              <Text size="xs" c="dimmed" fw={600}
                style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Tools
              </Text>

              {toolButtons.map(({ tool, icon, label, color, tip }) => (
                <Tooltip
                  key={tool}
                  label={<Box><Text size="xs" fw={600}>{label}</Text><Text size="xs" c="dimmed">{tip}</Text></Box>}
                  position="right"
                  withArrow
                >
                  <ActionIcon
                    size="lg"
                    radius="md"
                    variant={activeTool === tool ? 'filled' : 'subtle'}
                    style={{
                      backgroundColor: activeTool === tool ? color : 'transparent',
                      color:           activeTool === tool ? '#fff' : color,
                      border:         `1.5px solid ${color}`,
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => activateTool(activeTool === tool ? TOOLS.NONE : tool)}
                  >
                    {icon}
                  </ActionIcon>
                </Tooltip>
              ))}

              <Box style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 4 }}>
                <Tooltip label="Clear all annotations" position="right" withArrow>
                  <ActionIcon size="lg" radius="md" variant="subtle" color="red"
                    onClick={handleClearAll}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Tooltip>
              </Box>
            </Stack>
          </Paper>

          {activeTool !== TOOLS.NONE && (
            <Paper
              shadow="sm" radius="md" p="xs" mt={8}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                maxWidth: 180,
              }}
            >
              <Text size="xs" c="white">
                {toolButtons.find((t) => t.tool === activeTool)?.tip}
              </Text>
            </Paper>
          )}
        </Box>
      )}
    </div>
  );
}
