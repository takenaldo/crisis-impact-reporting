import React, { useEffect, useState } from "react";
import {
  Group,
  Text,
  ActionIcon,
  Paper,
  Box,
  Button,
  Stack,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import {
  IconMapPinFilled,
  IconX,
  IconPlus,
  IconMinus,
  IconCurrentLocation,
  IconArrowRight,
  IconHome,
} from "@tabler/icons-react";
import ImpactReportForm from "./ImpactReportForm";
import { useTranslation } from "react-i18next";
import { getSeverityColor, timeAgo } from "./utils";
import ReportDetailsDrawer from "./ReportDetailsDrawer";

import { t } from "i18next";
import MapComponent from "./MapComponent";
import api from "./api";
import MapView from "./MapView";

// Design System Colors
const COLORS = {
  navy: "#0D3B66",
  teal: "#009C9A",
  redOrange: "#E76F51",
  amber: "#F4A261",
  mint: "#E6F4F1",
  gray: "#868E96",
};

export default function Home() {
  const { t } = useTranslation();

  const [showReportForm, setShowReportForm] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);

  const [crisesList, setCrisesList] = useState([]);
  const [unmappedReports, setUnamppedReports] = useState([]);

  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get("/crises/");
        setCrisesList(response.data);
        console.log("Fetched crises:", response.data);
      } catch (error) {
        console.error("Error fetching crises:", error);
      }
    };

    const fetchUnmappedImppactReports = async () => {
      //
      try {
        const response = await api.get(
          "/impact-reports/get_unmapped_imapct_reports/",
        );
        setUnamppedReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchCrises();
    fetchUnmappedImppactReports();
  }, []);

  return (
    <Box>
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
          {/* <MapView /> */}
          <MapComponent selectEnabled={false} />
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
          <Text fz="sm" fw={600} c={COLORS.teal} style={{ cursor: "pointer" }}>
            {t("view_all")}
          </Text>
        </Group>

        <Stack gap="sm">
          {unmappedReports.map((report) => (
            // <ReportCardOld key={report.id} crisis={report} />
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

// Helper Component for Report Cards
function ReportCard({ title, report, onClick }) {
  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      style={{ borderColor: "#E9ECEF" }}
      onClick={onClick}
    >
      <Group wrap="nowrap" align="center">
        <ThemeIcon size={46} radius="xl" bg={COLORS.mint} c={COLORS.teal}>
          <IconHome size={22} stroke={1.5} />
        </ThemeIcon>

        <Box style={{ flex: 1 }}>
          <Text fz="sm" fw={600} c={COLORS.navy} lh={1.2} lineClamp={3}>
            {(report?.infrastructure_name + " - " || "") +
              report?.infrastructure_type}
          </Text>
          <Text fz="xs" c={COLORS.gray} mt={4}>
            {report?.damage_datetime && timeAgo(report?.damage_datetime)}
          </Text>
        </Box>

        <Badge
          variant="light"
          size="md"
          radius="sm"
          style={{
            textTransform: "none",
            fontWeight: 500,
            backgroundColor: COLORS.mint,

            color: "var(" + getSeverityColor(report?.damage_severity) + ")",
          }}
        >
          {t(report?.damage_severity)}
        </Badge>
      </Group>
    </Paper>
  );
}
