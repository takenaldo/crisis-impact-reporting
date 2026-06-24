import CrisisReportingApp from "./CrisisReportingApp";
import CrisisReportingAppPublic from "./CrisisReportingAppPublic";
import { LocationPermissionRequired } from "./LocationPermissionRequired";
import { useLocation } from "./LocationProvider";
import LoginPage from "./LoginPage";

const CIRAuthChecker = ({ children }) => {
  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");
  const { permissionState, location, requestLocation } = useLocation();

  console.log(permissionState, location);
  if (permissionState === "granted") {
    if (!access_token && !refresh_token) return <CrisisReportingAppPublic />;
    return <CrisisReportingApp />;
  } else {
    return <LocationPermissionRequired />;
  }
};

export default CIRAuthChecker;
