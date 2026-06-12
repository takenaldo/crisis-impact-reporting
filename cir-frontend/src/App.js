import './App.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import CrisisDashboard2 from './/CrisisDashboard2';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Notifications } from '@mantine/notifications';
import { MantineProvider } from '@mantine/core';
import ImpactReportForm from './ImpactReportForm';
import CrisisDetailPage from './CrisisDetailPage';
import CitizenMapView from './map/CitizenMapView';

import './i18n';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'maplibre-gl/dist/maplibre-gl.css';

function App() {

  const router = createBrowserRouter([
    { path: '/', element: <CrisisDashboard2 /> },
    { path: '/add-report/:id?/:name?', element: <ImpactReportForm /> },
    { path: '/crisis/:id?', element: <CrisisDetailPage /> },
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
