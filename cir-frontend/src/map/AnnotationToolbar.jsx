import { useEffect, useCallback, useRef } from 'react';
import { ActionIcon, Box, Paper, Stack, Text, Tooltip } from '@mantine/core';
import {
  IconCircle,
  IconCurrentLocation,
  IconMapPin,
  IconNavigation,
  IconPolygon,
  IconTrash,
} from '@tabler/icons-react';
import maplibregl from 'maplibre-gl';
import useAnnotationTools, { TOOLS } from './hooks/useAnnotationTools';

const COLORS = {
  polygon:   '#f97316',
  radius:    '#3b82f6',
  point:     '#ef4444',
  direction: '#8b5cf6',
  position:  '#22c55e',
};

// Dash frames for the flowing direction-line animation (MapLibre pattern)
const DASH_SEQ = [
  [0,4,3],[0.5,4,2.5],[1,4,2],[1.5,4,1.5],[2,4,1],[2.5,4,0.5],[3,4,0],
  [0,0.5,3,3.5],[0,1,3,3],[0,1.5,3,2.5],[0,2,3,2],[0,2.5,3,1.5],[0,3,3,1],[0,3.5,3,0.5],
];

// Arrow SVG for the direction head symbol layer (points north; rotated by bearing at runtime)
const ARROW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><polygon points="14,1 26,26 14,19 2,26" fill="${COLORS.direction}"/></svg>`;

function distanceMeters(a, b) {
  const R = 6371000;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function bearingDegrees(a, b) {
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function createCircleGeoJSON(center, radiusMeters, steps = 64) {
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);
    const lat = center[1] + dy / 111320;
    const lng =
      center[0] + dx / (111320 * Math.cos((center[1] * Math.PI) / 180));
    coords.push([lng, lat]);
  }
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] } };
}

function createDirectionArrow(position, bearing, lengthMeters = 200) {
  const bearingRad = (bearing * Math.PI) / 180;
  const endLat =
    position[1] + (lengthMeters * Math.cos(bearingRad)) / 111320;
  const endLng =
    position[0] +
    (lengthMeters * Math.sin(bearingRad)) /
      (111320 * Math.cos((position[1] * Math.PI) / 180));
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [position, [endLng, endLat]] },
        properties: { bearing },
      },
    ],
  };
}

export default function AnnotationToolbar({
  mapInstance,
  userLocation,
  onAnnotationChange,
  isVisible = true,
}) {
  const tools = useAnnotationTools(mapInstance, userLocation);
  const {
    activeTool,
    activateTool,
    incidentPolygon,
    setIncidentPolygon,
    effectRadius,
    setEffectRadius,
    incidentPoint,
    setIncidentPoint,
    directionBearing,
    setDirectionBearing,
    correctedPosition,
    setCorrectedPosition,
    polygonVertices,
    getAnnotations,
    clearAll,
  } = tools;

  const clickHandlerRef      = useRef(null);
  const mousemoveHandlerRef  = useRef(null);
  const mousedownHandlerRef  = useRef(null);
  const mouseupHandlerRef    = useRef(null);
  const isDraggingPosition   = useRef(false);
  const directionBearingRef   = useRef(directionBearing);
  const positionMarkerRef       = useRef(null);
  const directionAnimFrameRef   = useRef(null);
  const canvasTouchCleanupRef   = useRef(null);
  const MAX_POSITION_RADIUS   = 2000;

  // Keep the bearing ref in sync so position-drag handlers read a live value.
  useEffect(() => {
    directionBearingRef.current = directionBearing;
  }, [directionBearing]);

  useEffect(() => {
    if (onAnnotationChange) {
      onAnnotationChange(getAnnotations());
    }
  }, [incidentPolygon, effectRadius, incidentPoint, directionBearing, correctedPosition, onAnnotationChange, getAnnotations]);

  // Inject position-marker pulse CSS once into the document head
  useEffect(() => {
    if (document.getElementById('cir-annotation-styles')) return;
    const s = document.createElement('style');
    s.id = 'cir-annotation-styles';
    s.textContent = `
      @keyframes cir-pulse {
        0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.7; }
        100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
      }
      .cir-pulse-ring {
        position: absolute; top: 50%; left: 50%;
        width: 30px; height: 30px; border-radius: 50%;
        border: 2.5px solid ${COLORS.position};
        animation: cir-pulse 2s ease-out infinite;
        pointer-events: none;
      }
      .cir-pulse-ring:nth-child(2) { animation-delay: 1s; }
    `;
    document.head.appendChild(s);
  }, []);

  // Animate direction-line dashes while a bearing is locked in
  useEffect(() => {
    if (!mapInstance) return;
    if (directionBearing !== null) {
      let step = 0, last = 0;
      const tick = (ts) => {
        if (ts - last > 50) {
          if (mapInstance.getLayer('annotation-direction-line')) {
            mapInstance.setPaintProperty(
              'annotation-direction-line', 'line-dasharray',
              DASH_SEQ[step % DASH_SEQ.length]
            );
          }
          step++;
          last = ts;
        }
        directionAnimFrameRef.current = requestAnimationFrame(tick);
      };
      directionAnimFrameRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(directionAnimFrameRef.current);
      directionAnimFrameRef.current = null;
      if (mapInstance.getLayer('annotation-direction-line')) {
        mapInstance.setPaintProperty('annotation-direction-line', 'line-dasharray', [1, 0]);
      }
    }
    return () => {
      cancelAnimationFrame(directionAnimFrameRef.current);
      directionAnimFrameRef.current = null;
    };
  }, [directionBearing, mapInstance]);

  // ── Initialize map sources and layers once ──────────────────────────────
  useEffect(() => {
    if (!mapInstance) return;

    const initLayers = () => {
      if (!mapInstance.getSource('annotation-polygon')) {
        mapInstance.addSource('annotation-polygon', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        mapInstance.addLayer({
          id: 'annotation-polygon-fill', type: 'fill', source: 'annotation-polygon',
          paint: { 'fill-color': COLORS.polygon, 'fill-opacity': 0.25 },
        });
        mapInstance.addLayer({
          id: 'annotation-polygon-line', type: 'line', source: 'annotation-polygon',
          paint: { 'line-color': COLORS.polygon, 'line-width': 2.5, 'line-dasharray': [2, 1] },
        });
      }

      if (!mapInstance.getSource('annotation-vertices')) {
        mapInstance.addSource('annotation-vertices', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        mapInstance.addLayer({
          id: 'annotation-vertices-circle', type: 'circle', source: 'annotation-vertices',
          paint: {
            'circle-radius': 6,
            'circle-color': '#ffffff',
            'circle-stroke-color': COLORS.polygon,
            'circle-stroke-width': 2.5,
          },
        });
      }

      if (!mapInstance.getSource('annotation-radius')) {
        mapInstance.addSource('annotation-radius', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        mapInstance.addLayer({
          id: 'annotation-radius-fill', type: 'fill', source: 'annotation-radius',
          paint: { 'fill-color': COLORS.radius, 'fill-opacity': 0.2 },
        });
        mapInstance.addLayer({
          id: 'annotation-radius-line', type: 'line', source: 'annotation-radius',
          paint: { 'line-color': COLORS.radius, 'line-width': 2.5 },
        });
      }

      if (!mapInstance.getSource('annotation-point')) {
        mapInstance.addSource('annotation-point', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        mapInstance.addLayer({
          id: 'annotation-point-pulse', type: 'circle', source: 'annotation-point',
          paint: {
            'circle-radius': 18,
            'circle-color': COLORS.point,
            'circle-opacity': 0.3,
            'circle-stroke-color': COLORS.point,
            'circle-stroke-width': 1.5,
            'circle-stroke-opacity': 0.6,
          },
        });
        mapInstance.addLayer({
          id: 'annotation-point-circle', type: 'circle', source: 'annotation-point',
          paint: {
            'circle-radius': 10,
            'circle-color': COLORS.point,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 3,
          },
        });
      }

      if (!mapInstance.getSource('annotation-direction')) {
        mapInstance.addSource('annotation-direction', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        mapInstance.addLayer({
          id: 'annotation-direction-line', type: 'line', source: 'annotation-direction',
          paint: { 'line-color': COLORS.direction, 'line-width': 3, 'line-opacity': 0.9 },
        });
      }

      // Arrow image for direction head — loaded async, layer added inside onload
      if (!mapInstance.hasImage('cir-arrow-head')) {
        const img = new Image(28, 28);
        img.onload = () => {
          if (mapInstance.hasImage('cir-arrow-head')) return;
          mapInstance.addImage('cir-arrow-head', img);
          if (!mapInstance.getSource('annotation-direction-head')) {
            mapInstance.addSource('annotation-direction-head', {
              type: 'geojson',
              data: { type: 'FeatureCollection', features: [] },
            });
            mapInstance.addLayer({
              id: 'annotation-direction-head',
              type: 'symbol',
              source: 'annotation-direction-head',
              layout: {
                'icon-image': 'cir-arrow-head',
                'icon-rotate': ['get', 'bearing'],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'icon-size': 1,
              },
            });
          }
        };
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ARROW_SVG)}`;
      }

      // Position: custom HTML marker with pulse rings (replaces GeoJSON circle layers)
      if (!positionMarkerRef.current) {
        const el = document.createElement('div');
        el.style.cssText = 'position:relative;width:36px;height:36px;user-select:none';
        el.innerHTML = `
          <div class="cir-pulse-ring"></div>
          <div class="cir-pulse-ring"></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36"
               style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35))">
            <circle cx="18" cy="18" r="14" fill="white"/>
            <circle cx="18" cy="18" r="10" fill="${COLORS.position}"/>
            <circle cx="14" cy="13" r="3.5" fill="rgba(255,255,255,0.45)"/>
          </svg>`;
        const posCoords = userLocation
          ? [userLocation.longitude, userLocation.latitude]
          : [38.74, 9.03];
        positionMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(posCoords)
          .addTo(mapInstance);
      }
    };

    // mapInstance is only set after MapBase fires its 'load' callback, so the
    // style is ready — call directly instead of checking loaded() which returns
    // false while tiles are still downloading, causing once('load') to never fire.
    initLayers();

    return () => {
      if (positionMarkerRef.current) {
        positionMarkerRef.current.remove();
        positionMarkerRef.current = null;
      }
    };
  }, [mapInstance, userLocation]);

  // ── Remove all active map event handlers ─────────────────────────────────
  const removeHandlers = useCallback(() => {
    if (!mapInstance) return;
    // Clean up canvas-level touch listeners (position tool mobile)
    if (canvasTouchCleanupRef.current) {
      canvasTouchCleanupRef.current();
      canvasTouchCleanupRef.current = null;
    }
    if (clickHandlerRef.current) {
      mapInstance.off('click', clickHandlerRef.current);
      clickHandlerRef.current = null;
    }
    if (mousemoveHandlerRef.current) {
      mapInstance.off('mousemove', mousemoveHandlerRef.current);
      mousemoveHandlerRef.current = null;
    }
    if (mousedownHandlerRef.current) {
      mapInstance.off('mousedown', mousedownHandlerRef.current);
      mousedownHandlerRef.current = null;
    }
    if (mouseupHandlerRef.current) {
      mapInstance.off('mouseup', mouseupHandlerRef.current);
      mouseupHandlerRef.current = null;
    }
    mapInstance.dragPan.enable();
    mapInstance.boxZoom.enable();
    mapInstance.doubleClickZoom.enable();
    mapInstance.getCanvas().style.cursor = '';
  }, [mapInstance]);

  // ── TOOL: POINT ───────────────────────────────────────────────────────────
  const activatePoint = useCallback(() => {
    if (!mapInstance) return;
    removeHandlers();
    mapInstance.getSource('annotation-point')?.setData({ type: 'FeatureCollection', features: [] });
    mapInstance.dragPan.disable();
    mapInstance.boxZoom.disable();
    mapInstance.doubleClickZoom.disable();
    mapInstance.getCanvas().style.cursor = 'crosshair';

    const handler = (e) => {
      const coords = [e.lngLat.lng, e.lngLat.lat];
      const feature = { type: 'Feature', geometry: { type: 'Point', coordinates: coords } };
      setIncidentPoint(feature);
      mapInstance.getSource('annotation-point')?.setData({
        type: 'FeatureCollection', features: [feature],
      });
      removeHandlers();
      activateTool(TOOLS.NONE);
    };

    clickHandlerRef.current = handler;
    mapInstance.on('click', handler);
  }, [mapInstance, removeHandlers, setIncidentPoint, activateTool]);

  // ── TOOL: POLYGON ─────────────────────────────────────────────────────────
  const activatePolygon = useCallback(() => {
    if (!mapInstance) return;
    removeHandlers();
    const empty = { type: 'FeatureCollection', features: [] };
    mapInstance.getSource('annotation-polygon')?.setData(empty);
    mapInstance.getSource('annotation-vertices')?.setData(empty);
    mapInstance.dragPan.disable();
    mapInstance.boxZoom.disable();
    mapInstance.doubleClickZoom.disable();
    polygonVertices.current = [];
    mapInstance.getCanvas().style.cursor = 'crosshair';

    const closePolygon = () => {
      if (polygonVertices.current.length < 3) return;
      const closed = [...polygonVertices.current, polygonVertices.current[0]];
      const feature = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [closed] } };
      setIncidentPolygon(feature);
      mapInstance.getSource('annotation-polygon')?.setData({ type: 'FeatureCollection', features: [feature] });
      mapInstance.getSource('annotation-vertices')?.setData({ type: 'FeatureCollection', features: [] });
      polygonVertices.current = [];
      removeHandlers();
      activateTool(TOOLS.NONE);
    };

    let lastClickTime = 0;

    const clickHandler = (e) => {
      const now = Date.now();
      if (now - lastClickTime < 300) {
        closePolygon();
        return;
      }
      lastClickTime = now;
      const coords = [e.lngLat.lng, e.lngLat.lat];
      polygonVertices.current = [...polygonVertices.current, coords];
      mapInstance.getSource('annotation-vertices')?.setData({
        type: 'FeatureCollection',
        features: polygonVertices.current.map((coord) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: coord },
        })),
      });
    };

    const moveHandler = (e) => {
      if (polygonVertices.current.length === 0) return;
      const preview = [...polygonVertices.current, [e.lngLat.lng, e.lngLat.lat]];
      mapInstance.getSource('annotation-polygon')?.setData({
        type: 'FeatureCollection',
        features: [
          preview.length >= 3
            ? { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[...preview, preview[0]]] } }
            : { type: 'Feature', geometry: { type: 'LineString', coordinates: preview } },
        ],
      });
    };

    clickHandlerRef.current = clickHandler;
    mousemoveHandlerRef.current = moveHandler;
    mapInstance.on('click', clickHandler);
    mapInstance.on('mousemove', moveHandler);
  }, [mapInstance, removeHandlers, polygonVertices, setIncidentPolygon, activateTool]);

  // ── TOOL: RADIUS ──────────────────────────────────────────────────────────
  const activateRadius = useCallback(() => {
    if (!mapInstance) return;
    removeHandlers();
    mapInstance.getSource('annotation-radius')?.setData({ type: 'FeatureCollection', features: [] });
    mapInstance.dragPan.disable();
    mapInstance.boxZoom.disable();
    mapInstance.doubleClickZoom.disable();
    mapInstance.getCanvas().style.cursor = 'crosshair';

    let center = null;

    const clickHandler = (e) => {
      const lngLat = [e.lngLat.lng, e.lngLat.lat];
      if (!center) {
        center = lngLat;
      } else {
        const radiusM = distanceMeters(center, lngLat);
        setEffectRadius({ center, radius_meters: Math.round(radiusM) });
        mapInstance.getSource('annotation-radius')?.setData({
          type: 'FeatureCollection',
          features: [createCircleGeoJSON(center, radiusM)],
        });
        removeHandlers();
        activateTool(TOOLS.NONE);
      }
    };

    const moveHandler = (e) => {
      if (!center) return;
      const radiusM = distanceMeters(center, [e.lngLat.lng, e.lngLat.lat]);
      mapInstance.getSource('annotation-radius')?.setData({
        type: 'FeatureCollection',
        features: [createCircleGeoJSON(center, radiusM)],
      });
    };

    clickHandlerRef.current = clickHandler;
    mousemoveHandlerRef.current = moveHandler;
    mapInstance.on('click', clickHandler);
    mapInstance.on('mousemove', moveHandler);
  }, [mapInstance, removeHandlers, setEffectRadius, activateTool]);

  // ── TOOL: DIRECTION ───────────────────────────────────────────────────────
  const activateDirection = useCallback(() => {
    if (!mapInstance || !userLocation) return;
    removeHandlers();
    const emptyFC = { type: 'FeatureCollection', features: [] };
    mapInstance.getSource('annotation-direction')?.setData(emptyFC);
    mapInstance.getSource('annotation-direction-head')?.setData(emptyFC);
    setDirectionBearing(null);
    mapInstance.dragPan.disable();
    mapInstance.boxZoom.disable();
    mapInstance.doubleClickZoom.disable();
    mapInstance.getCanvas().style.cursor = 'crosshair';

    const position = correctedPosition
      ? [correctedPosition.longitude, correctedPosition.latitude]
      : [userLocation.longitude, userLocation.latitude];

    const syncArrow = (bearing, arrowData) => {
      mapInstance.getSource('annotation-direction')?.setData(arrowData);
      const tip = arrowData.features[0].geometry.coordinates[1];
      mapInstance.getSource('annotation-direction-head')?.setData({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: tip }, properties: { bearing } }],
      });
    };

    const clickHandler = (e) => {
      const bearing = bearingDegrees(position, [e.lngLat.lng, e.lngLat.lat]);
      syncArrow(bearing, createDirectionArrow(position, bearing, 300));
      setDirectionBearing(bearing);
      removeHandlers();
      activateTool(TOOLS.NONE);
    };

    const moveHandler = (e) => {
      const bearing = bearingDegrees(position, [e.lngLat.lng, e.lngLat.lat]);
      syncArrow(bearing, createDirectionArrow(position, bearing, 300));
    };

    clickHandlerRef.current = clickHandler;
    mousemoveHandlerRef.current = moveHandler;
    mapInstance.on('click', clickHandler);
    mapInstance.on('mousemove', moveHandler);
  }, [mapInstance, removeHandlers, userLocation, correctedPosition, setDirectionBearing, activateTool]);

  // ── TOOL: POSITION ADJUST ─────────────────────────────────────────────────
  const activatePosition = useCallback(() => {
    if (!mapInstance || !userLocation) return;
    removeHandlers();
    mapInstance.dragPan.disable();
    mapInstance.boxZoom.disable();
    mapInstance.doubleClickZoom.disable();
    mapInstance.getCanvas().style.cursor = 'grab';

    const origin = [userLocation.longitude, userLocation.latitude];
    isDraggingPosition.current = false;

    const applyMove = (newPos) => {
      const clamped = distanceMeters(origin, newPos) <= MAX_POSITION_RADIUS ? newPos : origin;
      positionMarkerRef.current?.setLngLat(clamped);
      if (directionBearingRef.current !== null) {
        const arrow = createDirectionArrow(clamped, directionBearingRef.current, 300);
        mapInstance.getSource('annotation-direction')?.setData(arrow);
        const tip = arrow.features[0].geometry.coordinates[1];
        mapInstance.getSource('annotation-direction-head')?.setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: tip }, properties: { bearing: directionBearingRef.current } }],
        });
      }
      return clamped;
    };

    const finalize = (newPos) => {
      isDraggingPosition.current = false;
      if (distanceMeters(origin, newPos) <= MAX_POSITION_RADIUS) {
        setCorrectedPosition({ latitude: newPos[1], longitude: newPos[0] });
      }
      removeHandlers();
      activateTool(TOOLS.NONE);
    };

    // ── Desktop: MapLibre mouse events ────────────────────────────────────
    const downHandler = (e) => {
      if (e.originalEvent.button != null && e.originalEvent.button !== 0) return;
      isDraggingPosition.current = true;
      mapInstance.getCanvas().style.cursor = 'grabbing';
    };
    const moveHandler = (e) => {
      if (!isDraggingPosition.current) return;
      applyMove([e.lngLat.lng, e.lngLat.lat]);
    };
    const upHandler = (e) => {
      if (!isDraggingPosition.current) return;
      finalize([e.lngLat.lng, e.lngLat.lat]);
    };
    mousedownHandlerRef.current = downHandler;
    mousemoveHandlerRef.current = moveHandler;
    mouseupHandlerRef.current   = upHandler;
    mapInstance.on('mousedown', downHandler);
    mapInstance.on('mousemove', moveHandler);
    mapInstance.on('mouseup',   upHandler);

    // ── Mobile: canvas DOM touch events (scoped to canvas — never fires
    //   from off-canvas taps like the recenter button) ──────────────────
    const canvas = mapInstance.getCanvas();
    const onTouchStart = () => {
      isDraggingPosition.current = true;
      canvas.style.cursor = 'grabbing';
    };
    const onTouchMove = (e) => {
      if (!isDraggingPosition.current) return;
      e.preventDefault();
      const t = e.touches[0] || e.changedTouches[0];
      if (!t) return;
      const rect = canvas.getBoundingClientRect();
      const lngLat = mapInstance.unproject([t.clientX - rect.left, t.clientY - rect.top]);
      applyMove([lngLat.lng, lngLat.lat]);
    };
    const onTouchEnd = (e) => {
      if (!isDraggingPosition.current) return;
      const t = e.changedTouches[0];
      if (!t) { isDraggingPosition.current = false; return; }
      const rect = canvas.getBoundingClientRect();
      const lngLat = mapInstance.unproject([t.clientX - rect.left, t.clientY - rect.top]);
      finalize([lngLat.lng, lngLat.lat]);
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);
    canvasTouchCleanupRef.current = () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
    };
  }, [mapInstance, removeHandlers, userLocation, setCorrectedPosition, activateTool, MAX_POSITION_RADIUS]);

  // ── Clear all state + all map sources ────────────────────────────────────
  const handleClearAll = useCallback(() => {
    removeHandlers();
    clearAll();
    if (!mapInstance) return;
    const empty = { type: 'FeatureCollection', features: [] };
    mapInstance.getSource('annotation-polygon')?.setData(empty);
    mapInstance.getSource('annotation-vertices')?.setData(empty);
    mapInstance.getSource('annotation-radius')?.setData(empty);
    mapInstance.getSource('annotation-point')?.setData(empty);
    mapInstance.getSource('annotation-direction')?.setData(empty);
    mapInstance.getSource('annotation-direction-head')?.setData(empty);
    const posCoords = userLocation
      ? [userLocation.longitude, userLocation.latitude]
      : [38.74, 9.03];
    positionMarkerRef.current?.setLngLat(posCoords);
  }, [mapInstance, removeHandlers, clearAll, userLocation]);

  // ── Wire tool activations ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance) return;
    switch (activeTool) {
      case TOOLS.POLYGON:   activatePolygon();   break;
      case TOOLS.RADIUS:    activateRadius();    break;
      case TOOLS.POINT:     activatePoint();     break;
      case TOOLS.DIRECTION: activateDirection(); break;
      case TOOLS.POSITION:  activatePosition();  break;
      default:              removeHandlers();    break;
    }
  }, [activeTool, mapInstance, activatePolygon, activateRadius, activatePoint, activateDirection, activatePosition, removeHandlers]);

  if (!isVisible) return null;

  const toolButtons = [
    { tool: TOOLS.POLYGON,   icon: <IconPolygon size={18} />,         label: 'Incident Area',   color: COLORS.polygon,   description: 'Click to draw polygon. Double-click to close.' },
    { tool: TOOLS.RADIUS,    icon: <IconCircle size={18} />,          label: 'Effect Radius',   color: COLORS.radius,    description: 'Click center, then click edge to set radius.' },
    { tool: TOOLS.POINT,     icon: <IconMapPin size={18} />,          label: 'Incident Point',  color: COLORS.point,     description: 'Click to place exact incident location.' },
    { tool: TOOLS.DIRECTION, icon: <IconNavigation size={18} />,      label: 'Direction',       color: COLORS.direction, description: 'Click toward the incident to set direction.' },
    { tool: TOOLS.POSITION,  icon: <IconCurrentLocation size={18} />, label: 'Adjust Position', color: COLORS.position,  description: 'Drag your position marker to correct GPS.' },
  ];

  return (
    <Box style={{ position: 'absolute', top: 16, left: 16, zIndex: 500, pointerEvents: 'none' }}>
      <Paper
        shadow="md"
        radius="md"
        p="xs"
        style={{
          pointerEvents: 'auto',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Stack gap={6}>
          <Text size="xs" c="dimmed" fw={600} style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Tools
          </Text>

          {toolButtons.map(({ tool, icon, label, color, description }) => (
            <Tooltip
              key={tool}
              label={
                <Box>
                  <Text size="xs" fw={600}>{label}</Text>
                  <Text size="xs" c="dimmed">{description}</Text>
                </Box>
              }
              position="right"
              withArrow
            >
              <ActionIcon
                size="lg"
                radius="md"
                variant={activeTool === tool ? 'filled' : 'subtle'}
                style={{
                  backgroundColor: activeTool === tool ? color : 'transparent',
                  color: activeTool === tool ? '#ffffff' : color,
                  border: `1.5px solid ${color}`,
                  transition: 'all 0.15s ease',
                }}
                onClick={() => activateTool(activeTool === tool ? TOOLS.NONE : tool)}
              >
                {icon}
              </ActionIcon>
            </Tooltip>
          ))}

          <Box style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 4 }}>
            <Tooltip label="Clear all annotations" position="right" withArrow>
              <ActionIcon size="lg" radius="md" variant="subtle" color="red" onClick={handleClearAll}>
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>
          </Box>
        </Stack>
      </Paper>

      {activeTool !== TOOLS.NONE && (
        <Paper
          shadow="sm"
          radius="md"
          p="xs"
          mt={8}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: 180,
          }}
        >
          <Text size="xs" c="white">
            {toolButtons.find((t) => t.tool === activeTool)?.description}
          </Text>
        </Paper>
      )}
    </Box>
  );
}
