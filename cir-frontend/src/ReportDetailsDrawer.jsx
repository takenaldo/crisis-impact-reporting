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
} from "@tabler/icons-react";
import { getSeverityColor, timeAgo } from "./utils";
import MapView from "./MapView";
import { MyDrawer } from "./MyDrawer";

export default function ReportDetailsDrawer({ opened, onClose, report }) {
  const [showMore, setShowMore] = useState(false);

  // Cleanly extract the date
  const reportDate = report?.damage_datetime
    ? String(report?.damage_datetime).split("T")[0]
    : "Unknown Date Time";

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
        <Title order={4} ff="Montserrat" c="#0D3B66" fw={700}>
          Report Details
        </Title>
      }
      withCloseButton={true}
      styles={{
        header: {
          paddingTop: "20px",
          paddingBottom: "20px",
          borderBottom: "1px solid #E2E8F0",
          backgroundColor: "#F8FAFC", // Very subtle background for header
        },
        title: {
          flex: 1,
          marginRight: "16px",
        },
        body: {
          height: "calc(100% - 95px)",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          backgroundColor: "#F0F4F8", // Off-white canvas to make the card pop
        },
        close: {
          size: "lg",
          color: "#0D3B66",
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
                  <Group
                    justify="space-between"
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <Box style={{ flex: 1 }}>
                      <Text
                        size="xl"
                        fw={800}
                        c="var(--coolor-navy)"
                        ff="Montserrat"
                        lh={1.2}
                      >
                        {report?.infrastructure_name}
                      </Text>

                      <Text
                        size="sm"
                        c="var(--coolor-navy)"
                        tt="uppercase"
                        fw={700}
                        ff="Poppins"
                        mb={4}
                        style={{ letterSpacing: "0.5px" }}
                      >
                        {report?.infrastructure_type || "Infrastructure"}
                      </Text>
                    </Box>
                  </Group>

                  <Group gap="xs" mt="xs">
                    <Badge
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
                    )}
                  </Group>

                  {/* High Priority Alert Box */}
                  {true && (
                    <Paper
                      bg="#FFF0ED"
                      p="xs"
                      radius="sm"
                      style={{ borderLeft: "4px solid #E76F51" }}
                    >
                      <Group gap="xs" wrap="nowrap">
                        <IconAlertCircleFilled color="#E76F51" size={20} />
                        <Text size="sm" c="#D9534F" fw={600} ff="Poppins">
                          Immediate action required at this site
                        </Text>
                      </Group>
                    </Paper>
                  )}

                  {/* Description */}

                  {report?.description ? (
                    <Text size="md" c="#334155" lh={1.6} ff="Poppins" mt="xs">
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
                  <Paper p="sm" radius="md" mt="sm">
                    <SimpleGrid cols={1} spacing="md">
                      <Group
                        gap="xs"
                        wrap="nowrap"
                        bg={"var(--color-mint)"}
                        p={5}
                        radius="sm"
                      >
                        <ThemeIcon
                          color="#009C9A"
                          variant="light"
                          size="md"
                          radius="xl"
                        >
                          <IconMapPin size={16} />
                        </ThemeIcon>
                        <Group justify="space-between" w={"100%"}>
                          <Stack gap={1}>
                            <Text
                              size="xs"
                              c="dimmed"
                              tt="uppercase"
                              fw={600}
                              ff="Poppins"
                            >
                              Location
                            </Text>
                            <Text
                              size="sm"
                              c="#0D3B66"
                              fw={500}
                              ff="Poppins"
                              style={{ lineHeight: 1.2 }}
                            >
                              {report?.location?.infrastructure_latitude?.toFixed(
                                3,
                              )}
                              ,
                              {report?.location?.infrastructure_longitude?.toFixed(
                                3,
                              )}
                              <br />
                              <Text component="span" size="xs" c="dimmed">
                                {report?.location?.city}{" "}
                                {report?.location?.state_province}{" "}
                                {report?.location?.country}
                              </Text>
                            </Text>
                          </Stack>
                          <IconExternalLink
                            size={24}
                            color="var(--color-teal)"
                            onClick={() => {
                              setShowMapView(true);
                              setLocation([
                                report?.location?.infrastructure_latitude,
                                report?.location?.infrastructure_longitude,
                              ]);
                            }}
                          />
                        </Group>
                      </Group>

                      <Group gap="xs" wrap="nowrap" bg={"var(--color-mint)"}>
                        <ThemeIcon
                          color="#009C9A"
                          variant="light"
                          size="md"
                          radius="xl"
                        >
                          <IconCalendar size={16} />
                        </ThemeIcon>
                        <Box>
                          <Text
                            size="xs"
                            c="dimmed"
                            tt="uppercase"
                            fw={600}
                            ff="Poppins"
                          >
                            Reported On
                          </Text>
                          <Text size="sm" c="#0D3B66" fw={500} ff="Poppins">
                            {/* {reportDate} */}
                            {report?.damage_datetime &&
                              timeAgo(report?.damage_datetime)}
                          </Text>
                        </Box>
                      </Group>
                    </SimpleGrid>
                  </Paper>
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
                        Questions & Surveys
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="Photos" pt="lg">
                      {report?.photos?.length > 0 ? (
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                          {report?.photos.map((p, index) => (
                            <Stack gap={"xs"}>
                              <Image
                                key={index}
                                src={`http://localhost:8000${p.image}`}
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
                        user123
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
        <MapView defaultPosition={location} />
      </MyDrawer>
    </Drawer>
  );
}
