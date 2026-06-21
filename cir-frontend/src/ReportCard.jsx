import { Badge, Box, Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { getSeverityColor, timeAgo } from "./utils";
import { useTranslation } from "react-i18next";

// Helper Component for Report Cards
function ReportCard({ title, report, onClick }) {
  const { t } = useTranslation();

  // Resolve the CSS variable name for severity color (e.g., "--color-red")
  const severityColorVar = `var(${getSeverityColor(report?.damage_severity)})`;

  return (
    <Paper
      withBorder
      shadow="xs"
      radius="md"
      p="md"
      w="100%"
      onClick={onClick}
      style={{
        borderColor: "#EAECEF",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
      }}
      styles={{
        root: {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "var(--mantine-shadow-sm)",
            borderColor: "var(--color-teal)",
          },
        },
      }}
    >
      <Group wrap="nowrap" align="center" gap="md">
        {/* Left Side: Icon Container */}
        <ThemeIcon
          size={44}
          radius="md" // Shifted to soft square for a more industrial/modern UI
          bg="var(--color-mint)"
          c="var(--color-teal)"
          style={{ flexShrink: 0 }}
        >
          <IconHome size={20} stroke={1.5} />
        </ThemeIcon>

        {/* Center: Info Content */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            fz="sm"
            fw={600}
            c="var(--color-teal)"
            lh={1.3}
            lineClamp={2}
            style={{ letterSpacing: "-0.01em" }}
          >
            {(report?.infrastructure_name ? `${report.infrastructure_name} - ` : "") +
              (report?.infrastructure_type || "")}
          </Text>

          <Text fz="xs" c="dimmed" mt={3} fw={500}>
            {report?.damage_datetime && timeAgo(report?.damage_datetime)}
          </Text>
        </Box>

        {/* Right Side: Dynamically Colored Status Badge */}
        <Badge
          variant="filled"
          size="sm"
          radius="sm"
          style={{
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.02em",
            flexShrink: 0,
            // Uses a 12% alpha transparency layer of the actual status color for premium contrast
            backgroundColor: `rgba(${severityColorVar}, 0.12)`,
            color: severityColorVar,
            border: `1px solid rgba(${severityColorVar}, 0.2)`
          }}
        >
          {t(report?.damage_severity)}
        </Badge>
      </Group>
    </Paper>
  );
}

export default ReportCard;