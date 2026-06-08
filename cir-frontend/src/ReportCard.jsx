import {
  Badge,
  Box,
  Card,
  Group,
  Image,
  Stack,
  Tabs,
  Text,
  ActionIcon,
  SimpleGrid,
  ScrollArea,
  Divider,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconUserFilled,
  IconMapPin,
  IconCalendar,
} from "@tabler/icons-react";
import { useState } from "react";
import QuestionsTabView from "./QuestionsTabView";

// Helper to color-code severity if applicable
const getSeverityColor = (severity) => {
  if (!severity) return "gray";
  const s = severity.toLowerCase();
  if (s.includes("high") || s.includes("severe")) return "red";
  if (s.includes("medium") || s.includes("moderate")) return "orange";
  return "blue";
};

const ReportCard = ({ report }) => {
  const [showMore, setShowMore] = useState(false);

  // Cleanly extract the date
  const reportDate = report.damage_datetime
    ? String(report.damage_datetime).split("T")[0]
    : "Unknown Date";

  const toggleShowMore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMore((prev) => !prev);
  };

  return (
    <Card
      key={report.id}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      mt="sm"
    >
      <Stack gap="sm">
        {/* Header: Title and Type */}
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text size="lg" fw={700} c="dark.8">
              {report.infrastructure_name}
            </Text>
            <Text size="sm" c="dimmed" tt="uppercase" fw={600}>
              {report.infrastructure_type}
            </Text>
          </Box>
          <Badge
            variant="light"
            color={getSeverityColor(report.damage_severity)}
          >
            {report.damage_severity || "Severity Unknown"}
          </Badge>
        </Group>

        {/* Description */}
        <Text size="sm" c="dark.6" lh={1.5}>
          {report.description}
        </Text>

        {/* Tags / Metadata */}
        <Group gap="xs" mt="xs">
          {report.nature_of_crisis && (
            <Badge variant="outline" color="gray">
              {report.nature_of_crisis}
            </Badge>
          )}
          {report.debris && (
            <Badge variant="outline" color="brown">
              Debris
            </Badge>
          )}
          {report.accessibility && (
            <Badge variant="outline" color="red">
              Inaccessible
            </Badge>
          )}
        </Group>

        {/* Location & Date */}
        <Group gap="md" mt="xs">
          <Group gap={4}>
            <IconMapPin size={14} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {report.location?.country}, {report.location?.state_province},{" "}
              {report.location?.city}
            </Text>
          </Group>
          <Group gap={4}>
            <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {reportDate}
            </Text>
          </Group>
        </Group>

        <Divider mt="sm" />

        {/* Footer: User Info & Expand Toggle */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconUserFilled size={16} color="var(--mantine-color-gray-6)" />
            <Text size="sm" fw={500} c="dark.5">
              user123
            </Text>
          </Group>

          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={toggleShowMore}
            aria-label="Toggle details"
          >
            {showMore ? (
              <IconChevronUp size={20} />
            ) : (
              <IconChevronDown size={20} />
            )}
          </ActionIcon>
        </Group>

        {/* Expandable Tabs Section */}
        {showMore && (
          <Box mt="md" animate={{ opacity: 1 }} transition="fade">
            <Tabs defaultValue="Photos" variant="outline" radius="md">
              <Tabs.List>
                <Tabs.Tab value="Photos" fw={500}>
                  Photos ({report.photos?.length || 0})
                </Tabs.Tab>
                <Tabs.Tab value="Questions" fw={500}>
                  Questions
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="Photos" pt="md">
                {report.photos?.length > 0 ? (
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    {report.photos.map((p, index) => (
                      <Image
                        key={index}
                        src={`http://localhost:8000${p.image}`}
                        alt={p.description || "Damage photo"}
                        radius="md"
                        fallbackSrc="https://placehold.co/600x400?text=Image+Not+Found"
                      />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text size="sm" c="dimmed" fs="italic" ta="center" py="xl">
                    No photos available for this report.
                  </Text>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="Questions" pt="md">
                <ScrollArea h={350} type="auto" offsetScrollbars>
                  <QuestionsTabView
                    impactReportId={report.id}
                    natureOfCrisis={report.nature_of_crisis}
                  />
                </ScrollArea>
              </Tabs.Panel>
            </Tabs>
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default ReportCard;
