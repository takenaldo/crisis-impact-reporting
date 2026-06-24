import CrisisReportingApp from "./CrisisReportingApp";
import CrisisReportingAppPublic from "./CrisisReportingAppPublic";
import { useLocation } from "./LocationProvider";
import LoginPage from "./LoginPage";

const CIRAuthChecker = ({ children }) => {
  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");
  const { permissionState, location, requestLocation } = useLocation();

  if (permissionState === "granted" && location) {
    <>
      <p>Location Not Found</p>;
      <button onClick={requestLocation}>Enable Location Features</button>
    </>;
  } else {
    if (!access_token && !refresh_token) return <CrisisReportingAppPublic />;
    return <CrisisReportingApp />;
  }
};

export default CIRAuthChecker;
