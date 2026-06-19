import React, { useEffect, useState } from 'react';
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
  ActionIcon,
  Badge,
  Image,
  Box
} from '@mantine/core';
import { MapContainer, TileLayer, Marker, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { api, CRISIS_CONFIG, SEVERITY_CONFIG, COLORS } from '../utils';

const createCustomCrisisIcon = (crisisType) => {
  const config = CRISIS_CONFIG[crisisType] || { emoji: "⚠️", color: "#334155", bg: "#f1f5f9" };

  return L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 31px;
        height: 31px;
        background-color: ${config.bg};
        border: 2px solid ${config.color};
        border-radius: 50%;
        font-size: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        ${config.emoji}
      </div>
    `,

    iconSize: [21,21],
    iconAnchor: [19.5, 19.5], // Anchors the center of the circle to the geographic coordinate
  });
};

const theme = createTheme({
  primaryColor: 'teal',
  fontFamily: 'Inter, system-ui, sans-serif',
});

export function CrisisMapPage() {
  const [crisesList, setCrisesList] = useState([]);

  // State to manage the selected marker's information
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  // Track the active picture index in the slider
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get("/impact-reports/");
        setCrisesList(response.data);
      
      } catch (error) {
        console.error("Error fetching crises:", error);
      }
    };

    fetchCrises();
  }, []);

  // Helper logic to switch slides back and forth safely
  const handlePrevPhoto = (maxItems) => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? maxItems - 1 : prev - 1));
  };

  const handleNextPhoto = (maxItems) => {
    setCurrentPhotoIndex((prev) => (prev === maxItems - 1 ? 0 : prev + 1));
  };

  return (
    <Box bg={COLORS.lightBackground} minHeight="100vh" py="md" px="lg">
      <Container size="xl">
        {/* Main flex container layout separating map and scrollable right sidebar */}
        <div style={{ display: 'flex', gap: '20px', height: '720px', alignItems: 'stretch' }}>

          {/* The Map Container */}
          <Card shadow="sm" radius="md" p={0} style={{ flex: 1, position: 'relative', height: '100%' }}>
            <div style={{ height: '100%', position: 'relative' }}>
              <MapContainer
                center={[4, 38]}
                zoom={5}
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Hotspots matching the image */}
                {crisesList.map((crisis, index) => {
                  // Match custom icon configuration based on nature of crisis
                  const markerIcon = createCustomCrisisIcon(crisis.nature_of_crisis);

                  console.log("location of  crises:", crisis.location.infrastructure_latitude, crisis.location.infrastructure_longitude);
                  return (
                    <React.Fragment key={index}>
                      <Marker
                        position={[crisis.location.infrastructure_latitude || 0, crisis.location.infrastructure_longitude || 0]}
                        icon={markerIcon}
                        eventHandlers={{
                          click: () => {
                            const images = crisis.photos || (crisis.photos ? crisis.photos : []);

                            setCurrentPhotoIndex(0); // Reset index counter context
                            setSelectedCrisis({
                         
                              type: crisis.nature_of_crisis,
                              color: CRISIS_CONFIG[crisis.nature_of_crisis]?.color || 'teal',
                              lat: crisis.location.infrastructure_latitude || 0,
                              lng: crisis.location.infrastructure_longitude || 0,
                              imagesList: images,
                              rawDetails: crisis, // Store the entire object for detailed view
                            });
                          }
                        }}
                      >
                        {/* Changed permanent to false (removed) so tooltip shows only on hover */}
                       
                      </Marker>
                      {/* <Circle
                        center={[crisis.location.infrastructure_latitude, crisis.location.infrastructure_longitude]}
                        radius={9000}
                        color={CRISIS_CONFIG[crisis.nature_of_crisis]?.color || 'teal'}
                        fillOpacity={0.4}
                      /> */}
                    </React.Fragment>
                  );
                })}
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

           
            </div>
          </Card>

          {/* Right Side Details Panel */}
          {selectedCrisis && (
            <Paper
              withBorder
              shadow="md"
              radius="md"
              p="md"
              style={{
                width: '380px',
                height: '100%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Fixed Panel Header */}
              <Group justify="space-between" align="center" mb="md" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <div>
                  <Title order={4} style={{ color: '#0f172a' }}></Title>
                </div>
                <ActionIcon variant="subtle" color="gray" radius="xl" onClick={() => setSelectedCrisis(null)}>
                  ✕
                </ActionIcon>
              </Group>

              {/* Vertical Scroll Panel Container (Main Scrollbar Hidden) */}
              <div
                className="no-scrollbar"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Photo Display View with Next and Previous Icons */}
                {selectedCrisis.imagesList && selectedCrisis.imagesList.length > 0 && (
                  <div>
                    {/* Photo Viewer Card Window with Absolute Control ActionIcons */}
                    <Card p={0} radius="md" withBorder style={{ overflow: 'hidden', position: 'relative', height: '180px' }}>
                      <Image
                        src={selectedCrisis.imagesList[currentPhotoIndex].image}
                        alt={`Controlled damage viewer index-${currentPhotoIndex}`}
                        height="100%"
                        fit="cover"
                        fallbackSrc="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop"
                      />

                      {/* Render navigation buttons only if there is more than 1 image available */}
                      {selectedCrisis.imagesList.length > 1 && (
                        <>
                          {/* Previous Icon Button */}
                          <ActionIcon
                            variant="filled"
                            color="dark"
                            radius="xl"
                            size="md"
                            onClick={() => handlePrevPhoto(selectedCrisis.imagesList.length)}
                            style={{
                              position: 'absolute',
                              left: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              zIndex: 10,
                              opacity: 0.85,
                            }}
                          >
                            ⟨
                          </ActionIcon>

                          {/* Next Icon Button */}
                          <ActionIcon
                            variant="filled"
                            color="dark"
                            radius="xl"
                            size="md"
                            onClick={() => handleNextPhoto(selectedCrisis.imagesList.length)}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              zIndex: 10,
                              opacity: 0.85,
                            }}
                          >
                            ⟩
                          </ActionIcon>
                        </>
                      )}

                      {/* Top Indicator Count Badge */}
                      <Badge
                        size="xs"
                        variant="filled"
                        color="dark"
                        style={{ position: 'absolute', bottom: 8, right: 8, opacity: 0.8 }}
                      >
                        {currentPhotoIndex + 1} / {selectedCrisis.imagesList.length}
                      </Badge>
                    </Card>
                  </div>
                )}
                <div>
                  <Group position="space-between" align="center">
                    <Badge color={selectedCrisis.color} variant="filled" radius="sm">
                      {selectedCrisis.type || 'Active Log'}
                    </Badge>  <Text size="sm" style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                      {selectedCrisis.rawDetails.location.city},{selectedCrisis.rawDetails.location.country}
                    </Text>
                  </Group>
                </div>
                <div>
                  <Text size="sm" style={{ lineHeight: 1.6, color: '#334155' }}>
                    {selectedCrisis.rawDetails.description || 'No detailed description available for this incident.'}
                  </Text>
                </div>
              </div>
            </Paper>
          )}

        </div>
      </Container>
    </Box>
  );
}