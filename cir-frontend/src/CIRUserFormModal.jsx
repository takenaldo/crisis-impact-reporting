import React from "react";
import {
  MantineProvider,
  createTheme,
  TextInput,
  PasswordInput,
  Select,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Grid,
  Stack,
  Divider,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import api from "./api";
import { notifications, showNotification } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

// --- Design System Configuration ---
// Extracting colors from the provided image
const COLORS = {
  navy: "#0D3B66", // Authority, trust
  teal: "#009C9A", // Verified, action
  redOrange: "#E76F51", // High severity
  amber: "#F4A261", // Medium severity
  mint: "#E6F4F1", // Calm surfaces
  pageBg: "#F4F7F9", // Extracted from image background
};

export default function CIRUserFormModal({ opened, onClose }) {
  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      location: "",
      job_title: "",
      organization: "",
    },

    validate: {
      // username: (value) =>
      //   value.length < 3 ? "Username must have at least 3 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must have at least 6 characters" : null,
      confirm_password: (value, values) => {
        if (values.password !== value) {
          return "Passwords not matching.";
        }
        if (!value) return "Confirm password is required.";
        return null;
      },

      job_title: (value) =>
        value.trim().length === 0 ? "Job title is required" : null,
      organization: (value) =>
        value.trim().length === 0 ? "Organization is required" : null,
    },
  });

  const handleSubmit = (values) => {
    values["username"] = values["first_name"] + values["last_name"];
    try {
      const response = api.post("user/create_account/", values);
      notifications.show({
        title: "Account Created Successfully",
        message: "Now You can Log in and contribute.",
        color: "#009C9A",
        icon: <IconCheck size={16} />,
      });
      form.reset();
      onClose();
    } catch (error) {}
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text
          style={{
            color: "#0D3B66",
            fontWeight: 700,
            fontSize: "1.2rem",
            fontFamily: "Montserrat",
          }}
        >
          Create Account
        </Text>
      }
      size="lg"
      radius="md"
      overlayProps={{
        color: "#0D3B66",
        opacity: 0.55,
        blur: 3,
      }}
      styles={{
        header: { borderBottom: "1px solid #E6F4F1", marginBottom: "10px" },
        content: { fontFamily: "Poppins, sans-serif" },
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.pageBg,
          minHeight: "100vh",
          padding: "40px 0",
        }}
      >
        <Container size="md">
          <Paper
            radius="lg"
            p="xl"
            shadow="sm"
            style={{ borderTop: `6px solid ${COLORS.navy}` }}
          >
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack spacing="md">
                <Title
                  order={5}
                  c={COLORS.teal}
                  mt="md"
                  style={{
                    borderBottom: `1px solid ${COLORS.mint}`,
                    paddingBottom: "8px",
                  }}
                >
                  Professional Profile
                </Title>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="First Name"
                      placeholder="John"
                      {...form.getInputProps("first_name")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Last Name"
                      placeholder="Doe"
                      {...form.getInputProps("last_name")}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 4 }}>
                    {/* <Select
                      label="Location"
                      placeholder="Select a region"
                      data={[
                        { value: "1", label: "Region Alpha" },
                        { value: "2", label: "Region Beta" },
                        { value: "3", label: "Region Gamma" },
                      ]}
                      {...form.getInputProps("location")}
                      searchable
                    /> */}
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      required
                      label="Job Title"
                      placeholder="e.g. Field Coordinator"
                      {...form.getInputProps("job_title")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      required
                      label="Organization"
                      placeholder="e.g. Red Cross"
                      {...form.getInputProps("organization")}
                    />
                  </Grid.Col>
                </Grid>

                <Title
                  order={5}
                  c={COLORS.teal}
                  style={{
                    borderBottom: `1px solid ${COLORS.mint}`,
                    paddingBottom: "8px",
                  }}
                >
                  Account Credentials
                </Title>

                {/* <Divider my="sm" color={COLORS.mint} /> */}

                <Grid>
                  <Grid.Col span={12}>
                    <TextInput
                      required
                      label="Email Address"
                      placeholder="john@example.com"
                      {...form.getInputProps("email")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <PasswordInput
                      required
                      label="Password"
                      placeholder="Secure password"
                      {...form.getInputProps("password")}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <PasswordInput
                      required
                      label="Confirm Password"
                      placeholder="Confirm Password"
                      {...form.getInputProps("confirm_password")}
                    />
                  </Grid.Col>
                </Grid>

                {/* Submit Block */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text size="xs" c="dimmed">
                    * The user's secure pseudonym will be generated
                    automatically upon saving.
                  </Text>
                  <Button type="submit" size="md" px="xl">
                    Create User Profile
                  </Button>
                </div>
              </Stack>
            </form>
          </Paper>
        </Container>
      </div>
    </Modal>
  );
}
