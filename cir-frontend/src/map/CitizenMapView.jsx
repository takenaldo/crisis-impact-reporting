import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Group,
  LoadingOverlay,
  Paper,
  Progress,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCurrentLocation, IconMapPin } from '@tabler/icons-react';
import AnnotationToolbar from './AnnotationToolbar';
import MapBase from './MapBase';
import useMapBbox from './hooks/useMapBbox';
import useTilePrefetch from './hooks/useTilePrefetch';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MOCK_REPORTS = [
  { id: 1, latitude: 11.593, longitude: 37.388, damage_level: 'minimal' },
  { id: 2, latitude: 11.596, longitude: 37.392, damage_level: 'partial' },
  { id: 3, latitude: 11.589, longitude: 37.395, damage_level: 'complete' },
  { id: 4, latitude: 11.601, longitude: 37.385, damage_level: 'partial' },
  { id: 5, latitude: 11.587, longitude: 37.399, damage_level: 'minimal' },
];

const DAMAGE_COLORS = {
  minimal:  '#22c55e',
  partial:  '#f97316',
  complete: '#ef4444',
};

export default function CitizenMapView() {
  const { bbox, tileSources, buildingFootprintsUrl, loading, error, gpsAvailable, userLocation } =
    useMapBbox();
  const { progress, isComplete, startPrefetch } = useTilePrefetch(bbox, tileSources);

  // Stable center derived from bbox — useMemo prevents re-creating the array on
  // every progress tick, which would trigger MapBase's flyTo on every re-render
  const mapCenter = useMemo(() => {
    if (userLocation) return [userLocation.longitude, userLocation.latitude];
    if (bbox) return [(bbox.min_lng + bbox.max_lng) / 2, (bbox.min_lat + bbox.max_lat) / 2];
    return [38.74, 9.03];
  }, [userLocation, bbox]);

  const maxBounds = useMemo(() => {
    if (!bbox) return null;
    return [
      [bbox.min_lng - 0.02, bbox.min_lat - 0.02],
      [bbox.max_lng + 0.02, bbox.max_lat + 0.02],
    ];
  }, [bbox]);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isReportMode] = useState(true);
  const [annotations, setAnnotations] = useState(null); // eslint-disable-line no-unused-vars
  const prefetchStarted = useRef(false);
  const notifiedRef = useRef(false);
  const recenterFnRef = useRef(null);

  // Kick off prefetch once spatial data is ready — only once
  useEffect(() => {
    if (bbox && tileSources && !prefetchStarted.current) {
      prefetchStarted.current = true;
      startPrefetch();
    }
  }, [bbox, tileSources, startPrefetch]);

  // Show "offline-ready" notification when prefetch finishes
  useEffect(() => {
    if (isComplete && !notifiedRef.current) {
      notifiedRef.current = true;
      notifications.show({
        title: 'Map ready for offline use',
        message: 'All map tiles have been saved to your device.',
        color: 'green',
        autoClose: 4000,
      });
    }
  }, [isComplete]);

  const handleMapReady = (map) => {
    setMapInstance(map);
    // Add impact report markers as a GeoJSON circle layer
    map.addSource('impact-reports', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: MOCK_REPORTS.map((r) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
          properties: {
            id: r.id,
            damage_level: r.damage_level,
          },
        })),
      },
    });

    map.addLayer({
      id: 'reports-circles',
      type: 'circle',
      source: 'impact-reports',
      paint: {
        'circle-radius': 9,
        'circle-color': [
          'match',
          ['get', 'damage_level'],
          'minimal',  DAMAGE_COLORS.minimal,
          'partial',  DAMAGE_COLORS.partial,
          'complete', DAMAGE_COLORS.complete,
          '#aaaaaa',
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
      },
    });
  };

  const handleBuildingClick = (buildingId, feature) => {
    let coords = null;
    const geom = feature.geometry;
    if (geom?.type === 'Polygon' && geom.coordinates?.[0]?.[0]) {
      coords = geom.coordinates[0][0]; // first ring, first vertex [lng, lat]
    } else if (geom?.type === 'MultiPolygon' && geom.coordinates?.[0]?.[0]?.[0]) {
      coords = geom.coordinates[0][0][0];
    } else if (geom?.type === 'Point') {
      coords = geom.coordinates;
    }
    setSelectedBuilding({ id: buildingId, coords, properties: feature.properties });
  };

  const showProgress = bbox && !isComplete;

  return (
    <Box
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box
        style={{
          flexShrink: 0,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 10,
        }}
      >
        <IconMapPin color="#a0aec0" size={18} />
        <Text c="white" fw={700} size="md">
          Citizen Damage Map
        </Text>
        {!loading && gpsAvailable && bbox && (
          <Text c="#2ecc71" size="xs" ml="auto">
            ● Spatial data loaded
          </Text>
        )}
        {!loading && !gpsAvailable && (
          <Text c="#f39c12" size="xs" ml="auto">
            ● Default view (GPS unavailable)
          </Text>
        )}
      </Box>

      {/* ── Spatial API error alert ─────────────────────────────────────── */}
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          title="Spatial API unavailable"
          radius={0}
          style={{ flexShrink: 0 }}
        >
          Could not reach the spatial API: {error}. Map is running in basic mode.
        </Alert>
      )}

      {/* ── Tile prefetch progress bar ─────────────────────────────────── */}
      {showProgress && (
        <Box
          px="md"
          py={6}
          style={{
            flexShrink: 0,
            background: '#f0f2f5',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">
              Caching tiles for offline use…
            </Text>
            <Text size="xs" fw={600} c="blue">
              {progress}%
            </Text>
          </Group>
          <Progress value={progress} size="sm" color="blue" />
        </Box>
      )}

      {/* ── Map ────────────────────────────────────────────────────────── */}
      <Box style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {loading ? (
          <LoadingOverlay
            visible
            zIndex={10}
            overlayProps={{ blur: 2 }}
          />
        ) : !gpsAvailable && !bbox ? (
          <MapContainer
            center={[20, 20]}
            zoom={3}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
          </MapContainer>
        ) : (
          <>
            <MapBase
              center={mapCenter}
              zoom={16}
              maxBounds={maxBounds}
              tileSources={tileSources}
              buildingFootprintsUrl={buildingFootprintsUrl}
              onBuildingClick={handleBuildingClick}
              onMapReady={handleMapReady}
              onRecenter={(fn) => { recenterFnRef.current = fn; }}
            />
            {mapInstance && (
              <AnnotationToolbar
                mapInstance={mapInstance}
                userLocation={userLocation}
                onAnnotationChange={setAnnotations}
                isVisible={isReportMode}
              />
            )}
            <Box
              style={{
                position: 'fixed',
                bottom: selectedBuilding ? 110 : 20,
                right: 16,
                zIndex: 1000,
              }}
            >
              <ActionIcon
                size="xl"
                radius="xl"
                variant="filled"
                color="blue"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                onClick={() => recenterFnRef.current?.()}
                title="Return to my location"
              >
                <IconCurrentLocation size={20} />
              </ActionIcon>
            </Box>
          </>
        )}
      </Box>

      {/* ── Selected building panel ─────────────────────────────────────── */}
      {selectedBuilding && (
        <Paper
          shadow="md"
          radius={0}
          p="md"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 500,
            borderTop: '2px solid #e2e8f0',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
              <Text fw={700} size="sm">
                Selected Building
              </Text>
              <Text size="xs" c="dimmed">
                ID: {selectedBuilding.id ?? 'Unknown'}
              </Text>
              {selectedBuilding.coords && (
                <Text size="xs" c="dimmed">
                  Lng: {Number(selectedBuilding.coords[0]).toFixed(6)}, Lat:{' '}
                  {Number(selectedBuilding.coords[1]).toFixed(6)}
                </Text>
              )}
            </Stack>
            <Text
              size="xs"
              c="blue"
              fw={500}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedBuilding(null)}
            >
              ✕ Close
            </Text>
          </Group>
        </Paper>
      )}
    </Box>
  );
}
