import { useMemo, useRef, useState } from 'react';
import { ActionIcon, Box, LoadingOverlay, Text } from '@mantine/core';
import { IconCurrentLocation, IconMapPin } from '@tabler/icons-react';
import CirMap from './CirMap';
import useMapBbox from './hooks/useMapBbox';

const MOCK_REPORTS = [
  { id: 1, latitude: 11.593, longitude: 37.388, damage_level: 'minimal' },
  { id: 2, latitude: 11.596, longitude: 37.392, damage_level: 'partial' },
  { id: 3, latitude: 11.589, longitude: 37.395, damage_level: 'complete' },
  { id: 4, latitude: 11.601, longitude: 37.385, damage_level: 'partial' },
  { id: 5, latitude: 11.587, longitude: 37.399, damage_level: 'minimal' },
];

export default function CitizenMapView() {
  const { bbox, loading, gpsAvailable, userLocation } = useMapBbox();
  const recenterFnRef = useRef(null);
  const [annotations, setAnnotations] = useState(null); // eslint-disable-line no-unused-vars

  const hasLocation = Boolean(userLocation);

  // Leaflet expects [lat, lng]; world center when GPS unavailable
  const mapCenter = useMemo(() => {
    if (userLocation) return [userLocation.latitude, userLocation.longitude];
    if (bbox) return [(bbox.min_lat + bbox.max_lat) / 2, (bbox.min_lng + bbox.max_lng) / 2];
    return [10, 20]; // world center no specific place assumed
  }, [userLocation, bbox]);

  // Leaflet maxBounds format: [[minLat, minLng], [maxLat, maxLng]]
  const maxBounds = useMemo(() => {
    if (!bbox) return null;
    return [
      [bbox.min_lat - 0.02, bbox.min_lng - 0.02],
      [bbox.max_lat + 0.02, bbox.max_lng + 0.02],
    ];
  }, [bbox]);

  // Compute the minimum zoom where the viewport can't exceed the bbox.
  // Formula: z = log2(viewportPx * 360 / (256 * lngSpan))
  // Uses the lng span (narrower dimension on most phones held portrait).
  const minZoom = useMemo(() => {
    if (!bbox) return 2;
    const lngSpan = bbox.max_lng - bbox.min_lng;
    const viewportPx = window.innerWidth || 400;
    return Math.ceil(Math.log2((viewportPx * 360) / (256 * lngSpan)));
  }, [bbox]);

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
      {/* Header */}
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
        {!loading && hasLocation && (
          <Text c="#2ecc71" size="xs" ml="auto">
            ● Location found
          </Text>
        )}
        {!loading && !gpsAvailable && (
          <Text c="#f39c12" size="xs" ml="auto">
            ● GPS unavailable pan to your location
          </Text>
        )}
      </Box>

      {/* Map */}
      <Box style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <LoadingOverlay visible={loading} zIndex={10} overlayProps={{ blur: 2 }} />

        <CirMap
          center={mapCenter}
          zoom={hasLocation ? 16 : 2}
          minZoom={minZoom}
          maxBounds={maxBounds}
          height="100%"
          reports={MOCK_REPORTS}
          showAnnotationTools
          userLocation={userLocation}
          onAnnotationChange={setAnnotations}
          onRecenter={(fn) => { recenterFnRef.current = fn; }}
        />

        {/* Hint overlay when GPS is unavailable */}
        {!loading && !gpsAvailable && (
          <Box
            style={{
              position: 'absolute',
              bottom: 70,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 5,
            }}
          >
            Pan and zoom to find your location
          </Box>
        )}

        {hasLocation && (
          <Box
            style={{
              position: 'absolute',
              bottom: 20,
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
        )}
      </Box>
    </Box>
  );
}
