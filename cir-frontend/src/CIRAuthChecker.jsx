import CrisisReportingApp from "./CrisisReportingApp";
import CrisisReportingAppPublic from "./CrisisReportingAppPublic";
import LoginPage from "./LoginPage";

const CIRAuthChecker = ({ children }) => {
  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");

  console.log(!access_token, !refresh_token);
  if (!access_token && !refresh_token) return <CrisisReportingAppPublic />;
  return <CrisisReportingApp />;
};

export default CIRAuthChecker;
