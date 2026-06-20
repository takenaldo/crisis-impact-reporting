import React, { useCallback, useEffect, useState } from "react";
import {
  Group,
  Text,
  ActionIcon,
  Paper,
  Box,
  Button,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import { IconMapPinFilled, IconX, IconArrowRight } from "@tabler/icons-react";
import ImpactReportForm from "./ImpactReportForm";
import { useTranslation } from "react-i18next";
import ReportDetailsDrawer from "./ReportDetailsDrawer";

import { t } from "i18next";
import CirMap from "./map/CirMap";
import api from "./api";
import ReportCard from "./ReportCard";
import { Navigate, useNavigate } from "react-router-dom";
import { getUserDetails } from "./utils";
import CIRUserFormModal from "./CIRUserFormModal";

// Design System Colors
const COLORS = {
  navy: "#0D3B66",
  teal: "#009C9A",
  redOrange: "#E76F51",
  amber: "#F4A261",
  mint: "#E6F4F1",
  gray: "#868E96",
};

export default function Home({ setActiveContent }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapBounds, setMapBounds] = useState({ maxBounds: null, minZoom: 2 });

  const [selectedReport, setSelectedReport] = useState(null);

  const handleLocated = useCallback(async (location, fromGPS) => {
    setUserLocation(location);
    if (!fromGPS) return;
    try {
      const res = await api.post("map/bbox/", {
        latitude: location.latitude,
        longitude: location.longitude,
      });
      const { min_lng, min_lat, max_lng, max_lat } = res.data.bbox;
      const lngSpan = max_lng - min_lng;
      const minZoom = Math.ceil(
        Math.log2(((window.innerWidth || 400) * 360) / (256 * lngSpan))
      );
      setMapBounds({
        maxBounds: [
          [min_lat, min_lng],
          [max_lat, max_lng],
        ],
        minZoom: Math.max(2, minZoom),
      });
    } catch {
      // bbox fetch failed  map stays unconstrained
    }
  }, []); // setUserLocation, setMapBounds, and api are all stable references

  const [crisesList, setCrisesList] = useState([]);
  const [reports, setReports] = useState([]);

  // useEffect(() => {
  //   const fetchCrises = async () => {
  //     try {
  //       const response = await api.get("/crises/");
  //       setCrisesList(response.data);
  //       console.log("Fetched crises:", response.data);
  //     } catch (error) {
  //       console.error("Error fetching crises:", error);
  //     }
  //   };

  //   const fetchUnmappedImppactReports = async () => {
  //     //
  //     try {
  //       const response = await api.get(
  //         "/impact-reports/get_unmapped_imapct_reports/",
  //       );
  //       setReports(response.data);
  //     } catch (error) {
  //       console.error("Error fetching reports:", error);
  //     }
  //   };
  //   fetchCrises();
  //   fetchUnmappedImppactReports();
  // }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (getUserDetails() !== null) {
          const response = await api.get("impact-reports/get_user_reports/");

          setReports(response.data);
        } else {
          const reportIDs = JSON.parse(
            localStorage.getItem("report_ids") || "[]"
          );
          const response = await api.post(
            "impact-reports/get_reports_by_stored_ids/",
            {
              report_ids: reportIDs,
            }
          );
          setReports(response.data);
        }
      } catch (error) {}
    };

    fetchUserDetails();
  }, []);

  return (
    <Box>
      <CIRUserFormModal />
      <Stack gap={5}>
        {/* Info Banner */}
        <Paper bg={COLORS.mint} radius="md" p="md">
          <Group align="flex-start" wrap="nowrap">
            <ThemeIcon color={COLORS.teal} radius="xl" size="md">
              <IconMapPinFilled size={16} />
            </ThemeIcon>
            <Text fz="sm" fw={500} c={COLORS.navy} style={{ flex: 1 }}>
              {t("participant_help_announcement")}
            </Text>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Paper>

        {/* Action Button */}
        <Button
          fullWidth
          size="xl"
          radius="xl"
          bg={COLORS.navy}
          rightSection={<IconArrowRight size={20} />}
          styles={{
            root: { height: "64px" },
            label: {
              fontSize: "18px",
              fontFamily: "Montserrat",
              fontWeight: 700,
            },
            section: {
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              padding: "6px",
            },
          }}
          onClick={() => {
            setShowReportForm(true);
          }}
        >
          {t("report_damage")}
        </Button>

        {/* Map Area Placeholder */}
        <Box
          style={{
            minHeight: 300,
            height: "50vh", // Scales with screen height
            maxHeight: 400,
            backgroundColor: "#e3e1d3",
            borderRadius: "16px",
            position: "relative",
            overflow: "hidden",
            backgroundImage: "radial-gradient(#d5d2c1 2px, transparent 2px)",
            backgroundSize: "30px 30px",
          }}
        >
          {!showReportForm && !selectedReport && (
            <CirMap
              autoLocate
              center={[9.032, 38.7486]}
              zoom={2}
              height="100%"
              onLocated={handleLocated}
              maxBounds={mapBounds.maxBounds}
              minZoom={mapBounds.minZoom}
            />
          )}
        </Box>
      </Stack>

      {/* RECENT REPORTS SECTION */}
      <Box mt="xl" pb="xl">
        <Group justify="space-between" mb="sm">
          <Text
            fz="lg"
            fw={700}
            c={COLORS.navy}
            style={{ fontFamily: "Montserrat" }}
          >
            {t("recent_reports")}
          </Text>
          <Text
            fz="sm"
            fw={600}
            c={COLORS.teal}
            style={{ cursor: "pointer" }}
            onClick={() => {
              console.log("lll");
              // navigate("/my_reports");
              setActiveContent("MY_REPORTS");
            }}
          >
            {t("view_all")}
          </Text>
        </Group>

        <Stack gap="sm">
          {reports.slice(0, 3).map((report) => (
            <ReportCard
              key={report.id}
              title={
                report?.infrastructure_type + " " + report?.infrastructure_name
              }
              time={
                report?.damage_datetime
                  ? String(report?.damage_datetime).split("T")[0]
                  : "Unknown Date Time"
              }
              status="Submitted"
              report={report}
              onClick={() => {
                setSelectedReport(report);
              }}
            />
          ))}
        </Stack>
      </Box>

      <ImpactReportForm
        opened={showReportForm}
        onClose={() => setShowReportForm(false)}
        userLocation={userLocation}
      />
      {}
      <ReportDetailsDrawer
        opened={selectedReport !== null}
        onClose={() => {
          setSelectedReport(null);
        }}
        report={selectedReport}
      />
    </Box>
  );
}
