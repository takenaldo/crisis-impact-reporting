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
  Title,
  SimpleGrid,
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
  IconUser,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { getNearestCity } from "offline-geocode-city";
import { COLORS, SEVERITY_CONFIG, timeAgo } from "../utils";
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
    <Box bg={COLORS.lightBackground} style={{ minHeight: "100vh" }} py="md" px="lg">
      <Container size="xl">
        {/* Professional Top Header */}
        <Card shadow="sm" withBorder radius="lg" mb="xl" p="lg">
          <Group justify="space-between" align="center">
            <Group>
              <Text size="xs" c="dimmed" fw={700} lts={1}>UNDP</Text>
              <Title order={3} fw={700} c={COLORS.darkBlue} style={{ marginTop: -4 }}>
                Impact Reports
              </Title>
            </Group>

            <Group gap="md">
              <Select
                placeholder="Select date range"
                defaultValue={selectedDateRange}
                data={formattedData}
                onChange={(value) => setSelectedDateRange(value)}
                rightSection={<IconChevronDown size={14} />}
                radius="md"
                w={160}
                size="sm"
              />
              <Button
                bg={COLORS.primaryTeal}
                leftSection={<IconDownload size={16} />}
                radius="md"
                size="sm"
              >
                Export Reports
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
        </Card>

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

  const [opened, { open, close }] = useDisclosure(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const ITEMS_PER_PAGE = 10;

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

  const safeString = (value) => {
    if (value == null) return "N/A";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (typeof value === "object") {
      if (value?.user) return value.user;
      return JSON.stringify(value);
    }
    return String(value);
  };

  const handleRowClickTrigger = (report) => {
    setSelectedReport(report);
    openDrawer();
  };

  const handleActionModalTrigger = (e, report) => {
    e.stopPropagation();
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
    const matchesSeverity = selectedSeverity
      ? row?.damage_severity?.toLowerCase() === selectedSeverity.toLowerCase()
      : true;
    const matchesRegion = selectedRegion
      ? row?.location?.city?.toLowerCase() === selectedRegion.toLowerCase()
      : true;
    return matchesSeverity && matchesRegion;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;

  // Fix pagination when filters change or data updates
  useEffect(() => {
    if (activePage > totalPages && totalPages > 0) {
      setActivePage(1);
    }
  }, [filteredData.length, totalPages, activePage]);

  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card padding="xl" radius="lg" shadow="sm" withBorder>
      <Group justify="space-between" mb="xl">
        <Title order={4} fw={700} c={COLORS.darkBlue}>Recent Reports</Title>
        <Group gap="sm">
          <Select
            placeholder="All severities"
            data={dynamicSeverities}
            value={selectedSeverity}
            onChange={(v) => {
              setSelectedSeverity(v);
              setActivePage(1);
            }}
            clearable
            w={160}
            radius="md"
            size="sm"
          />
          <Select
            placeholder="All regions"
            data={dynamicRegions}
            value={selectedRegion}
            onChange={(v) => {
              setSelectedRegion(v);
              setActivePage(1);
            }}
            clearable
            w={160}
            radius="md"
            size="sm"
          />
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={900}>
        <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th><Text size="xs" c="dimmed" fw={700} tt="uppercase">Infrastructure</Text></Table.Th>
              <Table.Th><Text size="xs" c="dimmed" fw={700} tt="uppercase">Location</Text></Table.Th>
              <Table.Th><Text size="xs" c="dimmed" fw={700} tt="uppercase">Severity</Text></Table.Th>
              <Table.Th ta="right"><Text size="xs" c="dimmed" fw={700} tt="uppercase">Updated</Text></Table.Th>
              <Table.Th ta="right" w={140}><Text size="xs" c="dimmed" fw={700} tt="uppercase">Actions</Text></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((report) => (
                <Table.Tr
                  key={report?.id}
                  onClick={() => handleRowClickTrigger(report)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Td>
                    <Stack gap={3}>
                      <Text size="sm" fw={600} c={COLORS.darkBlue}>
                        {report?.infrastructure_name || "N/A"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {report?.infrastructure_type?.includes("(")
                          ? report?.infrastructure_type.split("(")[0]
                          : report?.infrastructure_type || "—"}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <IconMapPin size={16} color="#64748b" />
                      <Text size="sm">{renderValidatedCity(report)}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={SEVERITY_CONFIG[report?.damage_severity?.toLowerCase()]?.color || "gray"}
                      variant="light"
                      radius="md"
                      size="md"
                    >
                      {report?.damage_severity || "Unknown"}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" c="dimmed">
                      {report?.damage_datetime
                        ? new Date(report.damage_datetime).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Button
                      size="xs"
                      variant="light"
                      color="teal"
                      radius="md"
                      leftSection={<IconPlus size={14} />}
                      onClick={(e) => handleActionModalTrigger(e, report)}
                    >
                      Add Question
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5} ta="center" py="xl">
                  <Text c="dimmed" size="sm">No records found.</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {totalPages > 1 && (
        <Group justify="flex-end" mt="xl">
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={setActivePage}
            radius="md"
            withEdges
            size="sm"
          />
        </Group>
      )}

      {/* Enhanced Professional Detail Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="right"
        size="lg"
        padding={0}
        title={null}
      >
        {selectedReport && (
          <Box style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Box p="xl" style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#fff" }}>
              <Group justify="space-between" align="center">
                <Box>
                  <Title order={4} c={COLORS.darkBlue}>Impact Incident Details</Title>
                  <Text size="xs" c="dimmed" mt={4}>
                    {timeAgo(selectedReport.damage_datetime)}
                  </Text>
                </Box>
                <Badge
                  color={SEVERITY_CONFIG[selectedReport?.damage_severity?.toLowerCase()]?.color || "gray"}
                  size="lg"
                  radius="md"
                  variant="filled"
                >
                  {selectedReport?.damage_severity || "Unknown"}
                </Badge>
              </Group>
            </Box>

            <Box p="xl" style={{ flex: 1, overflow: "auto" }}>
              <Stack gap="xl">
                {/* Infrastructure */}
                <Card withBorder radius="md" padding="lg" bg="#f8fafc">
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase" mb={8}>Infrastructure Asset</Text>
                  <Text size="xl" fw={700} c={COLORS.darkBlue}>
                    {selectedReport?.infrastructure_name || "Unnamed Asset"}
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    {selectedReport?.infrastructure_type || "General Infrastructure"}
                  </Text>
                </Card>

                <SimpleGrid cols={2} spacing="lg">
                  {/* Location */}
                  <Card withBorder radius="md" padding="lg">
                    <Group gap={8} mb={12}>
                      <IconMapPin size={20} color="#64748b" />
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase">Location</Text>
                    </Group>
                    <Text size="lg" fw={600} mb={6}>
                      {renderValidatedCity(selectedReport)}
                    </Text>
                    <Text size="sm" style={{ fontFamily: "monospace", color: "#475569" }}>
                      {selectedReport?.annotations?.incident_point?.geometry?.coordinates?.[0]?.toFixed(4) || "—"},&nbsp;
                      {selectedReport?.annotations?.incident_point?.geometry?.coordinates?.[1]?.toFixed(4) || "—"}
                    </Text>
                  </Card>

                  {/* Reported By */}
                  <Card withBorder radius="md" padding="lg">
                    <Group gap={8} mb={12}>
                      <IconUser size={20} color="#64748b" />
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase">Reported By</Text>
                    </Group>
                    <Text size="sm" fw={600}>
                      {safeString(selectedReport?.reported_by?.user || "")}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {selectedReport?.organization || "UNDP Local Team"}
                    </Text>
                  </Card>
                </SimpleGrid>

                <Divider />

                {/* Impact Assessment */}
                <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="md">Impact Assessment</Text>
                  <Stack gap="md">
                    {selectedReport?.damage_description && (
                      <Box>
                        <Text size="xs" c="dimmed" fw={700} mb={6}>Damage Description</Text>
                        <Text size="sm" style={{ lineHeight: 1.6 }}>
                          {selectedReport.damage_description}
                        </Text>
                      </Box>
                    )}

                    {selectedReport?.impact_notes && (
                      <Box>
                        <Text size="xs" c="dimmed" fw={700} mb={6}>Impact Notes</Text>
                        <Text size="sm" style={{ lineHeight: 1.6 }}>
                          {selectedReport.impact_notes}
                        </Text>
                      </Box>
                    )}

                    <SimpleGrid cols={2} spacing="md">
                      {selectedReport?.affected_population && (
                        <Box>
                          <Text size="xs" c="dimmed" fw={700}>Affected Population</Text>
                          <Text size="lg" fw={700} c={COLORS.darkBlue}>
                            {selectedReport.affected_population}
                          </Text>
                        </Box>
                      )}
                      {selectedReport?.estimated_cost && (
                        <Box>
                          <Text size="xs" c="dimmed" fw={700}>Estimated Cost</Text>
                          <Text size="lg" fw={700} c={COLORS.darkBlue}>
                            ${selectedReport.estimated_cost}
                          </Text>
                        </Box>
                      )}
                    </SimpleGrid>
                  </Stack>
                </Box>

                <Divider />

                {/* Technical Details */}
                <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="md">Technical Details</Text>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Timestamp Logged</Text>
                      <Text size="sm">
                        {selectedReport?.damage_datetime
                          ? new Date(selectedReport.damage_datetime).toLocaleString()
                          : "N/A"}
                      </Text>
                    </Group>

                    {selectedReport?.status && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Current Status</Text>
                        <Badge color="blue" variant="light">{safeString(selectedReport.status)}</Badge>
                      </Group>
                    )}

                    {selectedReport?.annotations?.incident_point && (
                      <Group justify="space-between" align="flex-start">
                        <Text size="sm" c="dimmed">Incident Point</Text>
                        <Text size="sm" style={{ fontFamily: "monospace", textAlign: "right" }}>
                          {JSON.stringify(selectedReport.annotations.incident_point.geometry.coordinates)}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Box>

                <Button
                  fullWidth
                  color="teal"
                  variant="light"
                  radius="md"
                  size="md"
                  leftSection={<IconPlus size={18} />}
                  mt="xl"
                  onClick={(e) => {
                    closeDrawer();
                    handleActionModalTrigger(e, selectedReport);
                  }}
                >
                  Add Survey Questions
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>

      <QuestionGroupModal opened={opened} onClose={close} report={selectedReport} />
    </Card>
  );
}