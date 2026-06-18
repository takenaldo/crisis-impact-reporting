import {
  Button,
  Center,
  Group,
  Stack,
  Text,
  Paper,
  ThemeIcon,
  Badge,
  Flex,
  Box,
} from "@mantine/core";
import { IconBuilding, IconUser, IconLogout } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "./utils";
import LoginPage from "./LoginPage";

const Profile = () => {
  const navigate = useNavigate();
  const user = getUserDetails();

  // Color palette from your design system
  const colors = {
    navy: "#0D3B66",
    teal: "#009C9A",
    redOrange: "#E76F51",
    mint: "#E6F4F1",
  };

  return (
    // Added a subtle background color to the Center to make the white card pop
    <Center h="100%" bg="#F4F8F9">
      {user ? (
        <Flex
          h="100vh"
          justify="center"
          align="center"
          // bg="var(--color-mint)"
          p={20}
        >
          <Box w="100%" maw={420}>
            <Paper
              radius="lg"
              p="xl"
              shadow="md"
              bg="white"
              style={{
                borderTop: "6px solid var(--color-navy)",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {/* <Paper
                shadow="sm"
                radius="md"
                p="xl"
                bg="white"
                w={320}
                withBorder={false}
              > */}
              <Stack gap="md">
                {/* User Header Section */}
                <Group align="center" wrap="nowrap">
                  <ThemeIcon
                    size={48}
                    radius="md"
                    bg={colors.mint}
                    c={colors.teal}
                  >
                    <IconUser size={24} />
                  </ThemeIcon>

                  <Stack gap={2}>
                    <Text
                      c={colors.navy}
                      fw={700}
                      size="lg"
                      ff="Montserrat, sans-serif"
                      lh={1.2}
                    >
                      {user?.first_name} {user?.last_name}
                    </Text>

                    {/* Optional: Added a pill/badge matching your "Mobile/Web" tags */}
                    <Badge
                      bg={colors.mint}
                      c={colors.teal}
                      size="sm"
                      radius="sm"
                      ff="Poppins, sans-serif"
                      fw={500}
                      variant="filled"
                    >
                      Active User
                    </Badge>
                  </Stack>
                </Group>

                {/* Organization Info */}
                <Group gap="sm" mt="xs">
                  <IconBuilding size={18} color={colors.navy} opacity={0.6} />
                  <Text
                    c={colors.navy}
                    size="sm"
                    ff="Poppins, sans-serif"
                    opacity={0.8}
                  >
                    {user?.organization} - {user?.job_title}
                  </Text>
                </Group>

                {/* Logout Action */}
                <Button
                  leftSection={<IconLogout size={18} />}
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    localStorage.removeItem("user");
                    navigate("/auth_check");
                  }}
                  bg={colors.redOrange}
                  c="white"
                  mt="md"
                  radius="md"
                  size="md"
                  ff="Poppins, sans-serif"
                  fw={500}
                  fullWidth
                >
                  Log Out
                </Button>
              </Stack>
              {/* </Paper> */}
            </Paper>
          </Box>
        </Flex>
      ) : (
        <LoginPage />
      )}
    </Center>
  );
};

export default Profile;
