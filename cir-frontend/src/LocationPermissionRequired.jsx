import {
  Container,
  Box,
  Card,
  Title,
  Text,
  Group,
  ThemeIcon,
  Timeline,
  Button,
} from "@mantine/core";
import {
  IconMapPinOff,
  IconSettings,
  IconRefresh,
  IconLock,
} from "@tabler/icons-react";

export function LocationPermissionRequired() {
  return (
    <Box
      style={{
        backgroundColor: "#E6F4F1", // Mint background - Calm surface
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Container size="sm" width="100%">
        <Card
          shadow="md"
          padding="xl"
          radius="md"
          withBorder
          style={{ borderColor: "#CDEBE6", background: "#FFFFFF" }}
        >
          {/* Header Warning Block */}
          <Group align="flex-start" wrap="nowrap" mb="xl">
            <ThemeIcon
              size={50}
              radius="md"
              style={{ backgroundColor: "#E76F51" }} // Red-Orange: High Severity
            >
              <IconMapPinOff size={28} color="#FFFFFF" />
            </ThemeIcon>
            <div>
              <Title
                order={2}
                style={{
                  color: "#0D3B66",
                  fontFamily: "Montserrat",
                  fontWeight: 700,
                }}
              >
                Location Access Blocked
              </Title>
              <Text
                size="sm"
                mt="xs"
                style={{
                  color: "#0D3B66",
                  opacity: 0.8,
                  fontFamily: "Poppins",
                }}
              >
                This platform requires valid coordinates to submit live
                operational field entries, verify regional data tracking, and
                map safe routing.
              </Text>
            </div>
          </Group>

          {/* Instruction Timeline */}
          <Box
            p="md"
            radius="md"
            mb="xl"
            style={{ backgroundColor: "#FFF4E5", border: "1px solid #FFE0B3" }} // Light Amber surface
          >
            <Text
              size="sm"
              fontWeight={600}
              style={{ color: "#94311C", fontFamily: "Montserrat" }}
              mb="md"
            >
              How to restore access in your browser:
            </Text>

            <Timeline color="#0d3b66" active={3} bulletSize={24} lineWidth={2}>
              <Timeline.Item
                bullet={<IconLock size={12} />}
                title={
                  <Text size="sm" fw={600} style={{ color: "#0D3B66" }}>
                    Click the Page Settings
                  </Text>
                }
              >
                <Text c="dimmed" size="xs">
                  Look at your browser address bar. Click the{" "}
                  <strong>Lock</strong> icon or{" "}
                  <strong>Settings Sliders</strong> sitting to the left of{" "}
                  {window.location.href}
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconSettings size={12} />}
                title={
                  <Text size="sm" fw={600} style={{ color: "#0D3B66" }}>
                    Adjust Location Token
                  </Text>
                }
              >
                <Text c="dimmed" size="xs">
                  Locate the <strong>Location</strong> setting and switch its
                  status toggle from{" "}
                  <span style={{ color: "#E76F51", fontWeight: 600 }}>
                    Blocked
                  </span>{" "}
                  to <strong>Allow</strong> or <strong>Ask</strong>.
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconRefresh size={12} />}
                title={
                  <Text size="sm" fw={600} style={{ color: "#0D3B66" }}>
                    Reload Page
                  </Text>
                }
              >
                <Text c="dimmed" size="xs">
                  Refresh your app interface to establish active device
                  connection positioning.
                </Text>
              </Timeline.Item>
            </Timeline>
          </Box>

          {/* Action Trigger */}
          <Button
            fullWidth
            size="md"
            radius="md"
            leftSection={<IconRefresh size={18} />}
            style={{
              backgroundColor: "#0D3B66", // Corporate Navy - Trust
              fontFamily: "Poppins",
            }}
            styles={{
              root: {
                "&:hover": {
                  backgroundColor: "#009C9A", // Hover changes safely to Action Teal
                },
              },
            }}
            onClick={() => window.location.reload()}
          >
            I Enabled It, Reload Page
          </Button>
        </Card>
      </Container>
    </Box>
  );
}
