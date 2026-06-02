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
import { IconLocation } from "@tabler/icons-react";

// 1. Child component to handle the user's geolocation
const LocationMarker = () => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16 });

    map.on("locationfound", (e) => {
      setPosition(e.latlng);
    });

    map.on("locationerror", (e) => {
      console.warn("Could not get location:", e.message);
    });
  }, [map]);

  if (position === null) return null;

  return (
    <Marker position={position}>
      <Popup>You are exactly here!</Popup>
    </Marker>
  );
};

const LocationSelector = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      // e.latlng contains the raw latitude and longitude
      setPosition(e.latlng);

      // Pass the coordinates back to the parent component
      onLocationSelect(e.latlng);
    },
  });

  // Render a marker if a position has been selected
  if (position === null) return null;

  return (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
};

// 2. Main map component with Satellite View toggle
const MapComponent = ({ form }) => {
  const defaultPosition = [9.032, 38.7486];

  const [selectedCoords, setSelectedCoords] = useState(null);
  const handleLocationSelect = (latlng) => {
    setSelectedCoords(latlng);
    form.setFieldValue("infrastructure_longitude", latlng.lat);
    form.setFieldValue("infrastructure_latitude", latlng.lng);

    // You can now use these exact values for your API, form, or database
    console.log("Extracted Latitude:", latlng.lat);
    console.log("Extracted Longitude:", latlng.lng);
  };

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      {/* LayersControl creates the toggle menu on the map */}
      <LayersControl position="topright">
        {/* BaseLayer 1: Standard OpenStreetMap (Set as default using 'checked') */}
        <LayersControl.BaseLayer name="Street View">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>

        {/* BaseLayer 2: Esri Satellite Imagery */}
        <LayersControl.BaseLayer checked name="Satellite View">
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* Our geolocation marker */}
      <LocationMarker />

      <LocationSelector onLocationSelect={handleLocationSelect} />
    </MapContainer>
  );
};

export default MapComponent;
