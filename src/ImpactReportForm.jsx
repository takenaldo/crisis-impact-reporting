import {
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
  Container,
  Title,
  Paper,
  Stack,
  FileInput,
  Fieldset,
  SimpleGrid,
  Radio,
  Notification,
  Group,
  Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import MapComponent from "./MapComponent";
import { IconApi } from "@tabler/icons-react";

import { api } from "./utils"; // Adjust the path as needed
import { useNavigate, useParams } from "react-router-dom";

// Mocking the Django constants from your .constants file
const CRISIS_CATEGORIES = [
  { value: "NATURAL", label: "Natural Disaster" },
  { value: "HUMAN", label: "Human-Made Crisis" },
];

const DAMAGE_SEVERITIES = [
  { value: "NO DAMAGE", label: "No Damage" },
  { value: "MINIMAL", label: "Minimal" },
  { value: "PARTIAL", label: "Partial" },
  { value: "COMPLETE", label: "Complete" },
];

export default function ImpactReportForm() {
  const { id, name } = useParams();

  const form = useForm({
    initialValues: {
      // Impact Report Base
      crisis_id: id || "",
      description: "",
      natureOfCrisis: "",
      natureOfCrisisCategory: "",
      damageSeverity: "",
      damageDatetime: null,

      // Infrastructure Details
      infrastructureName: "",
      infrastructureType: "",
      infrastructureDescription: "",
      accessibility: true,
      debris: false,
      debrisDescription: "",

      // Location (Maps to InfrastructureLocation model)
      infrastructure_latitude: "",
      infrastructure_longitude: "",
      street_address: "",

      city: "",
      state_province: "",
      country: "",
      street_address: "",
      // Photos (Maps to ManyToMany Photo model)
      photos: [],
    },
  });

  // 2. Handle form submission
  const handleSubmit = async (values) => {
    const formData = new FormData();

    // Append each selected file to the FormData object
    values.photos.forEach((file) => {
      formData.append("photos", file); // 'photos' is the field name your backend expects
    });

    formData.append("crisis_id", values.crisis);

    formData.append("description", values.description);
    formData.append("natureOfCrisis", values.natureOfCrisis);
    formData.append("natureOfCrisisCategory", values.natureOfCrisisCategory);
    formData.append("damageSeverity", values.damageSeverity);
    formData.append(
      "damageDatetime",
      values.damageDatetime
        ? values.damageDatetime.toISOString()
        : new Date().toISOString(),
    );

    formData.append("infrastructureName", values.infrastructureName);
    formData.append("infrastructureType", values.infrastructureType);
    formData.append(
      "infrastructureDescription",
      values.infrastructureDescription,
    );
    formData.append("accessibility", values.accessibility);
    formData.append("debris", values.debris);
    formData.append("debrisDescription", values.debrisDescription);

    formData.append("infrastructure_latitude", values.infrastructure_latitude);
    formData.append(
      "infrastructure_longitude",
      values.infrastructure_longitude,
    );
    formData.append("street_address", values.street_address);
    formData.append("city", values.city);
    formData.append("state_province", values.state_province);
    formData.append("country", values.country);

    try {
      // 3. Send to your API
      const response = await api.post("/impact-reports/", formData);

      if (response.ok) {
        alert("Upload successful!");

        form.reset(); // Clear the form on success
        // navigate("/"); // Redirect to homepage or another page as needed

        Notification.show({
          title: "Report Submitted",
          message: "Your impact report has been successfully submitted.",
          color: "green",
          icon: <IconApi />,
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <Container size="sm" py={{ base: "md", sm: "xl" }}>
      <Paper withBorder shadow="sm" p={{ base: "md", sm: "xl" }} radius="md">
        <Title order={2} ta="center" mb="lg">
          Submit Impact Report
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl">
            {id && name && (
              <Group>
                <Text size="sm" c="dimmed">
                  Adding report for crisis:{" "}
                </Text>
                <Text component="span" size="lg" c={"#fa5252"} fw={"bolder"}>
                  {name}
                </Text>
              </Group>
            )}
            {/* SECTION 2: Infrastructure & Damage */}
            <Fieldset legend="Infrastructure & Damage" radius="md">
              <Stack gap="md">
                <FileInput
                  label="Photos"
                  placeholder="Upload images of the damage"
                  multiple
                  accept="image/png,image/jpeg,image/heic"
                  {...form.getInputProps("photos")}
                />

                <Textarea
                  label="General Description"
                  placeholder="Describe the overall situation..."
                  autosize
                  minRows={2}
                  {...form.getInputProps("description")}
                />

                <TextInput
                  label="Infrastructure Name"
                  placeholder="e.g., Main Street Bridge"
                  {...form.getInputProps("infrastructureName")}
                />
                <TextInput
                  label="Infrastructure Type"
                  placeholder="e.g., bridge, road, building"
                  {...form.getInputProps("infrastructureType")}
                />

                <Radio.Group
                  label="Damage Severity"
                  required
                  {...form.getInputProps("damageSeverity")}
                >
                  <Stack gap="xs" mt="sm">
                    {DAMAGE_SEVERITIES.map((severity) => (
                      <Radio
                        key={severity.value}
                        value={severity.value}
                        label={severity.label}
                      />
                    ))}
                  </Stack>
                </Radio.Group>

                {/* Checkboxes grouped for easy tapping on mobile */}
                <Stack gap="xs" mt="sm">
                  <Checkbox
                    label="Infrastructure is accessible"
                    {...form.getInputProps("accessibility", {
                      type: "checkbox",
                    })}
                  />
                  <Checkbox
                    label="Debris is present at the site"
                    {...form.getInputProps("debris", { type: "checkbox" })}
                  />
                </Stack>
              </Stack>
            </Fieldset>

            {/* SECTION 3: Location */}
            <Fieldset legend="Location Details" radius="md">
              <Stack gap="md">
                <TextInput
                  label="Country"
                  placeholder="e.g., United States"
                  {...form.getInputProps("country")}
                />
                <TextInput
                  label="State/Province"
                  placeholder="e.g., California"
                  {...form.getInputProps("state_province")}
                />

                <TextInput
                  label="Street Address"
                  placeholder="123 Main St"
                  {...form.getInputProps("street_address")}
                />
                <TextInput
                  label="City"
                  placeholder="City Name"
                  {...form.getInputProps("city")}
                />

                <MapComponent form={form} />

                {/* SimpleGrid allows side-by-side inputs on slightly larger screens, 
                    but falls back to 1 column on small phones */}
                {/* <SimpleGrid cols={{ base: 1, xs: 2 }}>
                  <TextInput
                    label="Latitude"
                    placeholder="e.g., 9.0320"
                    type="number"
                    {...form.getInputProps("latitude")}
                  />
                  <TextInput
                    label="Longitude"
                    placeholder="e.g., 38.7482"
                    type="number"
                    {...form.getInputProps("longitude")}
                  />
                </SimpleGrid> */}
              </Stack>
            </Fieldset>

            {/* SECTION 4: Media */}
            {/* <Fieldset legend="Media Upload" radius="md">
              <FileInput
                label="Photos"
                placeholder="Upload images of the damage"
                multiple
                accept="image/png,image/jpeg,image/heic"
                {...form.getInputProps("photos")}
              />
            </Fieldset> */}

            {/* Submit Button */}
            <Button type="submit" fullWidth size="lg" mt="md" color="red">
              Submit Report
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
