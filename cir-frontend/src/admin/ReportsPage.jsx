import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Text,
  Group,
  Button,
  ActionIcon,
  Box,
  Divider,
  Select,
  Table,
  Avatar,
  Stack,
  Pagination,
  Drawer,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDownload,
  IconBell,
  IconMapPin,
  IconChevronDown,
  IconPlus,
  IconCalendar,
  IconInfoCircle,
} from "@tabler/icons-react";
import { getNearestCity } from "offline-geocode-city";
import { COLORS, SEVERITY_CONFIG } from "../utils";
import { HeaderCardPage } from "./adminPage";
import api from "../api";
import { QuestionGroupModal } from "../QuestionGroupModal";

export function ReportsPage() {
  const dateOptions = [
    { 1: "Today" },
    { 2: "Yesterday" },
    { 7: "Last 7 days" },
    { 30: "Last 30 days" },
    { 365: "This year" },
  ];

  const formattedData = dateOptions.map((item) => {
    const [key, text] = Object.entries(item)[0] || ["7", "Last 7 days"];
    return { value: String(key), label: text };
  });

  const [selectedDateRange, setSelectedDateRange] = useState(formattedData[2]?.value || "7");
  const [crisesReportList, setCrisesReportList] = useState([]);

  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get("/impact-reports/");
        const incomingData = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];
        setCrisesReportList(incomingData);
      } catch (error) {
        console.error("Error fetching crises:", error);
        setCrisesReportList([]);
      }
    };
    fetchCrises();
  }, []);

  return (
    <Box bg={COLORS.lightBackground} minHeight="100vh" py="md" px="lg">
      <Container size="xl">
        <Group justify="space-between" mb="xl">
          <Group>
            <Text size="xs" c="dimmed" fw={700} lts={1}>UNDP</Text>
            <Text size="xl" fw={700} c={COLORS.darkBlue} style={{ marginTop: -5 }}>Reports</Text>
          </Group>

          <Group gap="md">
            <Select
              placeholder="Select date range"
              defaultValue={selectedDateRange}
              data={formattedData}
              onChange={(value) => setSelectedDateRange(value)}
              rightSection={<IconChevronDown size={14} />}
              radius="md"
              w={130}
            />
            <Button bg={COLORS.primaryTeal} leftSection={<IconDownload size={16} />} radius="md">
              Export
            </Button>
            <ActionIcon variant="default" size="lg" radius="md">
              <IconBell size={18} stroke={1.5} />
            </ActionIcon>
            <Divider orientation="vertical" />
            <Group gap="xs">
              <Avatar color="blue" radius="xl">KS</Avatar>
              <Box>
                <Text size="sm" fw={600}>Karim S.</Text>
                <Text size="xs" c="dimmed">Responder - KE</Text>
              </Box>
            </Group>
          </Group>
        </Group>

        <HeaderCardPage />
        <ReportDataTablePage crisesReportList={crisesReportList} />
      </Container>
    </Box>
  );
}

export function ReportDataTablePage({ crisesReportList }) {
  const [activePage, setActivePage] = useState(1);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Modal disclosures for Question System Configuration Modal
  const [opened, { open, close }] = useDisclosure(false);

  // Drawer disclosures for the Side-Detail panel View
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const [selectedReport, setSelectedReport] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // Safe wrapper parsing methodology logic to safely resolve getNearestCity object types
  const renderValidatedCity = (report) => {
    const coords = report?.annotations?.incident_point?.geometry?.coordinates;

    let lng = coords?.[1];
    let lat = coords?.[0];

    if (lat === undefined || lng === undefined) {
      lat = report?.location?.latitude ?? report?.latitude;
      lng = report?.location?.longitude ?? report?.longitude;
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      const DEFAULT_LAT = 8.9806;
      const DEFAULT_LNG = 38.7578;
      const fallbackResult = getNearestCity(DEFAULT_LNG, DEFAULT_LAT);
      return fallbackResult?.cityName || "Addis Ababa (Default)";
    }

    const result = getNearestCity(parsedLng, parsedLat);
    return result?.cityName || "Unknown Region";
  };

  // Triggers whenever a table row line block item is focused
  const handleRowClickTrigger = (report) => {
    setSelectedReport(report);
    openDrawer();
  };

  // Dedicated workflow execution button mapping anchor override
  const handleActionModalTrigger = (e, report) => {
    e.stopPropagation(); // Stops row drawer panel collection framework from overlaying
    setSelectedReport(report);
    open();
  };

  const dynamicSeverities = Array.from(
    new Set((crisesReportList || []).map((row) => row?.damage_severity).filter(Boolean))
  );

  const dynamicRegions = Array.from(
    new Set((crisesReportList || []).map((row) => row?.location?.city).filter(Boolean))
  );

  const filteredData = (crisesReportList || []).filter((row) => {
    const matchesSeverity = selectedSeverity ? row?.damage_severity?.toLowerCase() === selectedSeverity.toLowerCase() : true;
    const matchesRegion = selectedRegion ? row?.location?.city?.toLowerCase() === selectedRegion.toLowerCase() : true;
    return matchesSeverity && matchesRegion;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card padding="lg" radius="lg" shadow="xs">
      <Group justify="space-between" mb="xl">
        <Box><Text fw={700} size="lg" c={COLORS.darkBlue}>Recent Reports</Text></Box>
        <Group gap="xs">
          <Select placeholder="All severities" data={dynamicSeverities} value={selectedSeverity} onChange={(v) => { setSelectedSeverity(v); setActivePage(1); }} clearable w={140} radius="md" size="xs" />
          <Select placeholder="All regions" data={dynamicRegions} value={selectedRegion} onChange={(v) => { setSelectedRegion(v); setActivePage(1); }} clearable w={140} radius="md" size="xs" />
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th><Text size="xs" c="dimmed" fw={700}>INFRASTRUCTURE NAME</Text></Table.Th>
              <Table.Th><Text size="xs" c="dimmed" fw={700}>LOCATION</Text></Table.Th>
              <Table.Th><Text size="xs" c="dimmed" fw={700}>SEVERITY</Text></Table.Th>
              <Table.Th ta="right"><Text size="xs" c="dimmed" fw={700}>Updated</Text></Table.Th>
              <Table.Th ta="right"><Text size="xs" c="dimmed" fw={700}>ACTIONS</Text></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((report) => (
                <Table.Tr key={report?.id} onClick={() => handleRowClickTrigger(report)} style={{ cursor: "pointer" }}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm" fw={700} c={COLORS.darkBlue}>{report?.infrastructure_name || "N/A"}</Text>
                      <Text size="xs" c="dimmed">{report?.infrastructure_type?.includes("(") ? report?.infrastructure_type.split("(")[0] : report?.infrastructure_type}</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} c="dimmed">
                      <IconMapPin size={14} />
                      <Text size="sm">{renderValidatedCity(report)}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={SEVERITY_CONFIG[report?.damage_severity?.toLowerCase()]?.color || "gray"}>
                      {report?.damage_severity}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    {report?.damage_datetime ? new Date(report.damage_datetime).toLocaleDateString() : "N/A"}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Button
                      size="xs" variant="light" color="teal" radius="md" leftSection={<IconPlus size={12} />}
                      onClick={(e) => handleActionModalTrigger(e, report)}
                    >
                      Add Question
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr><Table.Td colSpan={5} ta="center" py="xl"><Text c="dimmed" size="sm">No records found.</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {totalPages > 1 && (
        <Group justify="flex-end" mt="xl">
          <Pagination total={totalPages} value={activePage} onChange={setActivePage} radius="md" withEdges />
        </Group>
      )}

      {/* Dynamic Row Detail Inspector Side-Drawer Interface */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={<Text style={{ color: COLORS.darkBlue, fontWeight: 700, fontSize: "18px" }}>Impact Incident Deep View</Text>}
        position="right"
        size="md"
        padding="xl"
      >
        {selectedReport && (
          <Stack gap="lg" pt="md">
            <Box p="md" style={{ backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
              <Text size="xs" c="dimmed" fw={700} lts={1}>INFRASTRUCTURE NAME</Text>
              <Text size="lg" fw={700} c={COLORS.darkBlue} mt={2}>{selectedReport?.infrastructure_name || "N/A"}</Text>
              <Text size="xs" c="dimmed" mt={4}>Type: {selectedReport?.infrastructure_type || "General Asset Structure"}</Text>
            </Box>

            <Group justify="space-between" wrap="nowrap">
              <Box>
                <Group gap={6} c="dimmed" mb={4}><IconMapPin size={14} /><Text size="xs" fw={700} lts={0.5}>GEOGRAPHIC CITY</Text></Group>
                <Text size="sm" fw={600} c="#334155">{renderValidatedCity(selectedReport)}</Text>
              </Box>
              <Box ta="right">
                <Text size="xs" c="dimmed" fw={700} lts={0.5} mb={4}>DAMAGE SEVERITY</Text>
                <Badge color={SEVERITY_CONFIG[selectedReport?.damage_severity?.toLowerCase()]?.color || "gray"} size="md" radius="sm">
                  {selectedReport?.damage_severity || "Unknown"}
                </Badge>
              </Box>
            </Group>

            <Divider color="#F1F5F9" />

            <Stack gap="xs">
              <Group gap={6} c="dimmed"><IconCalendar size={14} /><Text size="xs" fw={700}>TIMESTAMP LOGGED</Text></Group>
              <Text size="sm" c="#334155">
                {selectedReport?.damage_datetime ? new Date(selectedReport.damage_datetime).toLocaleString() : "No timestamp associated"}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Group gap={6} c="dimmed"><IconInfoCircle size={14} /><Text size="xs" fw={700}>CRISIS LOCATION</Text></Group>
              <Text size="sm" c="#475569" style={{ lineHeight: 1.5 }}>
                {renderValidatedCity(selectedReport)} <code style={{ backgroundColor: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>[{selectedReport?.annotations?.incident_point?.geometry?.coordinates[0].toFixed(3)}, {selectedReport?.annotations?.incident_point?.geometry?.coordinates[1].toFixed(3)}]</code>

              </Text>
            </Stack>

            <Box mt="xl">
              <Button
                fullWidth color="teal" variant="light" radius="md" leftSection={<IconPlus size={16} />}
                onClick={(e) => {
                  closeDrawer();
                  handleActionModalTrigger(e, selectedReport);
                }}
              >
                Add Survery Questions
              </Button>
            </Box>
          </Stack>
        )}
      </Drawer>

      {/* Main configuration questionnaire workflow injection modal overlay context structure */}
      <QuestionGroupModal
        opened={opened}
        onClose={close}
        report={selectedReport}
      />
    </Card>
  );
}