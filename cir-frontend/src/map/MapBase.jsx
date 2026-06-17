import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';

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

const StreetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="9" y1="1" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
    <line x1="1" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
  </svg>
);

const SatelliteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
    <rect x="10" y="1" width="7" height="7" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="1" y="10" width="7" height="7" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="10" y="10" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
  </svg>
);

export default function MapBase({
  center = [20, 10],
  zoom = 2,
  minZoom = 2,
  maxBounds,
  onMapReady,
  onRecenter,
  showLayerToggle = true,
  style,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const lastCenterRef = useRef(null);

  const [isSatellite, setIsSatellite] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center,
      zoom,
      minZoom,
      maxZoom: 18,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      if (onMapReady) onMapReady(map);
    });

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLayer = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const showSat = !isSatellite;
    map.setLayoutProperty('osm-base',       'visibility', showSat ? 'none'    : 'visible');
    map.setLayoutProperty('satellite-base', 'visibility', showSat ? 'visible' : 'none');
    setIsSatellite(showSat);
  };

  useEffect(() => {
    if (!onRecenter) return;
    onRecenter(() => {
      if (!mapRef.current || !center) return;
      mapRef.current.flyTo({ center, zoom: 16, duration: 800 });
    });
  }, [center, onRecenter]);

  useEffect(() => {
    if (!mapRef.current || !maxBounds) return;
    const setMax = () => mapRef.current.setMaxBounds(maxBounds);
    if (mapRef.current.loaded()) {
      setMax();
    } else {
      mapRef.current.once('load', setMax);
    }
  }, [maxBounds]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setMinZoom(minZoom);
  }, [minZoom]);

  useEffect(() => {
    if (!mapRef.current || !center) return;
    const prev = lastCenterRef.current;
    if (prev && prev[0] === center[0] && prev[1] === center[1]) return;
    lastCenterRef.current = center;

    const map = mapRef.current;
    if (map.loaded()) {
      map.flyTo({ center, zoom: 16, duration: 1500 });
    } else {
      map.once('load', () => {
        map.flyTo({ center, zoom: 16, duration: 1500 });
      });
    }
  }, [center]);

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
