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
} from "@mantine/core";
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
} from "@tabler/icons-react";
import { api, timeAgo, COLORS } from "../utils";
import { HeaderCardPage } from "./adminPage";
// Design-matched UI Palette

// Raw layout mock data exactly representing the image's row entries

export function ReportsPage() {
  const [crisesReportList, setCrisesReportList] = useState([]);

  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get("/impact-reports/");
        setCrisesReportList(response.data);
        console.log("Fetched crises:", response.data);
      } catch (error) {
        console.error("Error fetching crises:", error);
      }
    };

    fetchCrises();
  }, []);

  // Helper for rendering Severity Badges
  const renderSeverity = (severity) => {
    let styles = {};
    if (severity === "High") {
      styles = { bg: COLORS.severity.highBg, c: COLORS.severity.highText };
    } else if (severity === "Medium") {
      styles = { bg: COLORS.severity.mediumBg, c: COLORS.severity.mediumText };
    } else {
      styles = { bg: COLORS.severity.lowBg, c: COLORS.severity.lowText };
    }

    return (
      <Badge
        variant="filled"
        bg={styles.bg}
        c={styles.c}
        radius="xl"
        size="sm"
        px="sm"
        style={{ textTransform: "capitalize" }}
        leftSection={
          <Box
            w={5}
            h={5}
            style={{ borderRadius: "50%", backgroundColor: styles.c }}
          />
        }
      >
        {severity}
      </Badge>
    );
  };

  // Helper for rendering Status Badges
  const renderStatus = (status) => {
    let styles = {};
    let icon = null;

    if (status === "Verified") {
      styles = { bg: COLORS.status.verifiedBg, c: COLORS.status.verifiedText };
      icon = <IconCircleCheck size={12} stroke={2.5} />;
    } else if (status === "Pending") {
      styles = { bg: COLORS.status.pendingBg, c: COLORS.status.pendingText };
      icon = <IconClock size={12} stroke={2.5} />;
    } else {
      styles = { bg: COLORS.status.reviewBg, c: COLORS.status.reviewText };
      icon = <IconAlertTriangle size={12} stroke={2.5} />;
    }

    return (
      <Badge
        variant="filled"
        bg={styles.bg}
        c={styles.c}
        radius="md"
        size="sm"
        px="xs"
        leftSection={icon}
        style={{
          border: `1px solid ${styles.c}30`,
          textTransform: "capitalize",
        }}
      >
        {status === "Review" ? "Review" : status}
      </Badge>
    );
  };

  return (
    <Box bg={COLORS.lightBackground} minHeight="100vh" py="md" px="lg">
      <Container size="xl">
        <Group justify="space-between" mb="xl">
          <Group>
            <Text size="xs" c="dimmed" fw={700} lts={1}>
              UNDP / Africa
            </Text>
            <Text
              size="xl"
              fw={700}
              c={COLORS.darkBlue}
              style={{ marginTop: -5 }}
            >
              Reports
            </Text>
          </Group>

          <Group gap="md">
            <TextInput
              placeholder="Search reports, locations, teams..."
              leftSection={<IconSearch size={16} stroke={1.5} />}
              rightSection={
                <Badge variant="light" color="gray" size="sm">
                  ⌘K
                </Badge>
              }
              w={300}
              radius="md"
            />
            <Button
              variant="default"
              leftSection={<IconCalendar size={16} />}
              radius="md"
            >
              Last 7 days
            </Button>
            <Button
              bg={COLORS.primaryTeal}
              leftSection={<IconDownload size={16} />}
              radius="md"
            >
              Export
            </Button>
            <ActionIcon variant="default" size="lg" radius="md">
              <IconBell size={18} stroke={1.5} />
            </ActionIcon>

            <Divider orientation="vertical" />

            <Group gap="xs">
              <Avatar color="blue" radius="xl">
                KS
              </Avatar>
              <Box>
                <Text size="sm" fw={600}>
                  Karim S.
                </Text>
                <Text size="xs" c="dimmed">
                  Responder - KE
                </Text>
              </Box>
            </Group>
          </Group>
        </Group>

        <HeaderCardPage />
        {<ReportDataTablePage />}
      </Container>
    </Box>
  );
}

export function ReportDataTablePage() {
  const [crisesReportList, setCrisesReportList] = useState([]);
  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get("/impact-reports/");
        setCrisesReportList(response.data);
        console.log("Fetched crises:", response.data);
      } catch (error) {
        console.error("Error fetching crises:", error);
      }
    };

    fetchCrises();
  }, []);
  return (
    <Card padding="lg" radius="lg" shadow="xs">
      {/* Section Controls Toolbar Header */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Text fw={700} size="lg" c={COLORS.darkBlue}>
            Recent Reports
          </Text>
        </Box>

        <Group gap="xs">
          <Select
            placeholder="All severities"
            data={["High", "Medium", "Low"]}
            w={140}
            radius="md"
            size="xs"
          />
          <Select
            placeholder="All regions"
            data={[
              "Nairobi, KE",
              "Mogadishu, SO",
              "Addis Ababa, ET",
              "Juba, SS",
              "Kampala, UG",
            ]}
            w={130}
            radius="md"
            size="xs"
          />
        </Group>
      </Group>
      {/* Management Records Table */}
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="md" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Text size="xs" c="dimmed" fw={700}>
                  INFRASTRUCTURE NAME{" "}
                </Text>{" "}
              </Table.Th>
              <Table.Th>
                <Text size="xs" c="dimmed" fw={700}>
                  {" "}
                  NATURE OF CRISIS{" "}
                </Text>{" "}
              </Table.Th>
              <Table.Th>
                <Text size="xs" c="dimmed" fw={700}>
                  LOCATION
                </Text>
              </Table.Th>
              <Table.Th>
                <Text size="xs" c="dimmed" fw={700}>
                  SEVERITY
                </Text>
              </Table.Th>
              <Table.Th ta="right">
                <Text size="xs" c="dimmed" fw={700}>
                  Updated
                </Text>
              </Table.Th>{" "}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {crisesReportList.map((row) => (
              <Table.Tr key={row.id}>
                {" "}
                {/* Report Info Column */}
                <Table.Td>
                  <Stack gap={2}>
                    <Text size="sm" fw={700} c={COLORS.darkBlue}>
                      {row.infrastructure_name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {row.infrastructure_type}
                    </Text>
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    <Text size="sm" fw={700} c={COLORS.darkBlue}>
                      {row.nature_of_crisis}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {row.nature_of_crisis}
                    </Text>
                  </Stack>
                </Table.Td>
                {/* Location Column */}
                <Table.Td>
                  <Group gap={4} c="dimmed">
                    <IconMapPin size={14} />
                    <Text size="sm">{row.location.city}</Text>
                  </Group>
                </Table.Td>
                {/* Severity Badge Column */}
                <Table.Td>{row.damage_severity}</Table.Td>
                <Table.Td ta="right">
                  {displayDate(row.damage_datetime)} {"at"}{" "}
                  {displayTime(row.damage_datetime)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}

const displayDate = (rawDate) =>
  new Date(rawDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }); // "June 16, 2026"

const displayTime = (rawDate) =>
  new Date(rawDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }); // "08:02 AM"
