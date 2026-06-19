import { useState, useEffect, useCallback } from 'react';

const GPS_PERMISSION_DENIED = 1;

export default function useMapBbox() {
  const [retryCount, setRetryCount] = useState(0);
  const [bbox, setBbox]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [gpsAvailable, setGpsAvailable] = useState(true);
  const [gpsError, setGpsError]       = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setGpsError(null);
    setGpsAvailable(true);
    setBbox(null);
    setError(null);

    if (!navigator.geolocation) {
      setGpsAvailable(false);
      setGpsError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (cancelled) return;
        const { latitude, longitude } = position.coords;
        setGpsAvailable(true);
        setUserLocation({ latitude, longitude });

        try {
          const res = await fetch('/api/map/bbox/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude }),
          });
          if (!res.ok) throw new Error(`bbox API ${res.status}`);
          const data = await res.json();
          if (!cancelled) setBbox(data.bbox);
        } catch (err) {
          if (!cancelled) setError(err.message);
        } finally {
          if (!cancelled) setLoading(false);
        }
      },
      (err) => {
        if (cancelled) return;
        setGpsAvailable(false);
        setGpsError(
          err.code === GPS_PERMISSION_DENIED
            ? 'Location permission was denied. Please allow access and try again.'
            : err.code === 3
            ? 'Location request timed out. Check your device location settings and try again.'
            : 'Could not determine your location. Try again or proceed without GPS.'
        );
        setLoading(false);
      },
      { timeout: 30000, maximumAge: 0, enableHighAccuracy: true }
    );

    return () => { cancelled = true; };
  }, [retryCount]);

  const retryGps = useCallback(() => setRetryCount((c) => c + 1), []);

  return { bbox, loading, error, gpsAvailable, gpsError, retryGps, userLocation };
}
