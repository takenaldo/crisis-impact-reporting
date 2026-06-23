import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Modal,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconMapPin,
  IconUserFilled,
  IconExternalLink,
  IconClock,
  IconBuilding,
  IconPhotoOff,
} from "@tabler/icons-react";

import { timeAgo, swapAnnotationPointCoords } from "../utils";
import CirMap from "../map/CirMap";
import QuestionsTabViewView from "../QuestionsTabView";
import SurveyTabView from "../SurveyTabView";
import { SERVER_IP } from "../constants";
import EnterprisePDFViewer from "./ReportDocument";

// Professional UI theme parser for damage status mapping
const getSeverityTheme = (severity) => {
  const norm = String(severity).toLowerCase();
  if (
    norm.includes("crit") ||
    norm.includes("high") ||
    norm.includes("major")
  ) {
    return {
      color: "var(--mantine-color-red-filled)",
      bg: "rgba(250, 82, 82, 0.12)",
      border: "rgba(250, 82, 82, 0.2)",
    };
  }
  if (norm.includes("mod") || norm.includes("med")) {
    return {
      color: "var(--mantine-color-orange-filled)",
      bg: "rgba(253, 126, 20, 0.12)",
      border: "rgba(253, 126, 20, 0.2)",
    };
  }
  return {
    color: "var(--mantine-color-gray-7)",
    bg: "rgba(134, 142, 150, 0.12)",
    border: "rgba(134, 142, 150, 0.2)",
  };
};

export default function ReportDetailsView({ report }) {
  const [showMore, setShowMore] = useState(true);
  const [showMapView, setShowMapView] = useState(false);
  const [showPDF, setShowPDF] = useState(false);

  const toggleShowMore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMore((prev) => !prev);
  };

  const severityTheme = getSeverityTheme(report?.damage_severity);

  return (
    <>
      {/* Export Report PDF Modal Container */}
      <Modal
        opened={showPDF}
        onClose={() => setShowPDF(false)}
        size="xl"
        yOffset="4vh"
        zIndex={99999}
        title={
          <Text fw={600} ff="Poppins" fz="md" c="var(--color-teal)">
            Export Report PDF File
          </Text>
        }
        overlayProps={{
          backgroundOpacity: 0.4,
          blur: 4,
        }}
        radius="lg"
      >
        <Box h="76vh" w="100%">
          <EnterprisePDFViewer jsonData={report} />
        </Box>
      </Modal>

      {/* Main Report Panel Dashboard */}
      <Card
        key={report?.id}
        shadow="sm"
        padding={0}
        radius="lg"
        withBorder
        style={{
          borderColor: "#EAECEF",
          borderTop: "4px solid #009C9A",
          backgroundColor: "#ffffff",
        }}
        h={"100vh"}
      >
        <Stack gap={0}>
          <Box p="xl">
            <Stack gap="lg">
              {/* Header Context Section */}
              <Stack gap="xs">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Text
                    size="lg"
                    fw={800}
                    c="var(--color-teal)"
                    ff="Montserrat"
                    lh={1.25}
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    DAMAGE REPORT:{" "}
                    {report?.infrastructure_name ||
                      "UNIDENTIFIED INFRASTRUCTURE"}
                  </Text>
                </Group>

                {/* Subtitle Badges Row */}
                <Group gap="xs" align="center">
                  <Badge
                    variant="filled"
                    size="sm"
                    radius="sm"
                    style={{
                      textTransform: "none",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                      backgroundColor: severityTheme.bg,
                      color: severityTheme.color,
                      border: `1px solid ${severityTheme.border}`,
                    }}
                  >
                    {report?.damage_severity || "Unknown Severity"}
                  </Badge>

                  {report?.debris && (
                    <Badge
                      color="var(--color-teal)"
                      variant="light"
                      size="sm"
                      radius="sm"
                      ff="Poppins"
                      style={{ textTransform: "none", fontWeight: 500 }}
                    >
                      Debris Detected
                    </Badge>
                  )}

                  <Divider orientation="vertical" h={14} color="#EAECEF" />

                  <Group gap={4} wrap="nowrap" c="dimmed">
                    <IconBuilding size={14} color="var(--color-teal)" />
                    <Text
                      size="xs"
                      fw={500}
                      ff="Poppins"
                      style={{ letterSpacing: "0.01em" }}
                    >
                      {report?.infrastructure_type || "Infrastructure"}
                    </Text>
                  </Group>
                </Group>
              </Stack>

              {/* Dynamic Description Window */}
              {report?.description ? (
                <Text size="sm" c="#475569" lh={1.65} ff="Poppins">
                  {report?.description}
                </Text>
              ) : (
                <Paper
                  p="sm"
                  bg="#F8FAFC"
                  radius="md"
                  withBorder
                  style={{ borderStyle: "dashed" }}
                >
                  <Text
                    size="sm"
                    c="dimmed"
                    lh={1.6}
                    ff="Poppins"
                    fs="italic"
                    ta="center"
                  >
                    No detailed structural analysis description provided for
                    this entry.
                  </Text>
                </Paper>
              )}

              {/* Geographic Spatial Information Block */}
              <Stack gap="xs">
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                  bg="var(--mantine-color-gray-0)"
                  style={{
                    borderColor: "#EAECEF",
                    transition: "border-color 0.2s",
                  }}
                  styles={{
                    root: {
                      "&:hover": { borderColor: "var(--color-teal)" },
                    },
                  }}
                >
                  <Group
                    wrap="nowrap"
                    align="center"
                    justify="space-between"
                    gap="md"
                  >
                    <Group
                      wrap="nowrap"
                      gap="sm"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <ThemeIcon
                        color="#009C9A"
                        variant="light"
                        size={38}
                        radius="md"
                      >
                        <IconMapPin size={18} />
                      </ThemeIcon>

                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group gap={6} align="baseline">
                          <Text
                            size="xs"
                            c="dimmed"
                            tt="uppercase"
                            fw={700}
                            style={{ letterSpacing: "0.05em" }}
                          >
                            Coordinates:
                          </Text>
                          <Text size="xs" c="#0D3B66" fw={700} ff="Poppins">
                            {report.annotations?.incident_point?.geometry.coordinates[0]?.toFixed(
                              4
                            ) || "N/A"}
                            ,{" "}
                            {report.annotations?.incident_point?.geometry.coordinates[1]?.toFixed(
                              4
                            ) || "N/A"}
                          </Text>
                        </Group>

                        <Text
                          size="xs"
                          c="dark.3"
                          fw={500}
                          mt={2}
                          lineClamp={1}
                          ff="Poppins"
                        >
                          {[
                            report?.location?.city,
                            report?.location?.state_province,
                            report?.location?.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Unknown Regional Address"}
                        </Text>
                      </Box>
                    </Group>

                    {report?.location?.infrastructure_latitude &&
                      report?.location?.infrastructure_longitude && (
                        <ActionIcon
                          variant="white"
                          color="#009C9A"
                          size="lg"
                          radius="md"
                          onClick={() => setShowMapView((v) => !v)}
                          aria-label="View on external map dashboard"
                          style={{ border: "1px solid #EAECEF" }}
                        >
                          <IconExternalLink size={18} stroke={1.8} />
                        </ActionIcon>
                      )}
                  </Group>
                </Paper>

                {showMapView &&
                  report?.location?.infrastructure_latitude &&
                  report?.location?.infrastructure_longitude && (
                    <Box
                      style={{
                        height: 300,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <CirMap
                        center={[
                          report.location.infrastructure_latitude,
                          report.location.infrastructure_longitude,
                        ]}
                        zoom={14}
                        height="300px"
                        annotations={
                          report.annotations
                            ? swapAnnotationPointCoords(report.annotations)
                            : undefined
                        }
                      />
                    </Box>
                  )}

                {/* Dispatch / Capture Timestamp */}
                <Group gap={4} justify="flex-end" px={4}>
                  <IconClock
                    size={13}
                    color="var(--mantine-color-gray-5)"
                    stroke={2}
                  />
                  <Text size="xs" c="dimmed" fw={500} ff="Poppins">
                    Reported{" "}
                    {report?.damage_datetime
                      ? timeAgo(report?.damage_datetime)
                      : "at unknown interval"}
                  </Text>
                </Group>
              </Stack>
            </Stack>
          </Box>

          {/* Action Trigger Interface */}
          <Box px="xl" pb="lg">
            <Button
              color="#009C9A"
              variant="light"
              fullWidth
              size="sm"
              radius="md"
              fw={600}
              onClick={() => setShowPDF(true)}
              styles={{
                root: {
                  transition: "background-color 0.15s, transform 0.1s",
                  "&:active": { transform: "scale(0.99)" },
                },
              }}
            >
              Generate & Show PDF Document
            </Button>
          </Box>

          {/* Tabular Analysis Window Extension */}
          {showMore && (
            <Box px="xl" pb="xl">
              <Divider mb="lg" color="#EAECEF" />
              <Tabs
                defaultValue="Photos"
                variant="pills"
                radius="md"
                color="#009C9A"
              >
                <Tabs.List
                  grow
                  style={{
                    backgroundColor: "#F8FAFC",
                    padding: "4px",
                    borderRadius: "8px",
                  }}
                >
                  <Tabs.Tab value="Photos" fw={600} ff="Poppins" fz="xs" py={6}>
                    Photos ({report?.photos?.length || 0})
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="Questions"
                    fw={600}
                    ff="Poppins"
                    fz="xs"
                    py={6}
                  >
                    Structural Metrics
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="Surveys"
                    fw={600}
                    ff="Poppins"
                    fz="xs"
                    py={6}
                  >
                    Field Surveys
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="Photos" pt="lg">
                  <ScrollArea h={350} type="auto" offsetScrollbars>
                    {report?.photos?.length > 0 ? (
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        {report?.photos.map((p, index) => (
                          <Stack gap={"xs"} key={index}>
                            <Image
                              src={`${SERVER_IP}${p.image}`}
                              alt={p.description || "Damage photo"}
                              radius="md"
                              fallbackSrc="https://placehold.co/600x400?text=Image+Not+Found"
                              style={{ border: "1px solid #E2E8F0" }}
                            />
                            <Text size="sm" c="dimmed" ta="center">
                              {p.description}
                            </Text>
                          </Stack>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Paper withBorder p="xl" radius="md" bg="#F8FAFC">
                        <Text
                          size="sm"
                          c="dimmed"
                          fs="italic"
                          ta="center"
                          ff="Poppins"
                        >
                          No visual evidence attached to this report.
                        </Text>
                      </Paper>
                    )}
                  </ScrollArea>
                </Tabs.Panel>

                {/* Form Processing Subpanels */}
                <Tabs.Panel value="Questions" pt="md">
                  <ScrollArea h={320} type="auto" offsetScrollbars>
                    <Box pr="sm">
                      <QuestionsTabViewView
                        impactReportId={report?.id}
                        natureOfCrisis={report?.nature_of_crisis}
                        report={report}
                      />
                    </Box>
                  </ScrollArea>
                </Tabs.Panel>

                <Tabs.Panel value="Surveys" pt="md">
                  <ScrollArea h={320} type="auto" offsetScrollbars>
                    <Box pr="sm">
                      <SurveyTabView
                        impactReportId={report?.id}
                        natureOfCrisis={report?.nature_of_crisis}
                        report={report}
                      />
                    </Box>
                  </ScrollArea>
                </Tabs.Panel>
              </Tabs>
            </Box>
          )}

          {/* Collapsible Action Footer Segment */}
          <UnstyledButton
            onClick={toggleShowMore}
            style={{
              width: "100%",
              padding: "14px xl",
              borderTop: "1px solid #EAECEF",
              backgroundColor: showMore ? "#F8FAFC" : "#ffffff",
              borderBottomLeftRadius: "var(--mantine-radius-lg)",
              borderBottomRightRadius: "var(--mantine-radius-lg)",
              transition: "background-color 0.15s ease",
            }}
            styles={{
              root: {
                "&:hover": { backgroundColor: "var(--mantine-color-gray-0)" },
              },
            }}
          >
            <Group
              justify="space-between"
              align="center"
              wrap="nowrap"
              px="xl"
              py="xs"
            >
              <Group gap="xs" style={{ minWidth: 0 }}>
                <ThemeIcon
                  color="var(--mantine-color-gray-5)"
                  variant="subtle"
                  size="sm"
                >
                  <IconUserFilled size={15} />
                </ThemeIcon>
                <Text size="xs" fw={600} c="dimmed" ff="Poppins" lineClamp={1}>
                  Operator:{" "}
                  <Text component="span" c="#0D3B66" fw={700}>
                    {report?.reported_by?.user ||
                      report?.anonymous_reported_by ||
                      "Anonymous Field Officer"}
                  </Text>
                </Text>
              </Group>

              <Group gap={4} style={{ flexShrink: 0 }}>
                <Text
                  size="xs"
                  fw={700}
                  c="#009C9A"
                  ff="Poppins"
                  style={{ letterSpacing: "0.02em" }}
                >
                  {showMore ? "Collapse Context" : "Expand Matrix Data"}
                </Text>
                {showMore ? (
                  <IconChevronUp size={16} color="#009C9A" stroke={2.5} />
                ) : (
                  <IconChevronDown size={16} color="#009C9A" stroke={2.5} />
                )}
              </Group>
            </Group>
          </UnstyledButton>
        </Stack>
      </Card>
    </>
  );
}
