import { useState, useCallback } from 'react';
import { cacheTile, isTileCached } from '../utils/tileCache';

function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

function rewriteUrl(url) {
  return url.replace(/martin:3000/g, 'localhost:3000');
}

const ZOOM_MIN = 10;
const ZOOM_MAX = 16;
const CONCURRENCY = 16;

export default function useTilePrefetch(bbox, tileSources) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startPrefetch = useCallback(async () => {
    if (!bbox || !tileSources || tileSources.length === 0) {
      setProgress(100);
      setIsComplete(true);
      return;
    }

    console.log('[TilePrefetch] bbox:', bbox);
    console.log('[TilePrefetch] tileSources:', tileSources);

    const { min_lng, min_lat, max_lng, max_lat } = bbox;
    const allTiles = [];

    for (let zoom = ZOOM_MIN; zoom <= ZOOM_MAX; zoom++) {
      const tl = latLngToTile(max_lat, min_lng, zoom);
      const br = latLngToTile(min_lat, max_lng, zoom);

      for (let x = tl.x; x <= br.x; x++) {
        for (let y = tl.y; y <= br.y; y++) {
          for (const source of tileSources) {
            const url = rewriteUrl(source.url)
              .replace('{z}', zoom)
              .replace('{x}', x)
              .replace('{y}', y);
            allTiles.push(url);
          }
        }
      }
    }

    console.log('[TilePrefetch] total tiles to fetch:', allTiles.length);

    const total = allTiles.length;
    if (total === 0) {
      setProgress(100);
      setIsComplete(true);
      return;
    }

    // Defined outside the loop so no-loop-func doesn't fire
    const fetchOneTile = async (url) => {
      try {
        const cached = await isTileCached(url);
        if (!cached) {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.arrayBuffer();
            await cacheTile(url, data);
          }
        }
      } catch {
        // silently skip failed tiles — prefetch is best-effort
      }
    };

    let done = 0;
    setProgress(0);
    setIsComplete(false);

    for (let i = 0; i < allTiles.length; i += CONCURRENCY) {
      const batch = allTiles.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map(fetchOneTile));
      done += batch.length;
      setProgress(Math.round((done / total) * 100));
    }

    setIsComplete(true);
    setProgress(100);
  }, [bbox, tileSources]);

  return { progress, isComplete, startPrefetch };
}
