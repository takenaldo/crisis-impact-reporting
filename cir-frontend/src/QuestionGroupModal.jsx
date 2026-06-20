import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Text,
  NumberInput,
  Stack,
  Group,
  SimpleGrid,
  Box,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconMapPin, IconPlus, IconHelpCircle } from "@tabler/icons-react";
import QuestionForm from "./QuestionForm";
import api from "./api";

export function QuestionGroupModal({ opened, onClose, reportID }) {
  const [showQuestionAddModal, setShowQuestionAddModal] = useState(false);

  const form = useForm({
    initialValues: {
      latitude: "",
      longitude: "",
      distance_threshold_in_km: "",
      impact_report_id: reportID || "",
      duration: 2,
      questions: [],
    },
    validate: {
      latitude: (value) =>
        value === "" || value < -90 || value > 90 ? "Invalid Latitude" : null,
      longitude: (value) =>
        value === "" || value < -180 || value > 180 ? "Invalid Longitude" : null,
      distance_threshold_in_km: (value) =>
        value === "" || value < 0 ? "Must be a positive number" : null,
    },
  });

  // Sync state cleanly whenever a different row/report is chosen
  useEffect(() => {
    if (opened) {
      form.reset();
      form.setFieldValue("impact_report_id", reportID || "");
    }
  }, [reportID, opened]);

  const handleSubmit = async (values) => {
    try {
      const response = await api.post(
        "impact-reports/attach_questions_to_report/",
        values
      );
      console.log("Configuration saved successfully:", response.data);
      onClose();
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  };

  // Modern UI layout styling configuration
  const labelStyle = {
    label: {
      color: "#0D3B66",
      fontWeight: 600,
      fontFamily: "Montserrat, sans-serif",
      fontSize: "13px",
      marginBottom: "4px",
    },
    error: {
      fontFamily: "Poppins, sans-serif",
      fontSize: "11px",
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
              border: "1px dashed #009C9A"
            }}
          >
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="dimmed" fw={700} style={{ letterSpacing: "0.5px" }}>
                  Define precise geographical boundaries, and operational question  for  Reporters.
                </Text>
              </Box>
            </Group>
          </Box>


          {/* Location Parameter Grid */}
          <SimpleGrid cols={2} spacing="md">
            <NumberInput
              label="Latitude"
              placeholder="0.000000"
              decimalScale={6}
              leftSection={<IconMapPin size="1rem" color="#009C9A" />}
              withAsterisk
              styles={labelStyle}
              radius="md"
              {...form.getInputProps("latitude")}
            />
            <NumberInput
              label="Longitude"
              placeholder="0.000000"
              decimalScale={6}
              leftSection={<IconMapPin size="1rem" color="#009C9A" />}
              withAsterisk
              styles={labelStyle}
              radius="md"
              {...form.getInputProps("longitude")}
            />
          </SimpleGrid>

          {/* Threshold & Scope Parameters */}
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
                    border: "1px solid #009C9A"
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