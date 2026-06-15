import './App.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import CrisisDashboard2 from './/CrisisDashboard2';

import { CrisisImpactDashboard } from './admin/admidDashboard';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { MantineProvider } from '@mantine/core';
import ImpactReportForm from './ImpactReportForm';
function App() {
  const router = createBrowserRouter([
    { path: '/admin', element: <CrisisImpactDashboard /> },  { path: '/', element: <CrisisDashboard2 /> },
    { path: '/add-report/:id?/:name?', element: <ImpactReportForm /> },

  ]);
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
export default App;
