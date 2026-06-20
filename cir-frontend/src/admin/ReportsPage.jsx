import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  Text,
  Group,
  Button,
  ActionIcon,
  Badge,
  TextInput,
  Avatar,
  Box,
  Divider,
  Select,
  Table,
  ThemeIcon,
  Anchor,
  Stack,
  Pagination,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch,
  IconCalendar,
  IconDownload,
  IconBell,
  IconMapPin,
  IconEye,
  IconFileText,
  IconClock,
  IconCircleCheck,
  IconDeviceMobile,
  IconAlertTriangle,
  IconChevronDown,
  IconPlus,
} from "@tabler/icons-react";
import { timeAgo, COLORS, SEVERITY_CONFIG } from "../utils";
import { HeaderCardPage } from "./adminPage";
import api from "../api";
import { QuestionGroupModal } from "../QuestionGroupModal"; // Make sure path is correct

export function ReportsPage() {
  const dateOptions = [
    { 1: "Today" },
    { 2: "Yesterday" },
    { 7: "Last 7 days" },
    { 30: "Last 30 days" },
    { 365: "This year" },
  ];

  const formattedData = (dateOptions || []).map((item) => {
    const [key, text] = Object.entries(item)[0] || ["7", "Last 7 days"];
    return {
      value: String(key),
      label: text,
    };
  });

  const [selectedDateRange, setSelectedDateRange] = useState(
    formattedData[2]?.value || "7",
  );
  const [crisesReportList, setCrisesReportList] = useState([]);
  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get("/impact-reports/");
        const incomingData = Array.isArray(response.data)
          ? response.data
          : (response.data?.results || []);

        setCrisesReportList(incomingData);
      } catch (error) {
        console.error("Error fetching crises:", error);
        setCrisesReportList([]);
      }
    };

    fetchCrises();
  }, []);

  // --- CSV Export ---
  const handleExportCSV = () => {
    if (!crisesReportList || crisesReportList.length === 0) {
      alert("No data available to export");
      return;
    }
    const titleHeaders = [["UNDP - Crisis Impact Reports Data"]];
    const tableHeaders = ["INFRASTRUCTURE NAME", "INFRASTRUCTURE TYPE", "LOCATION", "SEVERITY", "UPDATED"];
    const rows = crisesReportList.map((row) => [
      row?.infrastructure_name || "N/A",
      row?.infrastructure_type || "N/A",
      row?.location?.city || "N/A",
      row?.damage_severity || "Low",
      row?.damage_datetime ? `${displayDate(row.damage_datetime)} at ${displayTime(row.damage_datetime)}` : "N/A",
    ]);

    const escapeCSVField = (value) => {
      const stringValue = value === null || value === undefined ? "" : String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvContent = [
      ...titleHeaders.map(fields => fields.map(escapeCSVField).join(",")),
      tableHeaders.join(","),
      ...rows.map(row => row.map(escapeCSVField).join(",")),
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `UNDP_Crisis_Report_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              placeholder={"Select date range"}
              defaultValue={selectedDateRange}
              data={formattedData}
              onChange={(value) => setSelectedDateRange(value)}
              rightSection={<IconChevronDown size={14} />}
              radius="md"
              w={130}
            />
            <Button bg={COLORS.primaryTeal} leftSection={<IconDownload size={16} />} radius="md" onClick={handleExportCSV}>
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

  // Modal Controller States
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const ITEMS_PER_PAGE = 10;

  const dynamicSeverities = Array.from(
    new Set((crisesReportList || []).map((row) => row?.damage_severity).filter(Boolean))
  );

  const dynamicRegions = Array.from(
    new Set((crisesReportList || []).map((row) => row?.location?.city == null ? "" : row?.location?.city).filter(Boolean))
  );

  const handleActionTrigger = (row) => {
    setSelectedReportId(row?.id);
    open();
  };

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
              paginatedData.map((row) => (
                <Table.Tr key={row?.id} onClick={() => handleActionTrigger(row)} style={{ cursor: "pointer" }}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm" fw={700} c={COLORS.darkBlue}>{row?.infrastructure_name || "N/A"}</Text>
                      <Text size="xs" c="dimmed">{row?.infrastructure_type.includes("(") ? row?.infrastructure_type.split("(")[0] : row?.infrastructure_type}</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} c="dimmed">
                      <IconMapPin size={14} /><Text size="sm">{row?.location?.city || "N/A"}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={SEVERITY_CONFIG[row?.damage_severity?.toLowerCase()] === undefined ? SEVERITY_CONFIG["no_Damage"].color : SEVERITY_CONFIG[row?.damage_severity?.toLowerCase()]?.color}>
                      {row?.damage_severity}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">{row?.damage_datetime ? `${displayDate(row.damage_datetime)} at ${displayTime(row.damage_datetime)}` : "N/A"}</Table.Td>
                  <Table.Td ta="right">
                    <Button
                      size="xs" variant="light" color="teal" radius="md" leftSection={<IconPlus size={12} />}
                      onClick={(e) => {
                        e.stopPropagation(); // Stops parent row click event handler duplication
                        handleActionTrigger(row);
                      }}
                    >
                      Add Question
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr><Table.Td colSpan={5} ta="center" py="xl"><Text c="dimmed" size="sm">No records found matching filters.</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {totalPages > 1 && (
        <Group justify="flex-end" mt="xl">
          <Pagination total={totalPages} value={activePage} onChange={setActivePage} radius="md" withEdges />
        </Group>
      )}

      {/* Renders your customized question submission logic blueprint setup hook */}
      <QuestionGroupModal
        opened={opened}
        onClose={close}
        reportID={selectedReportId}
      />
    </Card>
  );
}

const displayDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
const displayTime = (d) => d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";