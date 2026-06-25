import {
  Container,
  Box,
  Card,
  Title,
  Text,
  Group,
  ThemeIcon,
  List,
  Button,
} from "@mantine/core";
import { IconMapPin, IconCheck } from "@tabler/icons-react";
import { useEffect } from "react";

export function LocationPermissionRequest({ onActivate }) {
  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = async () => {
    try {
      // The execution pauses here until the position is found or rejected
      const coords = await onActivate;
      console.log("Successfully got coordinates:", coords);
      // Do something with coords here (e.g., fetch weather, update map)
    } catch (err) {
      // This catches the rejected promise from the Context file
      // setError(err.message);
      // console.error("Location error:", err.message);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <Box
      style={{
        backgroundColor: "#E6F4F1", // Mint surface color
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
          {/* Header Action Section */}
          <Group align="flex-start" wrap="nowrap" mb="xl">
            <ThemeIcon
              size={50}
              radius="md"
              style={{ backgroundColor: "#009C9A" }} // Teal: Verified Action color
            >
              <IconMapPin size={26} color="#FFFFFF" />
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
                Enable Location Services
              </Title>
              <Text
                size="sm"
                mt="xs"
                style={{
                  color: "#0D3B66",
                  opacity: 0.9,
                  fontFamily: "Poppins",
                }}
              >
                To provide swift and accurate coordination, this platform relies
                on device location data to map and track active operations.
              </Text>
            </div>
          </Group>

          {/* Value Propositions / Why it's needed */}
          <Box
            p="md"
            radius="md"
            mb="xl"
            style={{ backgroundColor: "#E6F4F1", border: "1px solid #CDEBE6" }} // Light Mint background
          >
            <Text
              size="sm"
              fontWeight={600}
              style={{ color: "#0D3B66", fontFamily: "Montserrat" }}
              mb="xs"
            >
              Why location data matters:
            </Text>

            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon
                  color="brand.4"
                  size={20}
                  radius="xl"
                  style={{ backgroundColor: "#009C9A" }}
                >
                  <IconCheck size={12} />
                </ThemeIcon>
              }
              style={{ fontFamily: "Poppins", color: "#061E36" }}
            >
              <List.Item>
                Pins your dynamic field reports directly on operational tracking
                maps.
              </List.Item>
              <List.Item>
                Identifies safety hot zones and crisis boundaries nearest to
                your position.
              </List.Item>
              <List.Item>
                Connects community responders seamlessly with global dispatch
                coordination teams.
              </List.Item>
            </List>
          </Box>

          {/* Action Trigger */}
          <Button
            fullWidth
            size="md"
            radius="md"
            style={{
              backgroundColor: "#0D3B66", // Corporate Navy - Trust
              fontFamily: "Poppins",
              fontWeight: 500,
            }}
            styles={{
              root: {
                "&:hover": {
                  backgroundColor: "#009C9A", // Shifts elegantly to Action Teal on hover
                },
              },
            }}
            onClick={async () => await handleGetLocation()}
          >
            Share My Device Location
          </Button>

          <Text
            size="xs"
            c="dimmed"
            ta="center"
            mt="sm"
            style={{ fontFamily: "Poppins" }}
          >
            Please choose <strong>Allow</strong> when your browser prompts you
            for access.
          </Text>
        </Card>
      </Container>
    </Box>
  );
}
