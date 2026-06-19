import { Badge, Box, Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { getSeverityColor, timeAgo } from "./utils";
import { useTranslation } from "react-i18next";

// Helper Component for Report Cards
function ReportCard({ title, report, onClick }) {
  const { t } = useTranslation();
  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      style={{ borderColor: "#E9ECEF" }}
      onClick={onClick}
    >
      <Group wrap="nowrap" align="center">
        <ThemeIcon
          size={46}
          radius="xl"
          bg={"var(--color-mint)"}
          c={"var(--color-teal)"}
        >
          <IconHome size={22} stroke={1.5} />
        </ThemeIcon>

        <Box style={{ flex: 1 }}>
          <Text fz="sm" fw={600} c={"var(--color-teal)"} lh={1.2} lineClamp={3}>
            {(report?.infrastructure_name + " - " || "") +
              report?.infrastructure_type}
          </Text>
          <Text fz="xs" c={"gray"} mt={4}>
            {report?.damage_datetime && timeAgo(report?.damage_datetime)}
          </Text>
        </Box>

        <Badge
          variant="light"
          size="md"
          radius="sm"
          style={{
            textTransform: "none",
            fontWeight: 500,
            backgroundColor: "var(--color-mint)",
            color: "var(" + getSeverityColor(report?.damage_severity) + ")",
          }}
        >
          {t(report?.damage_severity)}
        </Badge>
      </Group>
    </Paper>
  );
}

export default ReportCard;
