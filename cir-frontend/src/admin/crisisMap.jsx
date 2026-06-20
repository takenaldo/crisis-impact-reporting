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
  useMap,
} from "react-leaflet";
import L, { divIcon } from "leaflet";
import {
  CRISIS_CONFIG,
  SEVERITY_CONFIG,
  COLORS,
  getCategorizeReports,
  swapAnnotationPointCoords,
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

const createCustomCrisisIcon = (reportCount) => {
  return createNumberedIcon(reportCount);
};

function MapRecenter({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    // This smoothly pan/zooms the map when coordinates change
    map.flyTo(center, zoom, {
      duration: 1.5, // seconds
    });
  }, [center, zoom, map]);

  return null;
}

export function CrisisMapPage() {
  const [crisesList, setCrisesList] = useState([]);

  // State to manage the selected marker's information
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [selectedMatchGroup, setSelectedMatchGroup] = useState(null);

  // Track the active picture index in the slider
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [categorizedReports, setCategorizedreports] = useState(null);

  const center_lat = selectedCrisis?.location?.infrastructure_latitude || 4;
  const center_lng = selectedCrisis?.location?.infrastructure_longitude || 38;
  const zoom = selectedCrisis?.location?.infrastructure_latitude ? 13 : 5;

  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get("/impact-reports/");
        const reports = response.data.map(r => ({
          ...r,
          annotations: swapAnnotationPointCoords(r.annotations),
        }));
        setCrisesList(reports);
        console.log("Fetched crises:", reports);
        setCategorizedreports(
          getCategorizeReports([
            ...reports,
          ]),
        );
      } catch (error) {
        console.error("Error fetching crises:", error);
      }
    };

    fetchCrises();
  }, []);

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
              center={[center_lat, center_lng]}
              zoom={zoom}
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
                  if (key === "No Match") return <></>;
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

              <MapRecenter center={[center_lat, center_lng]} zoom={zoom} />
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
                                <Badge
                                  variant="outline"
                                  c={"var(--color-navy)"}
                                >
                                  {selectedMatchGroup}
                                </Badge>
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
