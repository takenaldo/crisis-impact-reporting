import { useState } from "react";
import {
  Anchor,
  Box,
  Button,
  Center,
  Flex,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Paper,
  Title,
  Divider,
} from "@mantine/core";
import api from "./api";
import { useNavigate } from "react-router-dom";
import CIRUserFormModal from "./CIRUserFormModal";

const LoginPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); // Clear previous errors
    setIsLoading(true);

    try {
      const response = await api.post("login/", {
        username: username,
        password: password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Invalid username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetValues = () => {
    if (!username) {
      setError("Username is required.");
    } else if (!password) {
      setError("Password is required.");
    } else {
      handleSubmit();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSetValues();
    }
  };

  return (
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
          <Stack gap="lg">
            <Box ta="center" mb="sm">
              <Text c="dimmed" size="sm" mt={5}>
                Sign in to your account to continue
              </Text>
            </Box>

            <Stack gap="md">
              <TextInput
                required
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                styles={{ label: { fontWeight: 500 } }}
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                styles={{ label: { fontWeight: 500 } }}
              />
            </Stack>

            {error && (
              <Text size="sm" c="var(--color-red-orange)" ta="center" fw={500}>
                {error}
              </Text>
            )}

            <Button
              fullWidth
              size="md"
              radius="md"
              loading={isLoading}
              onClick={handleSetValues}
              bg="var(--color-navy)"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
              styles={{
                root: {
                  "&:hover": {
                    backgroundColor: "var(--color-teal)",
                  },
                },
              }}
            >
              Sign In
            </Button>

            <Divider
              label="OR"
              labelPosition="center"
              color="var(--color-mint)"
            />

            {/* Secondary Action */}
            <Center>
              <Text size="sm" c="dimmed">
                Don't have an account?{" "}
                <Anchor
                  component="button"
                  type="button"
                  c="var(--color-teal)"
                  fw={600}
                  onClick={() => setShowCreateAccount(true)}
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Create one now
                </Anchor>
              </Text>
            </Center>
          </Stack>
        </Paper>
      </Box>

      <CIRUserFormModal
        opened={showCreateAccount}
        onClose={() => setShowCreateAccount(false)}
      />
    </Flex>
  );
};

export default LoginPage;
