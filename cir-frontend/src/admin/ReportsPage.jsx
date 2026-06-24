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
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDownload,
  IconBell,
  IconMapPin,
  IconChevronDown,
  IconPlus,
  IconUser,
  IconInfoCircle,
  IconFileText,
  IconWorld,
} from "@tabler/icons-react";
import { getNearestCity } from "offline-geocode-city";
import { COLORS, SEVERITY_CONFIG, timeAgo } from "../utils";
import { HeaderCardPage } from "./adminPage";
import api from "../api";
import { QuestionGroupModal } from "../QuestionGroupModal";

// --- Completely Sanitized Global Geocoding Engine ---
const resolveCityName = (row) => {
  if (!row) return "Unknown Region";

  const coords = row?.annotations?.incident_point?.geometry?.coordinates;
  let lng = undefined;
  let lat = undefined;

  // GeoJSON coordinates array is standard [longitude, latitude]
  if (Array.isArray(coords) && coords.length >= 2) {
    lng = coords[0];
    lat = coords[1];
  } else {
    lat = row?.location?.latitude ?? row?.latitude;
    lng = row?.location?.longitude ?? row?.longitude;
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  // Hard Bounds Validation Check to completely prevent recursive S2 stack exhaustion
  if (
    isNaN(parsedLat) ||
    isNaN(parsedLng) ||
    parsedLat < -90.0 ||
    parsedLat > 90.0 ||
    parsedLng < -180.0 ||
    parsedLng > 180.0
  ) {
    return row?.location?.city || "Unknown Region";
  }

  try {
    const result = getNearestCity(parsedLng, parsedLat);
    return result?.cityName || row?.location?.city || "Unknown Region";
  } catch (e) {
   
    return row?.location?.city || "Unknown Region";
  }
};

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

  const [selectedDateRange, setSelectedDateRange] = useState(
    formattedData[2]?.value || "7"
  );
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
    const tableHeaders = [
      "INFRASTRUCTURE NAME",
      "INFRASTRUCTURE TYPE",
      "LOCATION",
      "SEVERITY",
      "UPDATED",
    ];
    const rows = crisesReportList.map((row) => [
      row?.infrastructure_name || "N/A",
      row?.infrastructure_type || "N/A",
      resolveCityName(row),
      row?.damage_severity || "Low",
      row?.damage_datetime
        ? `${displayDate(row.damage_datetime)} at ${displayTime(
          row.damage_datetime
        )}`
        : "N/A",
    ]);

    const escapeCSVField = (value) => {
      const stringValue = value === null || value === undefined ? "" : String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvContent = [
      ...titleHeaders.map((fields) => fields.map(escapeCSVField).join(",")),
      tableHeaders.join(","),
      ...rows.map((row) => row.map(escapeCSVField).join(",")),
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });
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

  // --- GeoJSON Export ---
  const handleExportGeoJSON = () => {
    if (!crisesReportList || crisesReportList.length === 0) {
      alert("No data available to export");
      return;
    }

    const features = crisesReportList.map((row) => {
      const coords = row?.annotations?.incident_point?.geometry?.coordinates;
      let lng = undefined;
      let lat = undefined;

      if (Array.isArray(coords) && coords.length >= 2) {
        lng = coords[0];
        lat = coords[1];
      } else {
        lat = row?.location?.latitude ?? row?.latitude;
        lng = row?.location?.longitude ?? row?.longitude;
      }

      const validLng = isNaN(parseFloat(lng)) ? 38.7578 : parseFloat(lng);
      const validLat = isNaN(parseFloat(lat)) ? 8.9806 : parseFloat(lat);

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [validLng, validLat],
        },
        properties: {
          id: row?.id || "",
          infrastructure_name: row?.infrastructure_name || "N/A",
          infrastructure_type: row?.infrastructure_type || "N/A",
          city_resolved: resolveCityName(row),
          damage_severity: row?.damage_severity || "Unknown",
          damage_datetime: row?.damage_datetime || "N/A",
          status: row?.status || "N/A",
          affected_population: row?.affected_population || 0,
          estimated_cost: row?.estimated_cost || 0,
        },
      };
    });

    const geojsonData = {
      type: "FeatureCollection",
      crs: {
        type: "name",
        properties: {
          name: "urn:ogc:def:crs:OGC:1.3:CRS84",
        },
      },
      features,
    };

    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], {
      type: "application/geo+json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `UNDP_Crisis_Spatial_${new Date().toISOString().split("T")[0]}.geojson`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PDF Export ---
  const handleExportPDF = () => {
    if (!crisesReportList || crisesReportList.length === 0) {
      alert("No data available to export");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Pop-up blocker is preventing export. Please allow popups.");
      return;
    }

    const rowsHtml = crisesReportList
      .map(
        (row) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600;">${row?.infrastructure_name || "N/A"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #4a5568;">${row?.infrastructure_type || "N/A"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${resolveCityName(row)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;"><span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background-color: #edf2f7;">${row?.damage_severity || "Unknown"}</span></td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; color: #718096;">${row?.damage_datetime ? new Date(row.damage_datetime).toLocaleDateString() : "N/A"}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>UNDP Crisis Impact Reports</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1a202c; padding: 40px; margin: 0; }
            .header { margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
            .title { font-size: 24px; font-weight: 700; color: #1e3a8a; margin: 0; }
            .subtitle { font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .meta { font-size: 12px; color: #a0aec0; text-align: right; float: right; margin-top: -40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px 10px; background-color: #f7fafc; color: #718096; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
            @media print { body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="subtitle">United Nations Development Programme</div>
            <div class="title">Crisis Impact Executive Summary</div>
            <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Infrastructure</th>
                <th>Type</th>
                <th>Location</th>
                <th>Severity</th>
                <th style="text-align: right;">Updated</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Box bg={COLORS.lightBackground} style={{ minHeight: "100vh" }} py="md" px="lg">
      <Container size="xl">
        <Card >
          <Group justify="space-between" align="center">
            <Group>
              <Text size="xs" c="dimmed" fw={700} lts={1}>UNDP</Text>
              <Title order={3} fw={700} c={COLORS.darkBlue} style={{ marginTop: -4 }}>
                Impact Reports
              </Title>
            </Group>

            <Group gap="md">
              {/* <Select
                placeholder="Select date range"
                defaultValue={selectedDateRange}
                data={formattedData}
                onChange={(value) => setSelectedDateRange(value)}
                rightSection={<IconChevronDown size={14} />}
                radius="md"
                w={160}
                size="sm"
              /> */}

              <Menu shadow="md" width={180} radius="md" position="bottom-end">
                <Menu.Target>
                  <Button
                    bg={COLORS.primaryTeal}
                    leftSection={<IconDownload size={16} />}
                    rightSection={<IconChevronDown size={14} />}
                    radius="md"
                    size="sm"
                  >
                    Export Reports
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Format Options</Menu.Label>
                  <Menu.Item leftSection={<IconFileText size={16} />} onClick={handleExportCSV}>
                    Export as CSV
                  </Menu.Item>
                  <Menu.Item leftSection={<IconWorld size={16} />} onClick={handleExportGeoJSON}>
                    Export as GeoJSON
                  </Menu.Item>
                  <Menu.Item leftSection={<IconInfoCircle size={16} />} onClick={handleExportPDF}>
                    Export as PDF
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

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

  const safeString = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
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
    new Set(
      (crisesReportList || [])
        .map((row) => row?.damage_severity)
        .filter(Boolean)
    )
  );

  const dynamicRegions = Array.from(
    new Set(
      (crisesReportList || [])
        .map((row) => resolveCityName(row))
        .filter((city) => city && city !== "Unknown Region")
    )
  );

  const filteredData = (crisesReportList || []).filter((row) => {
    const matchesSeverity = selectedSeverity
      ? row?.damage_severity?.toLowerCase() === selectedSeverity.toLowerCase()
      : true;
    const matchesRegion = selectedRegion
      ? resolveCityName(row).toLowerCase() === selectedRegion.toLowerCase()
      : true;
    return matchesSeverity && matchesRegion;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <Card padding="xl"  >
      <Group justify="space-between" mb="xl">
        <Title order={4} fw={700} c={COLORS.darkBlue}>Recent Reports</Title>
        <Group gap="sm">  
          <Select
            placeholder="All severities"
            data={dynamicSeverities}
            value={selectedSeverity}
            onChange={(v) => { setSelectedSeverity(v); setActivePage(1); }}
            clearable
            w={160}
            radius="md"
            size="sm"
          />
          <Select
            placeholder="All regions"
            data={dynamicRegions}
            value={selectedRegion}
            onChange={(v) => { setSelectedRegion(v); setActivePage(1); }}
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
                      <Text size="sm">{resolveCityName(report)}</Text>
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
                >{selectedReport?.damage_severity || "Unknown"}
                </Badge>
              </Group>
            </Box>
            <Box p="xl" style={{ flex: 1, overflow: "auto" }}>
              <Stack gap="xl">
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
                  <Card withBorder radius="md" padding="lg">
                    <Group gap={8} mb={12}>
                      <IconMapPin size={20} color="#64748b" />
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase">Location</Text>
                    </Group>
                    <Text size="lg" fw={600} mb={6}>
                      {resolveCityName(selectedReport)}
                    </Text>
                    <Text size="sm" style={{ fontFamily: "monospace", color: "#475569" }}>
                      {selectedReport?.annotations?.incident_point?.geometry?.coordinates?.[0]?.toFixed(4) || "—"},&nbsp;
                      {selectedReport?.annotations?.incident_point?.geometry?.coordinates?.[1]?.toFixed(4) || "—"}
                    </Text>
                  </Card>
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
                <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="md">Impact Assessment</Text>
                  <Stack gap="md">
                    {selectedReport?.damage_description && (
                      <Box>
                        <Text size="xs" c="dimmed" fw={700} mb={6}>Damage Description</Text>
                        <Text size="sm" style={{ lineHeight: 1.6 }}>
                          {selectedReport?.damage_description || ""}
                        </Text>
                      </Box>
                    )}
                    {selectedReport?.impact_notes && (
                      <Box>
                        <Text size="xs" c="dimmed" fw={700} mb={6}>Impact Notes</Text>
                        <Text size="sm" style={{ lineHeight: 1.6 }}>
                          {selectedReport?.impact_notes || ""}
                        </Text>
                      </Box>
                    )}
                    <SimpleGrid cols={2} spacing="md">
                      {selectedReport?.affected_population && (
                        <Box>
                          <Text size="xs" c="dimmed" fw={700}>Affected Population</Text>
                          <Text size="lg" fw={700} c={COLORS.darkBlue}>
                            {selectedReport?.affected_population || ""}
                          </Text>
                        </Box>
                      )}
                      {selectedReport?.estimated_cost && (
                        <Box>
                          <Text size="xs" c="dimmed" fw={700}>Estimated Cost</Text>
                          <Text size="lg" fw={700} c={COLORS.darkBlue}>
                            ${selectedReport?.estimated_cost || ""}
                          </Text>
                        </Box>
                      )}
                    </SimpleGrid>
                  </Stack>
                </Box>
                <Divider />
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
                          {JSON.stringify(selectedReport?.annotations?.incident_point?.geometry?.coordinates || [])}
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

const displayDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

const displayTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    : "";