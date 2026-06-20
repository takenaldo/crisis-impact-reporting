import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Container,
  Divider,
  Drawer,
  Group,
  Image,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import QuestionsTabView from "./QuestionsTabView";
import {
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconMapPin,
  IconUserFilled,
  IconAlertCircleFilled,
  IconCircleOpenArrowDown,
  IconMapPinDown,
  IconExternalLink,
  IconClock,
  IconBuilding,
} from "@tabler/icons-react";
import { getSeverityColor, timeAgo } from "./utils";
import CirMap from "./map/CirMap";
import { MyDrawer } from "./MyDrawer";
import SurveyTabView from "./SurveyTabView";
import { SERVER_IP } from "./constants";

export default function ReportDetailsDrawer({ opened, onClose, report }) {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMore((prev) => !prev);
  };

  const [showMapView, setShowMapView] = useState(false);
  const [location, setLocation] = useState([]);

  return (
    <Drawer
      opened={opened}
      onClose={() => {
        onClose();
      }}
      position="bottom"
      size="90%"
      radius="xl"
      title={
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ flex: 1 }}>
            <Text
              size="xl"
              fw={800}
              c="var(--color-teal)"
              ff="Montserrat"
              lh={1.2}
              tt="uppercase"
            >
              Damage Report on{" "}
              {report?.infrastructure_name || "UnIdentified Infrastructure"}
            </Text>
          </Box>
        </Group>
      }
      withCloseButton={true}
      styles={{
        body: {
          height: "calc(100% - 95px)",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          backgroundColor: "#F0F4F8", // Off-white canvas to make the card pop
        },
      }}
    >
      <ScrollArea h="100%" offsetScrollbars type="never" style={{ flex: 1 }}>
        <Container
          size="sm"
          py={{ base: "xl", sm: "xl" }}
          pb="90px"
          px="md"
          style={{ position: "relative" }}
        >
          {/* Main Core Form Card Container */}
          <Card
            key={report?.id}
            shadow="md"
            padding={0} // We will handle padding inside for edge-to-edge footer
            radius="lg"
            withBorder
            style={{
              borderColor: "#E2E8F0",
              borderTop: "4px solid #009C9A", // Teal accent top border
              backgroundColor: "#ffffff",
            }}
          >
            <Stack gap={0}>
              {/* Main Content Padding Wrapper */}
              <Box p="lg">
                <Stack gap="md">
                  {/* Header: Title and Type */}

                  <Group gap="xs" mt="xs">
                    <Group gap={6} wrap="nowrap">
                      <Badge
                        color="var(--color-teal)"
                        variant="light"
                        size="xs"
                        radius="sm"
                        ff="Poppins"
                      >
                        {report?.damage_severity || "Unknown Severity"}
                      </Badge>
                      {report?.debris && (
                        <Badge
                          color="var(--color-teal)"
                          variant="light"
                          size="xs"
                          radius="sm"
                          ff="Poppins"
                        >
                          Debris
                        </Badge>
                      )}
                    </Group>

                    {/* <Badge
                      variant="light"
                      size="md"
                      radius="sm"
                      style={{
                        textTransform: "none",
                        fontWeight: 500,
                        backgroundColor: "var(--color-mint)",

                        color:
                          "var(" +
                          getSeverityColor(report?.damage_severity) +
                          ")",
                      }}
                    >
                      {report?.damage_severity} damage
                    </Badge>

                    {report?.debris && (
                      <Badge
                        variant="light"
                        color="var(--color-mint)"
                        size="md"
                        ff="Poppins"
                        fw={600}
                      >
                        Debris Present
                      </Badge>
                    )} */}
                  </Group>

                  <Group
                    justify="space-between"
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <IconBuilding size={16} color="var(--color-teal)" />
                    <Box style={{ flex: 1 }}>
                      <Text
                        size="xs"
                        c="dark.3"
                        ff="Poppins"
                        mb={4}
                        style={{ letterSpacing: "0.5px" }}
                      >
                        {report?.infrastructure_type || "Infrastructure"}
                      </Text>
                    </Box>
                  </Group>

                  {/* Description */}

                  {report?.description ? (
                    <Text size="sm" c="#334155" lh={1.6} ff="Poppins" mt="xs">
                      {report?.description}
                    </Text>
                  ) : (
                    <Text
                      size="sm"
                      c="var(--color-gray)"
                      lh={1.6}
                      ff="Poppins"
                      mt="xs"
                      fs={"italic"}
                    >
                      No detailed description provided for this report.
                    </Text>
                  )}

                  {/* Tags / Metadata */}

                  {/* Location & Date Information Strip */}
                  <Stack gap="xs">
                    {/* MAIN ACTIONABLE CARD: Location */}
                    <Paper
                      withBorder
                      p={{ base: "md", sm: "lg" }}
                      radius="lg"
                      shadow="sm"
                      bg="#E6F4F1" // Mint background
                      style={{ borderColor: "#E9ECEF" }}
                    >
                      <Group wrap="nowrap" align="flex-start" gap="md">
                        <ThemeIcon
                          color="#009C9A"
                          variant="light"
                          size="lg"
                          radius="xl"
                        >
                          <IconMapPin size={20} />
                        </ThemeIcon>

                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            size="xs"
                            c="dimmed"
                            tt="uppercase"
                            fw={700}
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              letterSpacing: "0.5px",
                            }}
                            mb={2}
                          >
                            Location
                          </Text>

                          <Group gap="xs" align="center">
                            <Text
                              size="sm"
                              c="#0D3B66"
                              fw={600}
                              style={{
                                fontFamily: "Poppins, sans-serif",
                                lineHeight: 1.2,
                              }}
                            >
                              {report?.location?.infrastructure_latitude?.toFixed(
                                3,
                              ) || "N/A"}
                              ,{" "}
                              {report?.location?.infrastructure_longitude?.toFixed(
                                3,
                              ) || "N/A"}
                            </Text>
                          </Group>

                          <Text
                            size="xs"
                            c="dimmed"
                            mt={4}
                            lineClamp={2}
                            style={{ fontFamily: "Poppins, sans-serif" }}
                          >
                            {[
                              report?.location?.city,
                              report?.location?.state_province,
                              report?.location?.country,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Unknown Address"}
                          </Text>
                        </Box>

                        {report?.location?.infrastructure_latitude &&
                          report?.location?.infrastructure_longitude && (
                            <ActionIcon
                              variant="light"
                              color="#009C9A"
                              size="lg"
                              radius="md"
                              aria-label="View on map"
                              onClick={() => {
                                setShowMapView(true);
                                setLocation([
                                  report?.location?.infrastructure_latitude,
                                  report?.location?.infrastructure_longitude,
                                ]);
                              }}
                            >
                              <IconExternalLink size={20} stroke={2} />
                            </ActionIcon>
                          )}
                      </Group>
                    </Paper>

                    {/* SECONDARY METADATA: Timestamp as small, subtle text to save space */}
                    <Group gap={6} justify="flex-end" px="sm">
                      <IconClock size={14} color="#868E96" stroke={2} />
                      <Text
                        size="xs"
                        c="dimmed"
                        fw={500}
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        Reported{" "}
                        {report?.damage_datetime
                          ? timeAgo(report?.damage_datetime)
                          : "at unknown time"}
                      </Text>
                    </Group>
                  </Stack>
                </Stack>
              </Box>

              {/* Expandable Media & Questions Section */}
              {showMore && (
                <Box px="lg" pb="lg" animate={{ opacity: 1 }} transition="fade">
                  <Divider mb="md" color="#E2E8F0" />
                  <Tabs
                    defaultValue="Photos"
                    variant="pills"
                    radius="xl"
                    color="#009C9A"
                  >
                    <Tabs.List grow>
                      <Tabs.Tab value="Photos" fw={600} ff="Poppins" fz="sm">
                        Photos ({report?.photos?.length || 0})
                      </Tabs.Tab>
                      <Tabs.Tab value="Questions" fw={600} ff="Poppins" fz="sm">
                        Questions
                      </Tabs.Tab>
                      <Tabs.Tab value="Surveys" fw={600} ff="Poppins" fz="sm">
                        Surveys
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="Photos" pt="lg">
                      {report?.photos?.length > 0 ? (
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                          {report?.photos.map((p, index) => (
                            <Stack gap={"xs"}>
                              <Image
                                key={index}
                                src={`${SERVER_IP}/${p.image}`}
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
                    </Tabs.Panel>

                    <Tabs.Panel value="Questions" pt="lg">
                      <ScrollArea h={350} type="auto" offsetScrollbars>
                        <QuestionsTabView
                          impactReportId={report?.id}
                          natureOfCrisis={report?.nature_of_crisis}
                          report={report}
                        />
                      </ScrollArea>
                    </Tabs.Panel>

                    <Tabs.Panel value="Surveys" pt="lg">
                      <ScrollArea h={350} type="auto" offsetScrollbars>
                        <SurveyTabView
                          impactReportId={report?.id}
                          natureOfCrisis={report?.nature_of_crisis}
                          report={report}
                        />
                      </ScrollArea>
                    </Tabs.Panel>
                  </Tabs>
                </Box>
              )}

              {/* Interactive Footer Toggle */}
              <UnstyledButton
                onClick={toggleShowMore}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderTop: "1px solid #E2E8F0",
                  backgroundColor: showMore ? "#F8FAFC" : "#ffffff",
                  borderBottomLeftRadius: "var(--mantine-radius-lg)",
                  borderBottomRightRadius: "var(--mantine-radius-lg)",
                  transition: "background-color 0.2s ease",
                }}
              >
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Group gap="xs">
                    <ThemeIcon color="gray" variant="subtle" size="sm">
                      <IconUserFilled size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={600} c="#64748B" ff="Poppins">
                      {" "}
                      <Text component="span" c="#0D3B66">
                        {report?.reported_by?.user ||
                          report?.anonymous_reported_by}
                      </Text>
                    </Text>
                  </Group>

                  <Group gap={4}>
                    <Text size="sm" fw={600} c="#009C9A" ff="Poppins">
                      {showMore ? "Hide Details" : "View Media & Details"}
                    </Text>
                    {showMore ? (
                      <IconChevronUp size={20} color="#009C9A" />
                    ) : (
                      <IconChevronDown size={20} color="#009C9A" />
                    )}
                  </Group>
                </Group>
              </UnstyledButton>
            </Stack>
          </Card>
        </Container>
      </ScrollArea>

      <MyDrawer
        opened={showMapView}
        onClose={() => {
          setShowMapView(false);
          setLocation([]);
        }}
      >
        {showMapView && location.length === 2 && (
          <CirMap
            center={location}
            zoom={15}
            height="500px"
            annotations={report?.annotations}
            userLocation={{ latitude: location[0], longitude: location[1] }}
          />
        )}
      </MyDrawer>
    </Drawer>
  );
}
