import React, { useState, useEffect, Children } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import core Leaflet for icon definitions
import { Container, Drawer, ScrollArea } from "@mantine/core";

// --- CUSTOM SVG ICONS MATCHING THE IMAGE ---
const tealPinSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
    <path fill="#1ABC9C" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle fill="white" cx="12" cy="9" r="2.5"/>
  </svg>
`)}`;

const myLocationIcon = L.icon({
  iconUrl: tealPinSvg,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// 1. Child component to handle the user's geolocation and initial marker
const LocationMarker = ({ defaultPosition }) => {
  // FIX 1: Set initial state directly to the default position object so it displays immediately
  const [position, setPosition] = useState(
    defaultPosition
      ? {
          lat: defaultPosition[0],
          lng: defaultPosition[1],
        }
      : null,
  );
  const map = useMap();

  useEffect(() => {
    // Triggers the permission prompt and centers the map
    map.locate({ setView: true, maxZoom: 18 });

    const onLocationFound = (e) => {
      // If user accepts, update state to user's exact location
      setPosition(e.latlng);
    };

    const onLocationError = (e) => {
      console.warn("Could not get user location, keeping default:", e.message);
      // Map stays centered on default, state remains as default position
    };

    map.on("locationfound", onLocationFound);
    map.on("locationerror", onLocationError);

    return () => {
      map.off("locationfound", onLocationFound);
      map.off("locationerror", onLocationError);
    };
  }, [map]);

  if (position === null) return null;

  // FIX 2: Restored the missing return statement so the marker renders on the map
  return (
    <Marker position={position} icon={myLocationIcon}>
      <Popup>Location Marker</Popup>
    </Marker>
  );
};

// 2. Main map component
const MapView = ({ defaultPosition }) => {
  const defaultPositionAddisAbeba = [9.032, 38.7486]; // Fallback if location fails (e.g., Addis Ababa)

  return (
    <MapContainer
      center={defaultPosition ? defaultPosition : defaultPositionAddisAbeba}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="Street View">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer checked name="Satellite View">
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* Renders the Teal marker for current position / default fallback position */}
      <LocationMarker defaultPosition={defaultPosition} />
    </MapContainer>
  );
};

export default MapView;
