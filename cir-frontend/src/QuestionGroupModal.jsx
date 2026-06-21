import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Text,
  NumberInput,
  TextInput,
  Stack,
  Group,
  SimpleGrid,
  Box,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconMapPin, IconPlus, IconHelpCircle, IconLock } from "@tabler/icons-react";
import QuestionForm from "./QuestionForm";
import api from "./api";

export function QuestionGroupModal({ opened, onClose, report }) {
  const [showQuestionAddModal, setShowQuestionAddModal] = useState(false);

  const form = useForm({
    initialValues: {
      latitude: "",
      longitude: "",
      distance_threshold_in_km: "",
      impact_report_id: "",
      duration: 2,
      questions: [],
    },
    validate: {
      distance_threshold_in_km: (value) =>
        value === "" || value < 0 ? "Must be a positive number" : null,
    },
  });

  // Re-sync form fields dynamically whenever a different report object is loaded
  useEffect(() => {
    if (opened && report) {
      form.reset();

      // Fallback strings to read both flat or nested location models safely
      const lat = report?.annotations?.incident_point?.geometry?.coordinates[0] ?? "";
      const lng = report?.annotations?.incident_point?.geometry?.coordinates[1] ?? "";

      form.setValues({
        impact_report_id: report?.id || "",
        latitude: lat !== "" ? String(lat) : "",
        longitude: lng !== "" ? String(lng) : "",
        distance_threshold_in_km: "",
        duration: 2,
        questions: [],
      });
    }
  }, [report, opened]);

  const handleSubmit = async (values) => {
    try {
      await api.post("impact-reports/attach_questions_to_report/", values);
      onClose();
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  };

  // Standard styling context configurations
  const labelStyle = {
    label: {
      color: "#0D3B66",
      fontWeight: 600,
      fontFamily: "Montserrat, sans-serif",
      fontSize: "13px",
      marginBottom: "4px",
    },
    input: {
      fontFamily: "Poppins, sans-serif",
    },
    error: {
      fontFamily: "Poppins, sans-serif",
      fontSize: "11px",
    },
  };

  // Dedicated explicit styling configuration override for Locked Read-Only Layout Fields
  const readOnlyFieldStyle = {
    ...labelStyle,
    input: {
      backgroundColor: "#F1F3F5",
      color: "#495057",
      cursor: "not-allowed",
      border: "1px solid #CED4DA",
      fontFamily: "Poppins, sans-serif",
      fontWeight: 500,
    },
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
            letterSpacing: "-0.3px",
          }}
        >
          Question Group Configuration
        </Text>
      }
      size="lg"
      radius="lg"
      overlayProps={{
        color: "#0D3B66",
        opacity: 0.4,
        blur: 4,
      }}
      styles={{
        header: {
          borderBottom: "1px solid #E6F4F1",
          paddingBottom: "16px",
          paddingHorizontal: "24px",
        },
        content: {
          fontFamily: "Poppins, sans-serif",
          padding: "8px",
        },
      }}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg" pt="md">

          {/* Target Metadata Banner Context */}
          <Box
            p="md"
            style={{
              backgroundColor: "#F4F9F9",
              borderRadius: "10px",
              border: "1px dashed #009C9A",
            }}
          >
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="dimmed" fw={700} style={{ letterSpacing: "0.5px" }}>
                  TARGET IMPACT REPORT
                </Text>
                <Text size="sm" fw={600} c="#0D3B66" mt={2}>
                  {report?.infrastructure_name || "N/A"} 
                </Text>
              </Box>
              <IconHelpCircle size={20} color="#009C9A" opacity={0.7} />
            </Group>
          </Box>

          <Text size="xs" c="dimmed" style={{ marginTop: "-8px" }}>
            Define precise geographical boundaries, and operational questions for Reporters.
          </Text>

          {/* Read-Only Location Parameter Text Field Rows */}
          <SimpleGrid cols={2} spacing="md">
            <TextInput
              label="Latitude"
              placeholder="Locked"
              readOnly
              leftSection={<IconMapPin size="1rem" color="#7a92a3" />}
              rightSection={<IconLock size="0.85rem" color="#adb5bd" />}
              styles={readOnlyFieldStyle}
              radius="md"
              {...form.getInputProps("latitude")}
            />
            <TextInput
              label="Longitude"
              placeholder="Locked"
              readOnly
              leftSection={<IconMapPin size="1rem" color="#7a92a3" />}
              rightSection={<IconLock size="0.85rem" color="#adb5bd" />}
              styles={readOnlyFieldStyle}
              radius="md"
              {...form.getInputProps("longitude")}
            />
          </SimpleGrid>

          {/* Editable Metrics Input Section */}
          <SimpleGrid cols={2} spacing="md">
            <NumberInput
              label="Distance Threshold (km)"
              placeholder="e.g. 5.0"
              decimalScale={2}
              min={0}
              withAsterisk
              styles={labelStyle}
              radius="md"
              {...form.getInputProps("distance_threshold_in_km")}
            />
            <NumberInput
              label="Active Duration (Days)"
              placeholder="e.g. 2"
              min={1}
              withAsterisk
              styles={labelStyle}
              radius="md"
              {...form.getInputProps("duration")}
            />
          </SimpleGrid>

          <Divider color="#E6F4F1" my="xs" />

          {/* Question List Section Layout */}
          <Group justify="space-between" align="center">
            <Box>
              <Text fw={600} size="sm" c="#0D3B66">Survey Questions Payload</Text>
              <Text size="xs" c="dimmed">Attach dynamic field questions to this execution cluster</Text>
            </Box>

            <Group gap="xs">
              {form.values?.questions?.length > 0 && (
                <Box
                  px="xs"
                  py={4}
                  style={{
                    backgroundColor: "#E6F4F1",
                    borderRadius: "6px",
                    border: "1px solid #009C9A",
                  }}
                >
                  <Text size="xs" fw={700} c="#009C9A">
                    {form.values.questions.length} Assigned
                  </Text>
                </Box>
              )}
              <Button
                size="xs"
                variant="light"
                color="teal"
                radius="md"
                leftSection={<IconPlus size={14} />}
                onClick={() => setShowQuestionAddModal(true)}
              >
                Add Question
              </Button>
            </Group>
          </Group>

          {/* Action Footer Button Alignment */}
          <Group justify="flex-end" gap="sm" mt="xl" pt="md" style={{ borderTop: "1px solid #E6F4F1" }}>
            <Button variant="subtle" onClick={onClose} color="gray" radius="md">
              Cancel
            </Button>
            <Button
              type="submit"
              leftSection={<IconCheck size="1.1rem" />}
              radius="md"
              style={{ backgroundColor: "#009C9A", paddingInline: "24px" }}
            >
              Save Configuration
            </Button>
          </Group>
        </Stack>

        {showQuestionAddModal && (
          <QuestionForm
            opened={showQuestionAddModal}
            onClose={() => setShowQuestionAddModal(false)}
            form={form}
          />
        )}
      </form>
    </Modal>
  );
}