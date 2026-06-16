import CrisisReportingApp from "./CrisisReportingApp";
import LoginPage from "./LoginPage";

const CIRAuthChecker = ({ children }) => {
  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");

  console.log(!access_token, !refresh_token);
  if (!access_token && !refresh_token) return <LoginPage />;
  // return <p>sd</p>;
  return <CrisisReportingApp />;
};

export default CIRAuthChecker;
