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
    return new Promise(async (resolve, reject) => {
      // 1. Check if the browser even supports geolocation
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      try {
        // 2. Check the current permission state (Optional but highly recommended)
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({
            name: "geolocation",
          });

          if (permissionStatus.state === "denied") {
            setPermissionState("denied");
            reject(
              new Error(
                "Location permission was previously denied. Please enable it in your browser settings.",
              ),
            );
            return;
          }
        }

        // 3. Request the position (triggers the native browser prompt if prompt/state is 'prompt')
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setLocation(coords);

            console.log("coords", coords);
            setPermissionState("granted");
            resolve(coords);
          },
          (err) => {
            // Handle explicit user denial vs other errors (like timeout or GPS failure)
            if (err.code === err.PERMISSION_DENIED) {
              setPermissionState("denied");
            }
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }, // Good practice configs
        );
      } catch (error) {
        reject(error);
      }
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
