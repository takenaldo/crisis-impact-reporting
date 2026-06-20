import React, { useState, useEffect } from "react";
import {
  MantineProvider,
  createTheme,
  Container,
  Title,
  TextInput,
  Button,
  Group,
  Card,
  Text,
  Badge,
  RingProgress,
  Stack,
  Paper,
  Flex,
  Select,
  Grid,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconSearch,
  IconDownload,
  IconBell,
  IconFilter,
  IconChevronDown,
  IconClock,
  IconCircleCheck,
  IconDeviceMobile,
  IconFileText,
} from "@tabler/icons-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import { api, CRISIS_CONFIG, SEVERITY_CONFIG, COLORS } from "../utils";
import { CrisisMapPage } from "./crisisMap";
import { ReportDataTablePage } from "./ReportsPage";
import { urls } from "./url";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export function DashboardPage() {
  const dateOptions = [
    { 1: "Today" },
    { 2: "Yesterday" },
    { 7: "Last 7 days" },
    { 30: "Last 30 days" },
    { 365: "This year" },
  ];
  const formattedData = dateOptions.map((item) => {
    const [key, text] = Object.entries(item)[0];
    return {
      value: String(key),
      label: text,
    };
  });
  const [progress, setProgress] = useState({ high: 0, medium: 0, low: 0 });
  const [crisesReportList, setCrisesReportList] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(
    formattedData[2].value
  );
  // Animate the ring chart
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress({ high: 58, medium: 27, low: 15 });
      setProgress({ high: 58, medium: 27, low: 15 });
    }, 300);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get(
          urls.getReportsByDate + "/?range=" + selectedDateRange
        );
        setCrisesReportList(response.data);
        console.log("Fetched crises:", response.data);
      } catch (error) {
        console.error("Error fetching crises:", error);
      }
    };

    fetchCrises();
  }, []);
  return (
    <Box bg={COLORS.lightBackground} minHeight="100vh" py="md" px="lg">
      <Container size="xl">
        {/* Header */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "12px 28px",
          }}
        >
          <Group justify="space-between" align="center">
            <Group align="center">
              <Text fw={700} size="xl" c="#0f766e">
                UNDP
              </Text>
              <Title order={3} style={{ marginLeft: 20 }}>
                Crisis Impact Overview
              </Title>
            </Group>
            <Group gap="lg">
              <Select
                placeholder={"Select date range"}
                defaultValue={formattedData[2].value} // Default to "Last 7 days"
                data={formattedData}
                onChange={(value) => {
                  setSelectedDateRange(value);
                  console.log("Selected date range:", value);
                }}
                rightSection={<IconChevronDown size={14} />}
                radius="md"
                w={130}
              />
              {/* <Button leftSection={<IconDownload size={18} />} radius="md">
                Export
              </Button> */}
              <Button variant="subtle" radius="md" p={8}>
                <IconBell size={22} />
              </Button>
              <Group gap={10}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    background: "#1e2937",
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  KS
                </div>
                <div>
                  <Text fw={600} size="sm">
                    Karim S.
                  </Text>
                  <Text size="xs" c="dimmed">
                    Responder - KE
                  </Text>
                </div>
              </Group>
            </Group>
          </Group>
        </header>

        <Container size="xl" py={28}>
          {/* Top Metrics Cards */}
          <HeaderCardPage selectedDateRange={selectedDateRange} />

          <Flex gap={24}>
            {/* Interactive Crisis Map */}
            <Card shadow="sm" radius="md" style={{ flex: 7 }} p={0}>
              <div style={{ height: "680px", position: "relative" }}>
                <CrisisMapPage />
              </div>
            </Card>

            {/* Status Distribution - Animated Ring */}
            <Card shadow="sm" radius="md" style={{ flex: 3 }} p="xl">
              <Group justify="space-between" mb="xl">
                <div>
                  <Text fw={700} size="lg">
                    Status Distribution
                  </Text>
                  <Text size="sm" c="dimmed">
                    By Impact Level
                  </Text>
                </div>
                <Button variant="light" radius="md">
                  Details
                </Button>
              </Group>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "24px 0",
                }}
              >
                <RingProgress
                  size={235}
                  thickness={38}
                  roundCaps
                  animationDuration={1200}
                  animationDuration={1200}
                  sections={[
                    { value: progress.high, color: "#ef4444" },
                    { value: progress.medium, color: "#f59e0b" },
                    { value: progress.low, color: "#14b8a6" },
                  ]}
                  label={
                    <div style={{ textAlign: "center" }}>
                      <Text size={38} fw={700} lh={1}>
                        1,284
                      </Text>
                      <Text size="sm" c="dimmed" mt={2}>
                        total reports
                      </Text>
                    </div>
                  }
                />
              </div>

              <Stack gap="md" mt="md">
                {[
                  { label: "High-Impact", percent: 58, color: "#ef4444" },
                  { label: "Medium-Impact", percent: 27, color: "#f59e0b" },
                  { label: "Low-Impact", percent: 15, color: "#14b8a6" },
                ].map((item) => (
                  <Group key={item.label} justify="space-between">
                    <Group gap="sm">
                      <div
                        style={{
                          width: 13,
                          height: 13,
                          background: item.color,
                          borderRadius: "50%",
                        }}
                      />
                      <Text>{item.label}</Text>
                    </Group>
                    <Text fw={600}>{item.percent}%</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Flex>
        </Container>
        {<ReportDataTablePage />}
      </Container>
    </Box>
  );
}

export function HeaderCardPage({ selectedDateRange }) {
  const [crisesReportList, setCrisesReportList] = useState([]);

  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get(
          urls.getReportsByDate + "/?range=" + selectedDateRange
        );
        setCrisesReportList(response.data);
        console.log("Fetched crises:", response.data);
      } catch (error) {
        console.error("Error fetching crises:", error);
      }
    };

    fetchCrises();
  }, [selectedDateRange]);
  return (
    <Grid mb="lg">
      {crisesReportList.map((crisis, i) => (
        <Grid.Col span={{ sm: 6, md: 4 }} key={i}>
          <Card padding="md" radius="lg" withBorder={false}>
            <Group gap="md" align="center">
              <ThemeIcon
                size="xl"
                radius="md"
                variant="light"
                color={
                  COLORS.severity?.[crisis.damage_severity] || COLORS.darkBlue
                }
                bg="#EEF4FC"
                c="#2B6CB0"
              >
                <IconFileText size={20} />
              </ThemeIcon>
              <Box>
                <Text size="xs" c="dimmed" fw={500}>
                  {crisis.damage_severity}
                </Text>
                <Text
                  size="xl"
                  fw={700}
                  c={
                    COLORS.severity?.[crisis.damage_severity] || COLORS.darkBlue
                  }
                >
                  71
                </Text>
              </Box>
            </Group>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
}
