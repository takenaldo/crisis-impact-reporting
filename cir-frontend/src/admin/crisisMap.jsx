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
import L, { divIcon, icon } from "leaflet";
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
import EnterprisePDFViewer from "./ReportDocument";

// 1. A function that accepts a dynamic variable and generates the icon
const createNumberedIcon = (number = null, isSelected = false) => {
  const fillColor = isSelected ? "var(--color-amber)" : "navy";
  const dynamicSvgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40" z-index="9999">
      <path fill="${fillColor}" d="M 24 10 C 17.5 10 13 15 13 20.5 C 13 27 24 36 24 36 C 24 36 35 27 35 20.5 C 35 15 30.5 10 24 10 Z" />
      <circle cx="24" cy="19" r="4" fill="white" />
      ${number
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
      : ""
    }
    </svg>
  `;

  return divIcon({
    html: dynamicSvgString,
    className: "custom-leaflet-svg-icon",
    iconSize: [40, 40],
    iconAnchor: [24, 36],
    popupAnchor: [0, -26],
  });
};

const createSelectedIcon = (type) => {
  const fillColor = type === "report" ? "red" : "red";
  const dynamicSvgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <path fill="${fillColor}" d="M 24 10 C 17.5 10 13 15 13 20.5 C 13 27 24 36 24 36 C 24 36 35 27 35 20.5 C 35 15 30.5 10 24 10 Z" />
      <circle cx="24" cy="19" r="4" fill="white" />
      
    </svg>
  `;

  return divIcon({
    html: dynamicSvgString,
    className: "custom-leaflet-svg-icon",
    iconSize: [40, 40],
    iconAnchor: [24, 36],
    popupAnchor: [0, -26],
  });
};

const createCustomCrisisIcon = (reportCount) => {
  return createNumberedIcon(reportCount);
};

function MapRecenter({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.5,
    });
  }, [center, zoom, map]);

  return null;
}

export function CrisisMapPage() {
  const [reportsList, setReportsList] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedMatchGroup, setSelectedMatchGroup] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [categorizedReports, setCategorizedreports] = useState(null);

  const center_lat =
    selectedReport?.annotations?.incident_point?.geometry?.coordinates[1] ||
    11.58; // Using valid Ethiopia default
  const center_lng =
    selectedReport?.annotations?.incident_point?.geometry?.coordinates[0] ||
    37.38; // Using valid Ethiopia default
  const zoom = selectedReport?.annotations?.incident_point?.geometry
    ?.coordinates
    ? 13
    : 5;

  const ReportMarker = ({ report, index, matchGroup }) => {
    const markerIcon = createCustomCrisisIcon();
    const coords = report?.annotations?.incident_point?.geometry?.coordinates;

    // Safety check: Don't render marker if coordinates are null
    if (!coords || coords.length < 2) return null;

    const lng = coords[0];
    const lat = coords[1];

    let icon;

    if (report?.id === selectedReport?.id) {
      icon = createSelectedIcon("report");
    } else if (matchGroup === selectedMatchGroup) {
      icon = createSelectedIcon("matchGroup");
    } else {
      icon = createCustomCrisisIcon();
    }

    return (
      <Marker
        zIndexOffset={report?.id === selectedReport?.id ? 1000 : 0}
        position={[lat, lng]}
        icon={icon}
        // icon={
        //   report?.id === selectedReport?.id
        //     ? createSelectedIcon("report")
        //     : createCustomCrisisIcon()
        // }
        eventHandlers={{
          click: () => {
            setCurrentPhotoIndex(0);
            setSelectedReport(report);
            setSelectedMatchGroup(null);
          },
        }}
      >
        <Tooltip direction="top" offset={[0, -20]}>
          {index} -{" "}
          {report?.infrastructure_name || "Unidentified Infrastructure"}
        </Tooltip>
      </Marker>
    );
  };

  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get("/impact-reports/");
        setReportsList(response.data);
        setCategorizedreports(getCategorizeReports([...response.data]));
      } catch (error) {
        console.error("Error fetching crises:", error);
      }
    };

    fetchCrises();
  }, []);

  return (
    <Box bg="red" minHeight="100vh">
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "stretch",
        }}
      >
        <Card
          shadow="sm"
          radius="md"
          p={0}
          h={"100vh"}
          style={{ flex: 1, position: "relative", height: "100%" }}
          bg={"red"}
        >
          <div style={{ height: "100%", position: "relative" }}>
            <MapContainer
              center={[center_lat, center_lng]}
              zoom={zoom}
              style={{
                height: "100%",
                width: "100%",
                borderRadius: "12px",
                zIndex: 1,
              }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {selectedReport && (
                <React.Fragment key={selectedReport?.id}>
                  <ReportMarker
                    report={selectedReport}
                    index={"SE"}
                  // latlng={[37.359, 11.604]}
                  />
                </React.Fragment>
              )}

              {categorizedReports &&
                Object.keys(categorizedReports).map((key) => {
                  const items = categorizedReports[key];

                  if (!items || items.length === 0) return null;

                  if (key === "No Match") {
                    // Added return statement and React fragment keys
                    return items.map((report, index) => (
                      <React.Fragment key={report.id || `unmatched-${index}`}>
                        <ReportMarker report={report} index={"UN: " + index} />
                      </React.Fragment>
                    ));
                  }

                  const coords =
                    items[0]?.annotations?.incident_point?.geometry
                      ?.coordinates;
                  const lng = coords ? coords[0] : null;
                  const lat = coords ? coords[1] : null;

                  return (
                    <React.Fragment key={key}>
                      <Marker
                        //   position={items[0]?.annotations?.incident_point?.geometry
                        // ?.coordinates[1], items[0]?.annotations?.incident_point?.geometry
                        // ?.coordinates[0]}

                        position={lat && lng ? [lat, lng] : [11.2222, 37.0]}
                        zIndexOffset={9999}
                        icon={createNumberedIcon(
                          items.length,
                          selectedMatchGroup === key,
                        )}
                        // icon={createCustomCrisisIcon(items.length)}
                        eventHandlers={{
                          click: () => {
                            setSelectedMatchGroup(key);
                            setSelectedReport(null);
                          },
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -20]}>
                          {key}
                        </Tooltip>
                      </Marker>

                      {key === selectedMatchGroup &&
                        categorizedReports[key].slice(1).map((r, index) => (
                          <React.Fragment key={r.id + `matched-${index}`}>
                            <ReportMarker
                              report={r}
                              index={"MA: " + index}
                              matchGroup={key}
                            />
                          </React.Fragment>
                        ))}
                    </React.Fragment>
                  );
                })}
              {selectedReport !== null && (
                <MapRecenter center={[center_lat, center_lng]} zoom={zoom} />
              )}
            </MapContainer>

            {(selectedMatchGroup || selectedReport) && (
              <Paper
                shadow="md"
                radius="md"
                p={10}
                style={{
                  width: "50%",
                  height: "auto",
                  position: "absolute",
                  top: 5,
                  right: 30,
                  zIndex: 1000,
                }}
              >
                <Group justify="right" wrap="nowrap" align="start">
                  <ActionIcon
                    variant="outline"
                    c={"var(--color-gray)"}
                    onClick={() => {
                      setSelectedMatchGroup(null);
                      setSelectedReport(null);
                    }}
                  >
                    X
                  </ActionIcon>
                </Group>
                <Stack>
                  {selectedMatchGroup && (
                    <ScrollArea type="auto" h={250}>
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
                                        key={reportItem.id || index}
                                        report={reportItem}
                                        onClick={() => {
                                          setSelectedReport(reportItem);
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
                    </ScrollArea>
                  )}

                  {selectedReport !== null && (
                    <ScrollArea type="auto" h={"80vh"}>
                      <ReportDetailsView report={selectedReport} />
                    </ScrollArea>
                  )}
                </Stack>
              </Paper>
            )}
          </div>
        </Card>
      </div>
    </Box>
  );
}
