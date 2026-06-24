import { useState, useCallback, useRef } from 'react';

const TOOLS = {
  NONE: 'none',
  POLYGON: 'polygon',
  RADIUS: 'radius',
  POINT: 'point',
  DIRECTION: 'direction',
  POSITION: 'position',
};

export default function useAnnotationTools() {
  const [activeTool, setActiveTool] = useState(TOOLS.POINT);

  const [incidentPolygon, setIncidentPolygon] = useState(null);
  const [effectRadius, setEffectRadius] = useState(null);
  const [incidentPoint, setIncidentPoint] = useState(null);
  const [directionBearing, setDirectionBearing] = useState(null);
  const [correctedPosition, setCorrectedPosition] = useState(null);

  const polygonVertices = useRef([]);

  const activateTool = useCallback((tool) => {
    setActiveTool(tool);
    // cursor is managed by AnnotationLayer inside CirMap
  }, []);

  const getAnnotations = useCallback(() => ({
    incident_polygon: incidentPolygon,
    effect_radius: effectRadius,
    incident_point: incidentPoint,
    direction_bearing: directionBearing,
    corrected_position: correctedPosition,
  }), [incidentPolygon, effectRadius, incidentPoint, directionBearing, correctedPosition]);

  const clearAll = useCallback(() => {
    setIncidentPolygon(null);
    setEffectRadius(null);
    setIncidentPoint(null);
    setDirectionBearing(null);
    setCorrectedPosition(null);
    polygonVertices.current = [];
    setActiveTool(TOOLS.NONE);
  }, []);

  return {
    TOOLS,
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
  };
}

export { TOOLS };
