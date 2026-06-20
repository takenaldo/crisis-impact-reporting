import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Progress,
  Title,
  Flex,
  Select,
  Avatar,
  Box
} from '@mantine/core';
import {
  IconBell,
  IconChevronDown
} from '@tabler/icons-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip
} from 'recharts';
import { HeaderCardPage } from './adminPage';
import { COLORS } from '../utils';
import { urls } from "./url";
import api from "../api";

export function AnalyticsPage() {

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

  const [analyticsData, setAnalyticsData] = useState({
    total_reports: 0,
    damage_severity: {},
    infrastructure_type: {}
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get(
          urls.getReportsByDate + selectedDateRange,
        );
        const incomingData = response.data || {};
        setAnalyticsData({
          total_reports: incomingData.total_reports ?? 0,
          damage_severity: incomingData.damage_severity || {},
          infrastructure_type: incomingData.infrastructure_type || {}
        });
        console.log("Fetched analytics:", incomingData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setAnalyticsData({ total_reports: 0, damage_severity: {}, infrastructure_type: {} });
      }
    };

    fetchAnalytics();
  }, [selectedDateRange]);

  const totalReports = analyticsData.total_reports;
  const damageSeverityEntries = Object.entries(analyticsData.damage_severity);

  // Helper to convert snake_case keys (e.g., 'power_grid') into readable names ('Power Grid')
  const formatLabel = (str) => {
    return str
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

 
  const infrastructureEntries = Object.entries(analyticsData.infrastructure_type).map(([key, value]) => ({
    name: formatLabel(key).includes("(") ? formatLabel(key).split("(")[0] : formatLabel(key),
    count: value
  }));

  return (
    <Box bg={COLORS.lightBackground} minHeight="100vh" py="md" px="lg">
      <Container size="xl">

        {/* --- HEADER NAVIGATION --- */}
        <Flex justify="space-between" align="center" mb="xl" gap="md" wrap="wrap">
          <Flex align="center" gap="xs">
            <Text size="xs" c="dimmed" fw={700} style={{ letterSpacing: 1 }}>UNDP / </Text>
            <Title order={3} c="#0f2d59" style={{ fontFamily: 'sans-serif' }}>Analytics</Title>
          </Flex>

          <Flex align="center" gap="md" wrap="wrap">
            <Select
              placeholder={"Select date range"}
              defaultValue={selectedDateRange}
              data={formattedData}
              onChange={(value) => {
                setSelectedDateRange(value);
              }}
              rightSection={<IconChevronDown size={14} />}
              radius="md"
              w={130}
            />

            <ThemeIcon variant="subtle" color="gray" size="lg" radius="xl">
              <IconBell size={20} />
            </ThemeIcon>

            <Group gap="xs">
              <Avatar color="blue" radius="xl">KS</Avatar>
              <div>
                <Text size="xs" fw={700}>Karim S.</Text>
                <Text size="10px" c="dimmed">Responder · KE</Text>
              </div>
            </Group>
          </Flex>
        </Flex>
        <HeaderCardPage />

        {/* --- CHARTS SECTION --- */}
        <Grid mb="xl">
          {/* Submission Trend Line Chart */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card padding="lg" radius="md" shadow="xs" h={400}>
              <Text fw={700} size="md" c="#0f2d59">Submission Trend</Text>
              <Text size="xs" c="dimmed" mb="xl">Submissions · last {selectedDateRange} days</Text>

              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={damageSeverityEntries} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                    <XAxis
                      dataKey="0"
                      tickLine={false}
                      axisLine={false}
                      stroke="#adb5bd"
                      style={{ fontSize: '12px' }}
                      label={{
                        value: "Damage Severity",
                        position: "insideBottom",
                        offset: -15,
                        fill: "#adb5bd",
                        fontSize: "12px",
                        fontWeight: 500
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      stroke="#adb5bd"
                      style={{ fontSize: '12px' }}
                      label={{
                        value: "Submissions Count",
                        angle: -90,
                        position: "insideLeft",
                        offset: 0,
                        fill: "#adb5bd",
                        fontSize: "12px",
                        fontWeight: 500
                      }}
                    />
                    <Tooltip
                      cursor={{ stroke: '#f1f3f5', strokeWidth: 1 }}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef' }}
                    />
                    <Line type="monotone" dataKey="1" name="Submissions" stroke="#0ca678" strokeWidth={3} dot={{ r: 5, fill: "#0ca678" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Grid.Col>

          {/* Incident Mix Bar Chart */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" radius="md" shadow="xs" h={400}>
              <Text fw={700} size="md" c="#0f2d59">Incident Mix</Text>
              <Text size="xs" c="dimmed" mb="xl">By frequency</Text>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={infrastructureEntries} margin={{ top: 5, right: 5, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      stroke="#adb5bd"
                      style={{ fontSize: '11px' }}
                      tickFormatter={(value) => value.length > 8 ? `${value.slice(0, 8)}...` : value}
                      label={{
                        value: "Infrastructure Type",
                        position: "insideBottom",
                        offset: -15,
                        fill: "#adb5bd",
                        fontSize: "12px",
                        fontWeight: 500
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      stroke="#adb5bd"
                      style={{ fontSize: '12px' }}
                      label={{
                        value: "Incident Count",
                        angle: -90,
                        position: "insideLeft",
                        offset: 0,
                        fill: "#adb5bd",
                        fontSize: "12px",
                        fontWeight: 500
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8f9fa' }}
                      formatter={(value) => [value, "Total Incidents"]}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef' }}
                    />
                    <Bar dataKey="count" fill="#0cb69f" radius={[4, 4, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Grid.Col>
        </Grid>

        {/* --- PREDICTIVE SIGNALS SECTION --- */}
        <Grid>
          {/* Signal 01 */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" radius="md" shadow="xs">
              <Text size="xs" c="dimmed" fw={500}>Predictive signal 01</Text>
              <Text fw={700} size="md" c="#0f2d59" mb="md">Lake Victoria basin</Text>
              <Progress value={82} color="teal" size="sm" radius="xl" mb="xs" />
              <Text size="xs" c="dimmed">
                <Text span fw={500} c="gray.7">Confidence 82%</Text> · recommended for coordinator review.
              </Text>
            </Card>
          </Grid.Col>

          {/* Signal 02 */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" radius="md" shadow="xs">
              <Text size="xs" c="dimmed" fw={500}>Predictive signal 02</Text>
              <Text fw={700} size="md" c="#0f2d59" mb="md">Dadaab health cluster</Text>
              <Progress value={68} color="teal" size="sm" radius="xl" mb="xs" />
              <Text size="xs" c="dimmed">
                <Text span fw={500} c="gray.7">Confidence 68%</Text> · recommended for coordinator review.
              </Text>
            </Card>
          </Grid.Col>

          {/* Signal 03 */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" radius="md" shadow="xs">
              <Text size="xs" c="dimmed" fw={500}>Predictive signal 03</Text>
              <Text fw={700} size="md" c="#0f2d59" mb="md">Mombasa logistics corridor</Text>
              <Progress value={54} color="teal" size="sm" radius="xl" mb="xs" />
              <Text size="xs" c="dimmed">
                <Text span fw={500} c="gray.7">Confidence 54%</Text> · recommended for coordinator review.
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}