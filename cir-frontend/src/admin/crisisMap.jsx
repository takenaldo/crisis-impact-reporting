import React, { useEffect, useState } from "react";
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
  Box,
  SimpleGrid,
  ScrollArea,
  Indicator,
} from "@mantine/core";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Tooltip,
} from "react-leaflet";
import L, { divIcon } from "leaflet";
import {
  CRISIS_CONFIG,
  SEVERITY_CONFIG,
  COLORS,
  getCategorizeReports,
} from "../utils";
import api from "../api";

import mockReports from "../example.json";
import ReportCard from "../ReportCard";
import ReportDetailsView from "./ReportDetailsView";

import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

// 1. A function that accepts a dynamic variable and generates the icon

const createNumberedIcon = (number = null) => {
  // Use template literals (backticks) to inject the string into the SVG
  const dynamicSvgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      
      <path fill="navy" d="M 24 10 C 17.5 10 13 15 13 20.5 C 13 27 24 36 24 36 C 24 36 35 27 35 20.5 C 35 15 30.5 10 24 10 Z" />
      <circle cx="24" cy="19" r="4" fill="white" />
      
      ${
        // Conditionally render a string, NOT JSX
        number
          ? `
            <circle
              cx="28"
              cy="12"
              r="9"
              fill="teal"
              stroke="white"
              stroke-width="1.5"
            />
            <text
              x="28"
              y="12"
              font-family="sans-serif"
              font-size="10"
              font-weight="bold"
              fill="white"
              text-anchor="middle"
              dominant-baseline="central"
            >
              ${number}
            </text>
          `
          : "" // Return an empty string if there is no number
      }
      
    </svg>
  `;

  return divIcon({
    html: dynamicSvgString,
    className: "custom-leaflet-svg-icon", // Removes default Leaflet styling
    iconSize: [40, 40],

    // Anchor Calculations:
    // The tip of the navy pin ends exactly at x=24, y=36 on the 40x40 canvas
    iconAnchor: [24, 36],
    popupAnchor: [0, -26], // Opens the popup directly above the navy pin
  });
};

// Define the custom icon
const myCustomIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
  c: "red",
  color: "yellow",
});

const createCustomCrisisIcon = (reportCount) => {
  const areaMarkerSvgString = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <ellipse cx="16" cy="28" rx="12" ry="4" fill="teal" fill-opacity="0.3" stroke="teal" stroke-width="1.5" />
    
    <path fill="navy" d="M 16 2 C 9.5 2 5 7 5 12.5 C 5 19 16 28 16 28 C 16 28 27 19 27 12.5 C 27 7 22.5 2 16 2 Z" />
    
    <circle cx="16" cy="11" r="4" fill="white" />
  </svg>
`;

  // 2. Configure the divIcon with smaller sizing
  const areaIcon = divIcon({
    html: areaMarkerSvgString,
    className: "custom-leaflet-svg-icon", // Keeps background transparent

    // New size
    iconSize: [32, 32],

    // New Anchors calculated for 32x32 size:
    // The tip is horizontally in the middle (16).
    // The tip of the pin hits the ground ellipse at internal y-coordinate 28.
    iconAnchor: [16, 28],
    popupAnchor: [0, -28],
  });
  return createNumberedIcon(reportCount);

  const config = CRISIS_CONFIG[reportCount] || {
    emoji: "⚠️",
    color: "#334155",
    bg: "transparent",
  };

  return L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 31px;
        height: 31px;
        border: 0px solid ${config.color};
        border-radius: 0%;
        font-size: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        ${config.emoji}
      </div>
    `,

    iconSize: [21, 21],
    iconAnchor: [19.5, 19.5], // Anchors the center of the circle to the geographic coordinate
  });
};

const theme = createTheme({
  primaryColor: "teal",
  fontFamily: "Inter, system-ui, sans-serif",
});

export function CrisisMapPage() {
  const [crisesList, setCrisesList] = useState([]);

  // State to manage the selected marker's information
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [selectedMatchGroup, setSelectedMatchGroup] = useState(null);

  // Track the active picture index in the slider
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [categorizedReports, setCategorizedreports] = useState(null);

  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get("/impact-reports/");
        setCrisesList(response.data);
        console.log("Fetched crises:", response.data);
        setCategorizedreports(
          getCategorizeReports([
            ...response.data,
            // ...response.data,
            // ...response.data,
            // ...response.data,
          ]),
        );
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
    <Box
      // bg={COLORS.lightBackground}
      bg="red"
      minHeight="100vh"
      // py="md"
      // px="lg"
    >
      {/* <Container size="xl"> */}
      {/* Main flex container layout separating map and scrollable right sidebar */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          height: "720px",
          alignItems: "stretch",
        }}
      >
        {/* The Map Container */}
        <Card
          shadow="sm"
          radius="md"
          p={0}
          style={{ flex: 1, position: "relative", height: "100%" }}
        >
          <div style={{ height: "100%", position: "relative" }}>
            <MapContainer
              center={[4, 38]}
              zoom={5}
              style={{ height: "100%", width: "100%", borderRadius: "12px" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Hotspots matching the image */}
              {crisesList.map((report, index) => {
                // Match custom icon configuration based on nature of crisis
                const markerIcon = createCustomCrisisIcon();

                return (
                  <React.Fragment key={index}>
                    {report.annotations?.incident_point?.geometry
                      .coordinates[0] &&
                      report.annotations?.incident_point?.geometry
                        .coordinates[1] && (
                        <Marker
                          position={[
                            report.annotations?.incident_point?.geometry
                              .coordinates[0],
                            report.annotations?.incident_point?.geometry
                              .coordinates[1],
                          ]}
                          icon={markerIcon}
                          eventHandlers={{
                            click: () => {
                              const images =
                                report.photos ||
                                (report.photos ? report.photos : []);

                              setCurrentPhotoIndex(0); // Reset index counter context
                              setSelectedCrisis({
                                name: "Dynamic Crisis Event",
                                type: "flood",
                                color: "teal",
                                lat: report.annotations?.incident_point
                                  ?.geometry.coordinates[0],
                                lng: report.annotations?.incident_point
                                  ?.geometry.coordinates[1],
                                imagesList: images,
                                rawDetails: report, // Store the entire object for detailed view
                              });
                            },
                          }}
                        >
                          {/* Changed permanent to false (removed) so tooltip shows only on hover */}
                          <Tooltip direction="top" offset={[0, -20]}>
                            {/* {crisis.crisis.name} */}
                            {"crisis.crisis.name"}
                          </Tooltip>
                        </Marker>
                      )}
                    {/* <Circle
                        center={[crisis.location.infrastructure_latitude, crisis.location.infrastructure_longitude]}
                        radius={9000}
                        color={CRISIS_CONFIG[crisis.nature_of_crisis]?.color || 'teal'}
                        fillOpacity={0.4}
                      /> */}
                  </React.Fragment>
                );
              })}
              {categorizedReports &&
                Object.keys(categorizedReports).map((key) => {
                  const items = categorizedReports[key];

                  // Safety check in case the array is empty
                  if (!items || items.length === 0) return null;

                  // GeoJSON is [lng, lat], Leaflet wants [lat, lng]
                  const lng =
                    items[0].annotations?.incident_point?.geometry
                      ?.coordinates[0];
                  const lat =
                    items[0].annotations?.incident_point?.geometry
                      ?.coordinates[1];

                  return (
                    <React.Fragment key={key}>
                      <Marker
                        // Fallback to [11.2222, 37.0] if lat/lng are missing
                        position={lat && lng ? [lat, lng] : [11.2222, 37.0]}
                        icon={createCustomCrisisIcon(items?.length)}
                        eventHandlers={{
                          click: () => {
                            setSelectedMatchGroup(key);
                          },
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -20]}>
                          {key}
                        </Tooltip>

                        {/* You can add a <Popup> here if you want info when clicked */}
                      </Marker>
                    </React.Fragment>
                  );
                })}
            </MapContainer>

            {/* {selectedCrisis && (
                <Paper
                  w={"50%"}
                  shadow="md"
                  radius="md"
                  p={0}
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 30,
                    // padding: "16px 20px",
                    zIndex: 1000,
                    background: "white",
                  }}
                >
                  <ReportDetailsView report={selectedCrisis} />
                </Paper>
              )} */}

            {selectedMatchGroup !== null && (
              <Paper
                shadow="md"
                radius="md"
                p={10}
                style={{
                  width: "50%",
                  position: "absolute",
                  top: 5,
                  right: 30,
                  // padding: "16px 20px",
                  zIndex: 1000,
                  // background: "red",
                }}
              >
                {/* <Group justify="right" wrap="nowrap" align="start"> */}

                <Stack>
                  <ScrollArea type="auto" h={250} style={{}}>
                    {selectedMatchGroup && (
                      <Stack>
                        {categorizedReports && (
                          <Stack>
                            {!categorizedReports[selectedMatchGroup] ||
                            categorizedReports[selectedMatchGroup].length ===
                              0 ? (
                              <></>
                            ) : (
                              <>
                                <Text>MATCH GROUP: {selectedMatchGroup}</Text>
                                <Stack flex={1}>
                                  {categorizedReports[selectedMatchGroup]?.map(
                                    (reportItem, index) => (
                                      <ReportCard
                                        key={index}
                                        report={reportItem}
                                        onClick={() => {
                                          setSelectedCrisis(reportItem);
                                        }}
                                      />
                                    ),
                                  )}
                                </Stack>
                              </>
                            )}
                          </Stack>
                        )}
                      </Stack>
                    )}
                  </ScrollArea>

                  {selectedCrisis && (
                    <ScrollArea type="auto" h={450} style={{}}>
                      <ReportDetailsView report={selectedCrisis} />
                    </ScrollArea>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Severity Legend */}
            <Paper
              shadow="md"
              radius="md"
              style={{
                position: "absolute",
                bottom: 30,
                left: 30,
                padding: "16px 20px",
                zIndex: 900,
                background: "white",
              }}
              maw={30}
            >
              <Text size="xs" fw={600} mb={10}>
                Severity
              </Text>
              <Stack gap={8}>
                <Group gap={10}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      background: "#ef4444",
                      borderRadius: "50%",
                    }}
                  />
                  <Text size="sm">High • 86</Text>
                </Group>
                <Group gap={10}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      background: "#f59e0b",
                      borderRadius: "50%",
                    }}
                  />
                  <Text size="sm">Medium • 142</Text>
                </Group>
                <Group gap={10}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      background: "#14b8a6",
                      borderRadius: "50%",
                    }}
                  />
                  <Text size="sm">Low • 218</Text>
                </Group>
              </Stack>
            </Paper>
          </div>
        </Card>
      </div>
      {/* </Container> */}
    </Box>
  );
}
