import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Grid,
  Stack,
  Modal,
  Group,
  ActionIcon,
  Collapse,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconX,
} from "@tabler/icons-react";
import api from "./api";
import CirMap from "./map/CirMap";

const COLORS = {
  navy: "#0D3B66",
  teal: "#009C9A",
  mint: "#E6F4F1",
  pageBg: "#F4F7F9",
};

export default function CIRUserFormModal({ opened, onClose }) {
  const [locationData, setLocationData] = useState(null);
  const [locationOpen, setLocationOpen] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [initialPin, setInitialPin] = useState(null);
  const mapRef = useRef(null);

  const reverseGeocode = useCallback(async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "User-Agent": "CrisisImpactReporting/1.0" } }
      );
      const data = await res.json();
      const addr = data.address || {};
      const city =
        addr.city || addr.town || addr.village || addr.municipality || null;
      const displayText =
        [city, addr.state, addr.country].filter(Boolean).join(", ") ||
        `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;

      setLocationData({
        latitude: lat,
        longitude: lng,
        name: data.display_name || null,
        country: addr.country || null,
        state_province: addr.state || addr.region || null,
        city,
        street_address: addr.road || null,
        displayText,
      });
    } catch {
      // Geocode failed save lat/lng only
      setLocationData({
        latitude: lat,
        longitude: lng,
        name: null,
        country: null,
        state_province: null,
        city: null,
        street_address: null,
        displayText: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
      });
    } finally {
      setGeocoding(false);
    }
  }, []); // setGeocoding and setLocationData are stable React state setters

  // Called when user clicks the map to drop a pin (lat/lng keys)
  const handlePinChanged = useCallback(({ lat, lng }) => {
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      job_title: "",
      organization: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must have at least 6 characters" : null,
      confirm_password: (value, values) => {
        if (!value) return "Confirm password is required.";
        if (values.password !== value) return "Passwords not matching.";
        return null;
      },
      job_title: (value) =>
        value.trim().length === 0 ? "Job title is required" : null,
      organization: (value) =>
        value.trim().length === 0 ? "Organization is required" : null,
    },
  });

  useEffect(() => {
    if (!opened) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setMapCenter([lat, lng]);
          setMapZoom(12);
          setInitialPin([lat, lng]);
          reverseGeocode(lat, lng);
        },
        () => {}
      );
    }
    const t = setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 150);
    return () => clearTimeout(t);
  }, [opened, reverseGeocode]);

  const handleSubmit = async (values) => {
    const payload = { ...values };
    payload.username = values.first_name + values.last_name;
    delete payload.confirm_password;

    if (locationData) {
      payload.location_latitude = locationData.latitude;
      payload.location_longitude = locationData.longitude;
      if (locationData.name) payload.location_name = locationData.name;
      if (locationData.country) payload.location_country = locationData.country;
      if (locationData.state_province)
        payload.location_state_province = locationData.state_province;
      if (locationData.city) payload.location_city = locationData.city;
      if (locationData.street_address)
        payload.location_street_address = locationData.street_address;
    }

    try {
      await api.post("user/create_account/", payload);
      notifications.show({
        title: "Account Created Successfully",
        message: "Now you can log in and contribute.",
        color: "#009C9A",
        icon: <IconCheck size={16} />,
      });
      form.reset();
      setLocationData(null);
      setInitialPin(null);
      setMapCenter([20, 0]);
      setMapZoom(2);
      onClose();
    } catch (error) {
      notifications.show({
        title: "Registration Failed",
        message:
          error.response?.data?.detail ||
          "Something went wrong. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text
          style={{
            color: COLORS.navy,
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
      overlayProps={{ color: COLORS.navy, opacity: 0.55, blur: 3 }}
      styles={{
        header: { borderBottom: "1px solid #E6F4F1", marginBottom: "10px" },
        content: { fontFamily: "Poppins, sans-serif" },
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
              {/* Professional Profile */}
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
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    required
                    label="Job Title"
                    placeholder="e.g. Field Coordinator"
                    {...form.getInputProps("job_title")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    required
                    label="Organization"
                    placeholder="e.g. Red Cross"
                    {...form.getInputProps("organization")}
                  />
                </Grid.Col>
              </Grid>

              {/* Location */}
              <div>
                <Group
                  justify="space-between"
                  align="center"
                  style={{ cursor: "pointer", paddingBottom: "8px", borderBottom: `1px solid ${COLORS.mint}` }}
                  onClick={() => setLocationOpen((o) => !o)}
                >
                  <Title order={5} c={COLORS.teal}>
                    Your Location{" "}
                    <Text span size="xs" c="dimmed" fw={400}>
                      (Optional)
                    </Text>
                  </Title>
                  <ActionIcon variant="subtle" size="sm" color="gray">
                    {locationOpen ? (
                      <IconChevronUp size={16} />
                    ) : (
                      <IconChevronDown size={16} />
                    )}
                  </ActionIcon>
                </Group>

                <Collapse expanded={locationOpen}>
                  <div style={{ marginTop: 10 }}>
                    <div
                      style={{
                        height: 260,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <CirMap
                        center={mapCenter}
                        zoom={mapZoom}
                        height="260px"
                        locationPicker
                        initialPin={initialPin}
                        onPinChanged={handlePinChanged}
                        onMapReady={(map) => {
                          mapRef.current = map;
                        }}
                      />
                    </div>

                    <Group justify="space-between" mt={6} align="center">
                      {geocoding && (
                        <Group gap={6}>
                          <Loader size="xs" color="gray" />
                          <Text size="xs" c="dimmed">
                            Detecting location…
                          </Text>
                        </Group>
                      )}

                      {locationData && !geocoding && (
                        <>
                          <Text size="xs" c="dimmed">
                            📍 {locationData.displayText}
                          </Text>
                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            color="gray"
                            title="Clear location"
                            onClick={() => setLocationData(null)}
                          >
                            <IconX size={12} />
                          </ActionIcon>
                        </>
                      )}

                      {!locationData && !geocoding && (
                        <Text size="xs" c="dimmed">
                          Click anywhere on the map to set your location.
                        </Text>
                      )}
                    </Group>
                  </div>
                </Collapse>
              </div>

              {/* Account Credentials */}
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

              {/* Submit */}
              <Group justify="space-between" align="center">
                <Text size="xs" c="dimmed">
                  * A secure pseudonym will be generated automatically.
                </Text>
                <Button type="submit" size="md" px="xl">
                  Create User Profile
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Modal>
  );
}
