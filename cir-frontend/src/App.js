import './App.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import CrisisDashboard from './/CrisisDashboard';
// import { createBrowserRouter, RouterProvider } from 'react-router';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { MantineProvider } from '@mantine/core';
import ImpactReportForm from './ImpactReportForm';
import CrisisDetailPage from './CrisisDetailPage';
import CitizenMapView from './map/CitizenMapView';

import './i18n';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'leaflet/dist/leaflet.css';

import './colors.css'

import CrisisReportingApp from './CrisisReportingApp';
import LoginPage from './LoginPage';
import CIRAuthChecker from './CIRAuthChecker';



function App() {

  const router = createBrowserRouter([
    // { path: '/', element: <CrisisDashboard /> },
    { path: '/', element: <CrisisReportingApp /> },
    // { path: '/home/', element: <CIRAuthChecker /> },

    { path: '/add-report/:id?/:name?', element: <ImpactReportForm /> },
    { path: '/crisis/:id?', element: <CrisisDetailPage /> },
    { path: '/login/', element: <LoginPage /> },
    { path: '/map', element: <CitizenMapView /> },
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
