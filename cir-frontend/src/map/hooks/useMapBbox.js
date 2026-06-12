import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Relative baseURL so requests go through the CRA dev-server proxy (setupProxy.js),
// which forwards /api/* to http://localhost:8009 server-side — avoids mixed-content
// and localhost-vs-device-IP issues when testing from a phone over HTTPS.
const spatialApi = axios.create({
  baseURL: '',
});

function rewriteMartin(value) {
  if (typeof value === 'string') {
    return value.replace(/martin:3000/g, 'localhost:3000');
  }
  if (Array.isArray(value)) {
    return value.map(rewriteMartin);
  }
  if (value !== null && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = rewriteMartin(value[key]);
    }
    return result;
  }
  return value;
}

// GeolocationPositionError codes
const GPS_PERMISSION_DENIED = 1;

export default function useMapBbox() {
  const [retryCount, setRetryCount] = useState(0);

  const [bbox, setBbox] = useState(null);
  const [tileSources, setTileSources] = useState(null);
  const [buildingFootprintsUrl, setBuildingFootprintsUrl] = useState(null);
  const [zoomRange, setZoomRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gpsAvailable, setGpsAvailable] = useState(true);
  const [gpsError, setGpsError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Reset everything at the start of each attempt (covers the retry case)
    setLoading(true);
    setError(null);
    setGpsError(null);
    setGpsAvailable(true);
    setBbox(null);
    setTileSources(null);
    setBuildingFootprintsUrl(null);
    setZoomRange(null);

    async function fetchBbox(latitude, longitude) {
      try {
        const { data } = await spatialApi.post('/api/map/bbox/', { latitude, longitude });
        const safe = rewriteMartin(data);
        if (!cancelled) {
          setBbox(safe.bbox);
          setTileSources(safe.tile_sources);
          setBuildingFootprintsUrl(safe.building_footprints_url);
          setZoomRange(safe.zoom_range);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!navigator.geolocation) {
      setGpsAvailable(false);
      setGpsError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setGpsAvailable(true);
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        fetchBbox(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        if (cancelled) return;
        // Only treat an explicit denial as "permission denied".
        // TIMEOUT (code 3) or POSITION_UNAVAILABLE (code 2) should still allow
        // the user to retry — they did not necessarily deny access.
        if (err.code === GPS_PERMISSION_DENIED) {
          setGpsAvailable(false);
          setGpsError('Location permission was denied. Please allow access and try again.');
        } else {
          // Timeout or unavailable — could succeed on retry
          setGpsAvailable(false);
          setGpsError(
            err.code === 3
              ? 'Location request timed out. Check your device location settings and try again.'
              : 'Could not determine your location. Try again or proceed without GPS.'
          );
        }
        setLoading(false);
      },
      {
        timeout: 30000,
        maximumAge: 0,           // don't accept cached position — always request a fresh fix
        enableHighAccuracy: true,
      }
    );

    return () => {
      cancelled = true;
    };
  }, [retryCount]); // re-run whenever retryCount increments

  // Exposed so the UI can offer a "Try again" button
  const retryGps = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  return {
    bbox,
    tileSources,
    buildingFootprintsUrl,
    zoomRange,
    loading,
    error,
    gpsAvailable,
    gpsError,
    retryGps,
    userLocation,
  };
}
