import { useState, useEffect, useCallback } from 'react';

const RADIUS_KM = 7.5;

function calculateBbox(lat, lng) {
  const latOffset = RADIUS_KM / 111.0;
  const lngOffset = RADIUS_KM / (111.0 * Math.cos((lat * Math.PI) / 180));
  return {
    min_lng: lng - lngOffset,
    min_lat: lat - latOffset,
    max_lng: lng + lngOffset,
    max_lat: lat + latOffset,
  };
}

const GPS_PERMISSION_DENIED = 1;

export default function useMapBbox() {
  const [retryCount, setRetryCount] = useState(0);
  const [bbox, setBbox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsAvailable, setGpsAvailable] = useState(true);
  const [gpsError, setGpsError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setGpsError(null);
    setGpsAvailable(true);
    setBbox(null);

    if (!navigator.geolocation) {
      setGpsAvailable(false);
      setGpsError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        const { latitude, longitude } = position.coords;
        setGpsAvailable(true);
        setUserLocation({ latitude, longitude });
        setBbox(calculateBbox(latitude, longitude));
        setLoading(false);
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

  return { bbox, loading, gpsAvailable, gpsError, retryGps, userLocation };
}
