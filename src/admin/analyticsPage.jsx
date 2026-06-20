import React from "react";
import {
  Container,
  Grid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Progress,
  Title,
import React from 'react';
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
  Button,
  TextInput,
  Avatar,
  Box
} from '@mantine/core';
import {
  IconTrendingUp,
  IconActivity,
  IconAlertTriangle,
  IconClock,
  IconSearch,
  IconBell,
  IconChevronDown,
  IconDownload
} from '@tabler/icons-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { HeaderCardPage } from './adminPage';
import { COLORS } from '../utils';
// --- Mock Data ---
const trendData = [
  { name: "Mon", submissions: 24, verifications: 16 },
  { name: "Tue", submissions: 38, verifications: 22 },
  { name: "Wed", submissions: 32, verifications: 26 },
  { name: "Thu", submissions: 55, verifications: 31 },
  { name: "Fri", submissions: 48, verifications: 36 },
  { name: "Sat", submissions: 63, verifications: 41 },
  { name: "Sun", submissions: 72, verifications: 52 },
];

const incidentData = [
  { name: "Flood", count: 85 },
  { name: "Quake", count: 42 },
  { name: "Fire", count: 32 },
  { name: "Health", count: 28 },
  { name: "Food", count: 18 },
  { name: "Other", count: 12 },
];

export function AnalyticsPage() {
export function AnalyticsPage() {
  return (
    <Box bg={COLORS.lightBackground} minHeight="100vh" py="md" px="lg">
      <Container size="xl">

        {/* --- HEADER NAVIGATION --- */}
        <Flex justify="space-between" align="center" mb="xl" gap="md" wrap="wrap">
          <Flex align="center" gap="xs">
            <Text size="xs" c="dimmed" fw={700} style={{ letterSpacing: 1 }}>UNDP / Africa</Text>
            <Title order={3} c="#0f2d59" style={{ fontFamily: 'sans-serif' }}>Analytics</Title>
          </Flex>

          <Flex align="center" gap="md" wrap="wrap">
            <TextInput
              placeholder="Search reports, locations, teams..."
              leftSection={<IconSearch size={16} />}
              rightSection={<Text size="xs" c="dimmed" bg="#f1f3f5" px={5} style={{ borderRadius: 4 }}>⌘K</Text>}
              w={300}
              radius="md"
            />

            <Select
              placeholder="Last 7 days"
              defaultValue="7days"
              data={[{ value: '7days', label: 'Last 7 days' }]}
              rightSection={<IconChevronDown size={14} />}
              radius="md"
              w={130}
            />

            <Button leftSection={<IconDownload size={16} />} color="teal" radius="md">
              Export
            </Button>

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
          {/* Submission + Verification Trend Line Chart */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card padding="lg" radius="md" shadow="xs" h={400}>
              <Text fw={700} size="md" c="#0f2d59">Submission + Verification Trend</Text>
              <Text size="xs" c="dimmed" mb="xl">Submissions vs verifications · last 7 days</Text>

              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#adb5bd" style={{ fontSize: '12px' }} />
                    <YAxis tickLine={false} axisLine={false} stroke="#adb5bd" style={{ fontSize: '12px' }} domain={[0, 80]} />
                    <Line type="monotone" dataKey="submissions" stroke="#0f2d59" strokeWidth={3} dot={{ r: 5, fill: "#0f2d59" }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="verifications" stroke="#0ca678" strokeWidth={3} dot={{ r: 5, fill: "#0ca678" }} />
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
                  <BarChart data={incidentData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#adb5bd" style={{ fontSize: '11px' }} />
                    <YAxis tickLine={false} axisLine={false} stroke="#adb5bd" style={{ fontSize: '12px' }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
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
