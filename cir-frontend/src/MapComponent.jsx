import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import core Leaflet for icon definitions

// --- CUSTOM SVG ICONS MATCHING THE IMAGE ---
// We define the SVG as a string and encode it to use as a Data URI.

// 1. TEAL PIN for current location
const tealPinSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
    <path fill="#1ABC9C" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle fill="white" cx="12" cy="9" r="2.5"/>
  </svg>
`)}`;

// 2. DARK NAVY PIN for manual selection
const navyPinSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
    <path fill="#11335A" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle fill="white" cx="12" cy="9" r="2.5"/>
  </svg>
`)}`;

// --- DEFINE LEAFLET ICON OBJECTS ---
// These objects are used by the Map components to render the markers.

const myLocationIcon = L.icon({
  iconUrl: tealPinSvg, // The Data URI from above
  iconSize: [36, 36], // The visual size
  iconAnchor: [18, 36], // Points the bottom tip of the pin to the precise coordinate
  popupAnchor: [0, -36], // Position of the popup relative to the pin tip
});

const selectedLocationIcon = L.icon({
  iconUrl: navyPinSvg, // The Data URI from above
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});
// ---------------------------------------------

// 1. Child component to handle the user's geolocation
const LocationMarker = () => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    // Triggers the permission prompt and centers the map
    map.locate({ setView: true, maxZoom: 18 });

    map.on("locationfound", (e) => {
      setPosition(e.latlng);
    });

    map.on("locationerror", (e) => {
      console.warn("Could not get location:", e.message);
    });
  }, [map]);

  if (position === null) return null;

  return (
    // We now pass our custom icon object here
    <Marker position={position} icon={myLocationIcon}>
      <Popup defaultOpened>You are exactly here!</Popup>
    </Marker>
  );
};

const LocationSelector = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  if (position === null) return null;

  return (
    // We now pass our other custom icon object here
    <Marker position={position} icon={selectedLocationIcon}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
};

// 2. Main map component
const MapComponent = ({ form, selectEnabled = true }) => {
  const defaultPosition = [9.032, 38.7486]; // Fallback if location fails (e.g., Addis Ababa)

  const [selectedCoords, setSelectedCoords] = useState(null);
  const handleLocationSelect = (latlng) => {
    setSelectedCoords(latlng);
    form.setFieldValue("infrastructure_longitude", latlng.lat);
    form.setFieldValue("infrastructure_latitude", latlng.lng);
  };

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{ height: "500px", width: "100%", zIndex: "1" }}
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

      <LocationMarker />

      {/* Renders the Dark Navy marker for clicked location */}
      {selectEnabled && (
        <LocationSelector onLocationSelect={handleLocationSelect} />
      )}
    </MapContainer>
  );
};
