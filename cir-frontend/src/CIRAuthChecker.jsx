import CrisisReportingApp from "./CrisisReportingApp";
import CrisisReportingAppPublic from "./CrisisReportingAppPublic";
import { LocationPermissionRequired } from "./LocationPermissionRequired";
import { LocationPermissionRequest } from "./LocationPermissionRequest"; // New component below
import { useLocation } from "./LocationProvider";

const CIRAuthChecker = ({ children }) => {
  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");
  const { permissionState, location, requestLocation } = useLocation();

  console.log("Current Permission State:", permissionState, location);

  // 1. GRANTED STATE: Render the application dashboards
  if (permissionState === "granted") {
    if (!access_token && !refresh_token) return <CrisisReportingAppPublic />;
    return <CrisisReportingApp />;
  }

  // 2. DENIED STATE: Explicitly blocked by user, show restoration guide
  if (permissionState === "denied") {
    return <LocationPermissionRequired />;
  }

  // 3. PROMPT / UNDETERMINED STATE: Show onboarding gateway asking them to enable it
  return <LocationPermissionRequest onActivate={requestLocation} />;
};

export default CIRAuthChecker;
