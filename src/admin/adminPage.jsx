import React, { useState, useEffect } from 'react';
import {
  MantineProvider,
  createTheme,
  Container,
  Title,
  TextInput,
  Button,
  Group,
  Card,
  Text,
  Badge,
  RingProgress,
  Stack,
  Paper,
  Flex,
} from '@mantine/core';
import {
  IconSearch,
  IconDownload,
  IconBell,
} from '@tabler/icons-react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icons
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

export function DashboardPage ()  {
  const [progress, setProgress] = useState({ high: 0, medium: 0, low: 0 });

  // Animate the ring chart
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress({ high: 58, medium: 27, low: 15 });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '12px 28px' }}>
          <Group justify="space-between" align="center">
            <Group align="center">
              <Text fw={700} size="xl" c="#0f766e">UNDP</Text>
              <Title order={3} style={{ marginLeft: 20 }}>Crisis Impact Overview</Title>
            </Group>

            <Group gap="lg">
              {/* <TextInput
                placeholder="Search reports, locations, teams..."
                leftSection={<IconSearch size={18} />}
                w={360}
                radius="md"
              /> */}
{/*            
              <Button leftSection={<IconDownload size={18} />} radius="md">
                Export
              </Button> */}
              <Button variant="subtle" radius="md" p={8}>
                <IconBell size={22} />
              </Button>

              <Group gap={10}>
                <div style={{
                  width: 38, height: 38, background: '#1e2937', color: 'white',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 700, fontSize: '15px'
                }}>KS</div>
                <div>
                  <Text fw={600} size="sm">Karim S.</Text>
                  <Text size="xs" c="dimmed">Responder - KE</Text>
                </div>
              </Group>
            </Group>
          </Group>
        </header>

        <Container size="xl" py={28}>
          {/* Top Metrics Cards */}
          <Flex gap={20} mb={40}>
            {[
              { title: 'Total Reports', value: '1,284', change: '+12.4%', sparkColor: '#67e8f9' },
              { title: 'High-Impact Incidents', value: '86', change: '+4.2%', sparkColor: '#fb923c' },
             { title: 'Medium-Impact Incidents', value: '742', change: '+8.1%', sparkColor: '#67e8f9' },
               { title: 'Low-Impact Incidents', value: '340', change: '-18%', sparkColor: '#fca5a5' },
            ].map((m, i) => (
              <Card 
                key={i} 
                shadow="sm" 
                radius="md" 
                p="lg" 
                style={{ flex: 1, minWidth: 260, background: 'white', border: '1px solid #f1f5f9' }}
              >
                <Text size="sm" c="dimmed" fw={500} mb={6}>{m.title}</Text>
                                <Group align="flex-end" mb={12}>
                  <Text size={36} fw={700} lh={1}>{m.value}</Text>
                </Group>

                <div style={{
                  height: 48,
                  background: `linear-gradient(90deg, ${m.sparkColor}10, ${m.sparkColor}40)`,
                  borderRadius: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  <svg width="100%" height="100%" style={{ position: 'absolute', bottom: 0 }}>
                    <polyline
                      points="10,38 35,25 65,32 95,18 125,28 155,15 185,22 215,12"
                      fill="none"
                      stroke={m.sparkColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <Badge 
                  color={m.change.startsWith('+') ? 'green' : 'red'} 
                  variant="light" 
                  radius="sm"
                >
                  {m.change}
                </Badge>
              </Card>
            ))}
          </Flex>

          <Flex gap={24}>
            {/* Interactive Crisis Map */}
            <Card shadow="sm" radius="md" style={{ flex: 7 }} p={0}>
             

              <div style={{ height: '580px', position: 'relative' }}>
                <MapContainer
                  center={[3, 37.5]}
                  zoom={5.1}
                  style={{ height: '100%', width: '100%', borderRadius: '0 0 12px 12px' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />

                  <Marker position={[9.2, 38.7]}>
                    <Tooltip permanent direction="top" offset={[0, -8]}>9</Tooltip>
                  </Marker>
                  <Circle center={[9.2, 38.7]} radius={65000} color="#14b8a6" fillOpacity={0.35} />

                  <Marker position={[0.6, 37.6]}>
                    <Tooltip permanent direction="top" offset={[0, -8]}>6</Tooltip>
                  </Marker>
                  <Circle center={[0.6, 37.6]} radius={75000} color="#f59e0b" fillOpacity={0.4} />

                  <Marker position={[-1.9, 41.2]}>
                    <Tooltip permanent direction="top" offset={[0, -8]}>24</Tooltip>
                  </Marker>
                  <Circle center={[-1.9, 41.2]} radius={92000} color="#ef4444" fillOpacity={0.45} />

                  <Marker position={[-2.4, 40.7]}>
                    <Tooltip permanent direction="top" offset={[0, -8]}>12</Tooltip>
                  </Marker>
                  <Marker position={[-3.1, 39.4]}>
                    <Tooltip permanent direction="top" offset={[0, -8]}>8</Tooltip>
                  </Marker>
                  <Marker position={[2.7, 32.9]}>
                    <Tooltip permanent direction="top" offset={[0, -8]}>18</Tooltip>
                  </Marker>
                  <Marker position={[-4.7, 32.4]}>
                    <Tooltip permanent direction="top" offset={[0, -8]}>5</Tooltip>
                  </Marker>
                </MapContainer>

                {/* Severity Legend */}
                <Paper shadow="md" radius="md" style={{ position: 'absolute', bottom: 24, left: 24, padding: '12px 18px', zIndex: 1000, background: 'white' }}>
                  <Text size="xs" fw={600} mb={8}>Severity</Text>
                  <Stack gap={6}>
                    <Group gap={8}><div style={{ width: 13, height: 13, background: '#ef4444', borderRadius: '50%' }} /> High • 86</Group>
                    <Group gap={8}><div style={{ width: 13, height: 13, background: '#f59e0b', borderRadius: '50%' }} /> Medium • 142</Group>
                    <Group gap={8}><div style={{ width: 13, height: 13, background: '#14b8a6', borderRadius: '50%' }} /> Low • 218</Group>
                  </Stack>
                </Paper>

                {/* Scale */}
                <Paper shadow="sm" style={{ position: 'absolute', bottom: 24, right: 24, padding: '4px 14px', zIndex: 1000, fontSize: '12.5px', background: 'white' }}>
                  0 ——— 500 km
                </Paper>
              </div>
            </Card>

            {/* Status Distribution - Animated Ring */}
            <Card shadow="sm" radius="md" style={{ flex: 3 }} p="xl">
              <Group justify="space-between" mb="xl">
                <div>
                  <Text fw={700} size="lg">Status Distribution</Text>
                  <Text size="sm" c="dimmed">By Impact Level</Text>
                </div>
                <Button variant="light" radius="md">Details</Button>
              </Group>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
                <RingProgress
                  size={235}
                  thickness={38}
                  roundCaps
                  animationDuration={1200}   
                  sections={[
                    { value: progress.high, color: '#ef4444' },
                    { value: progress.medium, color: '#f59e0b' },
                    { value: progress.low, color: '#14b8a6' },
                  ]}
                  label={
                    <div style={{ textAlign: 'center' }}>
                      <Text size={38} fw={700} lh={1}>1,284</Text>
                      <Text size="sm" c="dimmed" mt={2}>total reports</Text>
                    </div>
                  }
                />
              </div>

              <Stack gap="md" mt="md">
                {[
                  { label: 'High-Impact', percent: 58, color: '#ef4444' },
                  { label: 'Medium-Impact', percent: 27, color: '#f59e0b' },
                  { label: 'Low-Impact', percent: 15, color: '#14b8a6' },
                ].map((item) => (
                  <Group key={item.label} justify="space-between">
                    <Group gap="sm">
                      <div style={{ width: 13, height: 13, background: item.color, borderRadius: '50%' }} />
                      <Text>{item.label}</Text>
                    </Group>
                    <Text fw={600}>{item.percent}%</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Flex>
        </Container>
      </div>
    </MantineProvider>
  );
};

