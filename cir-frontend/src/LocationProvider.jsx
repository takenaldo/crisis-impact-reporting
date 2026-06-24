import React, { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [permissionState, setPermissionState] = useState("checking");
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState("unsupported");
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((status) => {
          setPermissionState(status.state);
          status.onchange = () => setPermissionState(status.state);
        })
        .catch(() => setPermissionState("prompt"));
    } else {
      setPermissionState("prompt");
    }
  }, []);

  const requestLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(coords);
          setPermissionState("granted");
          resolve(coords);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) setPermissionState("denied");
          reject(err);
        },
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{ permissionState, location, requestLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook for easy access
export const useLocation = () => useContext(LocationContext);
