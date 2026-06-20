import CrisisReportingApp from "./CrisisReportingApp";
import LoginPage from "./LoginPage";

const RequireAuth = ({ children }) => {
  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");

  if (!access_token && !refresh_token) return <LoginPage />;
  return <CrisisReportingApp />;
};

export default RequireAuth;
