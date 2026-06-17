import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';

const ESRI_SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
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

const DEFAULT_CENTER = [38.7486, 9.032]; // Addis Ababa [lng, lat]

function formatCoord(val, isLat) {
  const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
  return `${Math.abs(val).toFixed(5)}° ${dir}`;
}

export default function MapComponent({ form }) {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const pinMarkerRef  = useRef(null); // red incident pin
  const gpsMarkerRef  = useRef(null); // blue GPS dot

  // Stable ref so the click handler never captures a stale closure
  const pinRef = useRef(null);

  const [isSatellite,    setIsSatellite]    = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [locating,       setLocating]       = useState(false);

  pinRef.current = (lng, lat) => {
    const map = mapRef.current;
    if (!map) return;
    if (pinMarkerRef.current) {
      pinMarkerRef.current.setLngLat([lng, lat]);
    } else {
      pinMarkerRef.current = new maplibregl.Marker({ color: '#ef4444' })
        .setLngLat([lng, lat])
        .addTo(map);
    }
    setSelectedCoords({ lat, lng });
    if (form) {
      form.setFieldValue('infrastructure_latitude',  lat);
      form.setFieldValue('infrastructure_longitude', lng);
    }
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: 13,
      attributionControl: false,
    });

    // Standard zoom +/- and compass
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    // Scale bar
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-right');
    // Attribution collapsed
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    // Auto-center on GPS + place blue dot
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;

          // Blue dot for "where I am"
          const el = document.createElement('div');
          el.style.cssText = `
            width: 16px; height: 16px;
            background: #3b82f6; border: 3px solid #fff;
            border-radius: 50%; box-shadow: 0 0 0 2px #3b82f6;
          `;
          gpsMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .addTo(map);

          map.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1000 });
        },
        () => {}
      );
    }

    // Tap/click to drop incident pin
    map.on('click', (e) => {
      pinRef.current(e.lngLat.lng, e.lngLat.lat);
    });

    mapRef.current = map;

    return () => {
      pinMarkerRef.current = null;
      gpsMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const useMyLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        mapRef.current.flyTo({ center: [longitude, latitude], zoom: 16, duration: 800 });
        pinRef.current(longitude, latitude);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const clearPin = () => {
    pinMarkerRef.current?.remove();
    pinMarkerRef.current = null;
    setSelectedCoords(null);
    if (form) {
      form.setFieldValue('infrastructure_latitude',  '');
      form.setFieldValue('infrastructure_longitude', '');
    }
  };

  const toggleLayer = () => {
    if (!mapRef.current) return;
    const showSat = !isSatellite;
    mapRef.current.setLayoutProperty('osm-base',       'visibility', showSat ? 'none'    : 'visible');
    mapRef.current.setLayoutProperty('satellite-base', 'visibility', showSat ? 'visible' : 'none');
    setIsSatellite(showSat);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Map */}
      <div
        style={{
          position: 'relative',
          height: 320,
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid #d1d5db',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <div ref={containerRef} style={{ height: '100%', width: '100%' }} />

        {/* Satellite / Street toggle — top-left */}
        <button
          type="button"
          onClick={toggleLayer}
          title={isSatellite ? 'Switch to street map' : 'Switch to satellite'}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 12px',
            borderRadius: 6,
            border: '1px solid rgba(0,0,0,0.2)',
            background: isSatellite ? '#0f172a' : '#ffffff',
            color: isSatellite ? '#93c5fd' : '#1e3a5f',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
          }}
        >
          {isSatellite ? (
            <>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="1" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="9" y1="1" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
                <line x1="1" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
              </svg>
              Street
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="1" width="7" height="7" rx="1" fill="currentColor" opacity="0.9"/>
                <rect x="10" y="1" width="7" height="7" rx="1" fill="currentColor" opacity="0.5"/>
                <rect x="1" y="10" width="7" height="7" rx="1" fill="currentColor" opacity="0.5"/>
                <rect x="10" y="10" width="7" height="7" rx="1" fill="currentColor" opacity="0.9"/>
              </svg>
              Satellite
            </>
          )}
        </button>

        {/* Use my location — bottom-left inside map */}
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          title="Use my GPS location"
          style={{
            position: 'absolute',
            bottom: 36,
            left: 10,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 12px',
            borderRadius: 6,
            border: '1px solid rgba(0,0,0,0.2)',
            background: '#ffffff',
            color: '#1d4ed8',
            cursor: locating ? 'wait' : 'pointer',
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
            opacity: locating ? 0.7 : 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>
          {locating ? 'Locating…' : 'My location'}
        </button>

        {/* Tap hint — only shown before a pin is placed */}
        {!selectedCoords && (
          <div
            style={{
              position: 'absolute',
              bottom: 36,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.55)',
              color: '#fff',
              borderRadius: 20,
              padding: '5px 14px',
              fontSize: 12,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 5,
            }}
          >
            Tap map to mark incident location
          </div>
        )}
      </div>

      {/* Selected pin coordinates — shown below the map */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 28,
          padding: '0 2px',
        }}
      >
        {selectedCoords ? (
          <>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#374151',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
              </svg>
              <strong>Pinned:</strong>&nbsp;
              {formatCoord(selectedCoords.lat, true)}, {formatCoord(selectedCoords.lng, false)}
            </span>
            <button
              type="button"
              onClick={clearPin}
              style={{
                fontSize: 12,
                color: '#6b7280',
                background: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                cursor: 'pointer',
                padding: '3px 10px',
                minHeight: 28,
              }}
            >
              Clear
            </button>
          </>
        ) : (
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            No location pinned yet — tap the map or use "My location"
          </span>
        )}
      </div>
    </div>
  );
}
