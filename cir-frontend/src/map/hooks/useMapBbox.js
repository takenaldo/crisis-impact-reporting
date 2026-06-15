import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: '' });

// GeolocationPositionError codes
const GPS_PERMISSION_DENIED = 1;

export default function useMapBbox() {
  const [retryCount, setRetryCount] = useState(0);

  const [bbox, setBbox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gpsAvailable, setGpsAvailable] = useState(true);
  const [gpsError, setGpsError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setGpsError(null);
    setGpsAvailable(true);
    setBbox(null);

    async function fetchBbox(latitude, longitude) {
      try {
        const { data } = await api.post('/api/map/bbox/', { latitude, longitude });
        if (!cancelled) {
          setBbox(data.bbox);
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
        if (err.code === GPS_PERMISSION_DENIED) {
          setGpsAvailable(false);
          setGpsError('Location permission was denied. Please allow access and try again.');
        } else {
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
        maximumAge: 0,
        enableHighAccuracy: true,
      }
    );

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const retryGps = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  return { bbox, loading, error, gpsAvailable, gpsError, retryGps, userLocation };
}
