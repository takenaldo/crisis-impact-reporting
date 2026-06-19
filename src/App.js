import './App.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import CrisisDashboard from './/CrisisDashboard';
// import { createBrowserRouter, RouterProvider } from 'react-router';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { MantineProvider } from '@mantine/core';
import ImpactReportForm from './ImpactReportForm';
import './i18n';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'leaflet/dist/leaflet.css';

import './colors.css'

import CrisisReportingApp from './CrisisReportingApp';
import LoginPage from './LoginPage';
import CIRAuthChecker from './CIRAuthChecker';
import { SplashScreen } from './SplashScreen';
import { CrisisImpactAdminDashboard } from './admin/admidDashboard';



function App() {

  const router = createBrowserRouter([
    { path: '/admin', element: <CrisisImpactAdminDashboard /> }, { path: '/', element: <SplashScreen /> },
    { path: '/splash', element: <SplashScreen /> },

    { path: '/home', element: <CrisisReportingApp /> },


    { path: '/add-report/:id?/:name?', element: <ImpactReportForm /> },
    // { path: '/crisis/:id?', element: <CrisisDetailPage /> },
    { path: '/login/', element: <LoginPage /> },


    { path: '/auth_check/', element: <CIRAuthChecker /> },



  ]);



  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>


      <Notifications
        styles={{
          notification: {
            height: 'auto',
            alignItems: 'flex-start'
          }
        }}
      />

      <RouterProvider router={router} />
    </MantineProvider>
  );
}
export default App;
