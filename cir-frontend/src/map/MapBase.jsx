import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';

const TILE_MODE = process.env.REACT_APP_TILE_MODE || 'online';

// Tile requests go through the CRA dev-server proxy at /martin-tiles → Martin:3000.
// We build an absolute URL from window.location.origin so MapLibre gets a full URL
// (MapLibre doesn't reliably resolve relative paths in tile sources).
// REACT_APP_MARTIN_BASE_URL overrides for production deployments.
const MARTIN_BASE = (() => {
  const fromEnv = process.env.REACT_APP_MARTIN_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return `${window.location.origin}/martin-tiles`;
})();

// Martin serves composite tiles by comma-separating source IDs in the path.
// These IDs match the keys defined in map-service/config/martin.yaml.
const MARTIN_COMPOSITE_URL =
  `${MARTIN_BASE}/ethiopia,kenya,somalia,sudan,south_sudan,djibouti,eritrea/{z}/{x}/{y}`;

const ESRI_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const OSM_STYLE = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '',
    },
    satellite: {
      type: 'raster',
      tiles: [ESRI_SATELLITE],
      tileSize: 256,
      attribution: 'Tiles © Esri',
    },
  },
  layers: [
    { id: 'osm-base',       type: 'raster', source: 'osm',       layout: { visibility: 'visible' } },
    { id: 'satellite-base', type: 'raster', source: 'satellite', layout: { visibility: 'none' } },
  ],
};

// OpenMapTiles-schema vector style served from the local Martin tile server.
// Tiles are offline-capable; only the glyph URL (place labels) still requires
// internet — replace REACT_APP_MARTIN_BASE_URL with a local font server to go
// fully air-gapped.
const LOCAL_MARTIN_STYLE = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    martin: {
      type: 'vector',
      tiles: [MARTIN_COMPOSITE_URL],
      minzoom: 10,
      maxzoom: 16,
      attribution: '',
    },
    satellite: {
      type: 'raster',
      tiles: [ESRI_SATELLITE],
      tileSize: 256,
      attribution: '',
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#f0ece3' } },
    {
      id: 'water-fill',
      type: 'fill',
      source: 'martin',
      'source-layer': 'water',
      paint: { 'fill-color': '#a8d4e6' },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'martin',
      'source-layer': 'waterway',
      paint: { 'line-color': '#a8d4e6', 'line-width': 1 },
    },
    {
      id: 'landcover-grass',
      type: 'fill',
      source: 'martin',
      'source-layer': 'landcover',
      filter: ['in', 'class', 'grass', 'scrub', 'farmland'],
      paint: { 'fill-color': '#dce8c8', 'fill-opacity': 0.6 },
    },
    {
      id: 'landcover-wood',
      type: 'fill',
      source: 'martin',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      paint: { 'fill-color': '#c4d9a8', 'fill-opacity': 0.7 },
    },
    {
      id: 'landuse-residential',
      type: 'fill',
      source: 'martin',
      'source-layer': 'landuse',
      filter: ['==', 'class', 'residential'],
      paint: { 'fill-color': '#e8e0d5', 'fill-opacity': 0.5 },
    },
    {
      id: 'road-track',
      type: 'line',
      source: 'martin',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'track', 'service'],
      paint: { 'line-color': '#d4c9b0', 'line-width': 1 },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'martin',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'residential'],
      paint: { 'line-color': '#ffffff', 'line-width': 1.5 },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'martin',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'secondary', 'tertiary'],
      paint: { 'line-color': '#ffffff', 'line-width': 2.5 },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'martin',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'trunk'],
      paint: { 'line-color': '#fcd34d', 'line-width': 3.5 },
    },
    {
      id: 'road-motorway',
      type: 'line',
      source: 'martin',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      paint: { 'line-color': '#f87171', 'line-width': 4 },
    },
    {
      id: 'boundary-country',
      type: 'line',
      source: 'martin',
      'source-layer': 'boundary',
      filter: ['==', 'admin_level', 2],
      paint: { 'line-color': '#94a3b8', 'line-width': 1, 'line-dasharray': [4, 3] },
    },
    {
      id: 'building-fill',
      type: 'fill',
      source: 'martin',
      'source-layer': 'building',
      paint: { 'fill-color': '#d4ccc4', 'fill-opacity': 0.9 },
    },
    {
      id: 'building-outline',
      type: 'line',
      source: 'martin',
      'source-layer': 'building',
      paint: { 'line-color': '#b8b0a8', 'line-width': 0.8 },
    },
    {
      id: 'place-city',
      type: 'symbol',
      source: 'martin',
      'source-layer': 'place',
      minzoom: 10,
      maxzoom: 18,
      filter: ['in', 'class', 'city', 'town'],
      layout: {
        'text-field': ['get', 'name'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 12, 16, 16],
        'text-font': ['Open Sans Regular'],
        'text-anchor': 'center',
        'symbol-sort-key': ['get', 'rank'],
      },
      paint: { 'text-color': '#1e3a5f', 'text-halo-color': '#fff', 'text-halo-width': 2 },
    },
    {
      id: 'place-village',
      type: 'symbol',
      source: 'martin',
      'source-layer': 'place',
      minzoom: 12,
      maxzoom: 18,
      filter: ['in', 'class', 'village', 'hamlet', 'suburb', 'neighbourhood'],
      layout: {
        'text-field': ['get', 'name'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 12, 11, 16, 14],
        'text-font': ['Open Sans Regular'],
        'text-anchor': 'center',
      },
      paint: { 'text-color': '#374151', 'text-halo-color': '#fff', 'text-halo-width': 1.5 },
    },
    {
      id: 'road-label',
      type: 'symbol',
      source: 'martin',
      'source-layer': 'transportation_name',
      minzoom: 14,
      maxzoom: 18,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 14, 10, 16, 13],
        'symbol-placement': 'line',
        'text-max-angle': 30,
        'text-padding': 5,
      },
      paint: { 'text-color': '#444', 'text-halo-color': '#fff', 'text-halo-width': 1.5 },
    },
    // Satellite sits on top of all vector layers; hidden by default.
    { id: 'satellite-base', type: 'raster', source: 'satellite', layout: { visibility: 'none' } },
  ],
};

const MAP_STYLE = TILE_MODE === 'local' ? LOCAL_MARTIN_STYLE : OSM_STYLE;

// Street map icon — road grid lines
const StreetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="9" y1="1" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
    <line x1="1" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
  </svg>
);

// Satellite icon — four-pane grid (imagery grid)
const SatelliteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
    <rect x="10" y="1" width="7" height="7" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="1" y="10" width="7" height="7" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="10" y="10" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
  </svg>
);

export default function MapBase({
  center = [38.74, 9.03],
  zoom = 16,
  maxBounds,
  tileSources,
  buildingFootprintsUrl,
  onBuildingClick,
  onMapReady,
  onRecenter,
  showLayerToggle = true,
  style,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const loadedRef = useRef(false);
  const lastCenterRef = useRef(null);

  const [isSatellite, setIsSatellite] = useState(false);

  // Initialize once on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center,
      zoom,
      minZoom: 10,
      maxZoom: 18,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      loadedRef.current = true;
      if (onMapReady) onMapReady(map);
    });

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle between street and satellite layers
  const toggleLayer = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const showSat = !isSatellite;
    if (TILE_MODE === 'local') {
      // Local mode: satellite sits on top of vector layers — just show/hide it.
      map.setLayoutProperty('satellite-base', 'visibility', showSat ? 'visible' : 'none');
    } else {
      map.setLayoutProperty('osm-base',       'visibility', showSat ? 'none'    : 'visible');
      map.setLayoutProperty('satellite-base', 'visibility', showSat ? 'visible' : 'none');
    }
    setIsSatellite(showSat);
  };

  // Expose a stable recenter function to the parent via onRecenter callback
  useEffect(() => {
    if (!onRecenter) return;
    onRecenter(() => {
      if (!mapRef.current || !center) return;
      mapRef.current.flyTo({ center, zoom: 16, duration: 800 });
    });
  }, [center, onRecenter]);

  // Restrict panning to the local area when bbox is known
  useEffect(() => {
    if (!mapRef.current || !maxBounds) return;
    const setMax = () => mapRef.current.setMaxBounds(maxBounds);
    if (mapRef.current.loaded()) {
      setMax();
    } else {
      mapRef.current.once('load', setMax);
    }
  }, [maxBounds]);

  // Fly to center when GPS location arrives — skip if same coords as last fly
  useEffect(() => {
    if (!mapRef.current || !center) return;
    const prev = lastCenterRef.current;
    if (prev && prev[0] === center[0] && prev[1] === center[1]) return;
    lastCenterRef.current = center;

    const map = mapRef.current;
    if (map.loaded()) {
      map.flyTo({ center: center, zoom: 16, duration: 1500 });
    } else {
      map.once('load', () => {
        map.flyTo({ center: center, zoom: 16, duration: 1500 });
      });
    }
  }, [center]);

  // Add Martin vector tile sources when bbox API responds
  useEffect(() => {
    if (!tileSources || tileSources.length === 0 || !mapRef.current) return;

    const addSources = () => {
      tileSources.forEach((ts) => {
        if (!mapRef.current.getSource(ts.name)) {
          mapRef.current.addSource(ts.name, {
            type: 'vector',
            tiles: [ts.url],
            minzoom: 10,
            maxzoom: 16,
          });
        }
      });
    };

    if (loadedRef.current) {
      addSources();
    } else {
      mapRef.current.once('load', addSources);
    }
  }, [tileSources]);

  // Add building footprints fill layer when URL is available
  useEffect(() => {
    if (!buildingFootprintsUrl || !mapRef.current) return;

    const addBuildings = () => {
      if (mapRef.current.getSource('building-footprints')) return;

      mapRef.current.addSource('building-footprints', {
        type: 'vector',
        tiles: [buildingFootprintsUrl],
        minzoom: 10,
        maxzoom: 16,
      });

      mapRef.current.addLayer({
        id: 'buildings-fill',
        type: 'fill',
        source: 'building-footprints',
        'source-layer': 'buildings',
        paint: {
          'fill-color': '#aaaaaa',
          'fill-opacity': 0.4,
        },
      });

      mapRef.current.on('click', 'buildings-fill', (e) => {
        if (!e.features?.length || !onBuildingClick) return;
        const feature = e.features[0];
        const id = feature.properties?.id ?? feature.id ?? null;
        onBuildingClick(id, feature);
      });

      mapRef.current.on('mouseenter', 'buildings-fill', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });
      mapRef.current.on('mouseleave', 'buildings-fill', () => {
        mapRef.current.getCanvas().style.cursor = '';
      });
    };

    if (loadedRef.current) {
      addBuildings();
    } else {
      mapRef.current.once('load', addBuildings);
    }
  }, [buildingFootprintsUrl, onBuildingClick]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', ...style }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      {showLayerToggle && (
        <button
          onClick={toggleLayer}
          title={isSatellite ? 'Switch to street map' : 'Switch to satellite'}
          style={{
            position: 'absolute',
            top: 110,
            right: 10,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: 4,
            border: '2px solid rgba(0,0,0,0.2)',
            background: isSatellite ? '#1a1a2e' : '#ffffff',
            color: isSatellite ? '#7dd3fc' : '#1e3a5f',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 5px rgba(0,0,0,0.35)',
            transition: 'background 0.2s, color 0.2s',
            padding: 0,
          }}
        >
          {isSatellite ? <StreetIcon /> : <SatelliteIcon />}
        </button>
      )}
    </div>
  );
}
