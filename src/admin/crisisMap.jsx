import React, {useEffect,useState} from 'react';
import {
  MantineProvider,
  createTheme,
  Container,
  Title,
  Text,
  Group,
  Card,
  Paper,
  Stack,
} from '@mantine/core';
import { MapContainer, TileLayer, Marker, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import {api,CRISIS_CONFIG} from '../utils';
// Fix Leaflet markers
delete (L.Icon.Default.prototype )._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const theme = createTheme({
  primaryColor: 'teal',
  fontFamily: 'Inter, system-ui, sans-serif',
});

export function CrisisMapPage() {

  const [crisesList, setCrisesList] = useState([]);
  
    useEffect(() => {
      const fetchCrises = async () => {
        try {
          const response = await api.get("/impact-reports/");
          setCrisesList(response.data);
          console.log("Fetched crises:", response.data);
        } catch (error) {
          console.error("Error fetching crises:", error);
        }
      };
  
      fetchCrises();
    }, []);
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <div style={{ background: '#f8fafc', height: '100vh' }}>
        <Container size="xl">
          <Card shadow="sm" radius="md" p={0}>
          

            {/* The Map */}
            <div style={{ height: '720px', position: 'relative' }}>
              <MapContainer
                center={[4, 38]}
                zoom={5}
                style={{ height: '100%', width: '100%', borderRadius: '0 0 12px 12px' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Hotspots matching the image */}
                {
                  crisesList.map((crisis, index) => (
                    <React.Fragment key={index}>
                      <Marker position={[crisis.location.infrastructure_latitude, crisis.location.infrastructure_longitude]}>
                        <Tooltip permanent direction="top" offset={[0, -10]}>
                          {crisis.crisis.name}
                        </Tooltip>
                      </Marker>
                         <Circle center={[crisis.location.infrastructure_latitude, crisis.location.infrastructure_longitude]} radius={9000} color={CRISIS_CONFIG[crisis.nature_of_crisis].color} fillOpacity={0.4} />
                    </React.Fragment>
                  ))
                }

             
                <Marker position={[9.0, 38.5]}> 
                  <Tooltip permanent direction="top" offset={[0, -10]}>9</Tooltip>
                </Marker>
                <Circle center={[9.0, 38.5]} radius={70000} color="#14b8a6" fillOpacity={0.4} />

                <Marker position={[0.5, 37.5]}>
                  <Tooltip permanent direction="top" offset={[0, -10]}>6</Tooltip>
                </Marker>
                <Circle center={[0.5, 37.5]} radius={80000} color="#f59e0b" fillOpacity={0.4} />

                <Marker position={[-1.8, 41.0]}>
                  <Tooltip permanent direction="top" offset={[0, -10]}>24</Tooltip>
                </Marker>
                <Circle center={[-1.8, 41.0]} radius={90000} color="#ef4444" fillOpacity={0.45} />

                <Marker position={[-2.5, 40.8]}>
                  <Tooltip permanent direction="top" offset={[0, -10]}>12</Tooltip>
                </Marker>

                <Marker position={[-3.2, 39.5]}>
                  <Tooltip permanent direction="top" offset={[0, -10]}>8</Tooltip>
                </Marker>

                <Marker position={[2.8, 32.8]}>
                  <Tooltip permanent direction="top" offset={[0, -10]}>18</Tooltip>
                </Marker>

                <Marker position={[-4.8, 32.5]}>
                  <Tooltip permanent direction="top" offset={[0, -10]}>5</Tooltip>
                </Marker>
              </MapContainer>

              {/* Severity Legend */}
              <Paper
                shadow="md"
                radius="md"
                style={{
                  position: 'absolute',
                  bottom: 30,
                  left: 30,
                  padding: '16px 20px',
                  zIndex: 1000,
                  background: 'white',
                }}
              >
                <Text size="xs" fw={600} mb={10}>Severity</Text>
                <Stack gap={8}>
                  <Group gap={10}>
                    <div style={{ width: 16, height: 16, background: '#ef4444', borderRadius: '50%' }} />
                    <Text size="sm">High • 86</Text>
                  </Group>
                  <Group gap={10}>
                    <div style={{ width: 16, height: 16, background: '#f59e0b', borderRadius: '50%' }} />
                    <Text size="sm">Medium • 142</Text>
                  </Group>
                  <Group gap={10}>
                    <div style={{ width: 16, height: 16, background: '#14b8a6', borderRadius: '50%' }} />
                    <Text size="sm">Low • 218</Text>
                  </Group>
                </Stack>
              </Paper>

              {/* Scale Bar */}
              <Paper
                shadow="sm"
                style={{
                  position: 'absolute',
                  bottom: 30,
                  right: 30,
                  padding: '6px 16px',
                  zIndex: 1000,
                  background: 'white',
                  fontSize: '13px',
                  borderRadius: '6px',
                }}
              >
                0 ——— 500 km
              </Paper>
            </div>
          </Card>
        </Container>
      </div>
    </MantineProvider>
  );
};

