import React, { useState } from "react";
import {
  Modal,
  Button,
  Text,
  NumberInput,
  Select,
  Stack,
  Group,
  SimpleGrid,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCheck, IconMapPin, IconCalendarEvent } from "@tabler/icons-react";
import QuestionForm from "./QuestionForm";
import api from "./api";

export function QuestionGroupModal({ opened, onClose, reportID }) {
  const [showQuestionAddModal, setShowQuestionAddModal] = useState(false);

  const form = useForm({
    initialValues: {
      latitude: "",
      longitude: "",
      distance_threshold_in_km: "",
      impact_report_id: reportID,
      duration: 2,
      questions: [],
    },
    validate: {
      latitude: (value) =>
        value === "" || value < -90 || value > 90 ? "Invalid Latitude" : null,
      longitude: (value) =>
        value === "" || value < -180 || value > 180
          ? "Invalid Longitude"
          : null,
      distance_threshold_in_km: (value) =>
        value === "" || value < 0 ? "Must be a positive number" : null,
    },
  });

  const handleSubmit = async (values) => {
    // const payload = {
    //   ...values,
    // };

    try {
      const response = await api.post(
        "impact-reports/attach_questions_to_report/",

        values,
      );

      console.log(",,,,,,,,,,,,", response.log);
    } catch (error) {}

    console.log("payload...", values);
  };

  // Common label style from the design system (Navy #0D3B66)
  const labelStyle = {
    label: {
      color: "#0D3B66",
      fontWeight: 600,
      fontFamily: "Montserrat, sans-serif",
    },
    description: { fontFamily: "Poppins, sans-serif" },
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
          Question Group Configuration
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
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Text size="sm" color="dimmed">
            Set location boundaries and active duration for this group.
          </Text>

          {/* Location Grid */}
          <SimpleGrid cols={2} breakpoints={[{ maxWidth: "xs", cols: 1 }]}>
            <NumberInput
              label="Latitude"
              placeholder="0.0000"
              precision={6}
              icon={<IconMapPin size="1rem" color="#009C9A" />}
              required
              styles={labelStyle}
              {...form.getInputProps("latitude")}
            />
            <NumberInput
              label="Longitude"
              placeholder="0.0000"
              precision={6}
              icon={<IconMapPin size="1rem" color="#009C9A" />}
              required
              styles={labelStyle}
              {...form.getInputProps("longitude")}
            />
          </SimpleGrid>

          <NumberInput
            label="Distance Threshold (km)"
            placeholder="e.g. 5.0"
            precision={2}
            min={0}
            required
            styles={labelStyle}
            {...form.getInputProps("distance_threshold_in_km")}
          />

          {/* Timeframe Grid */}
          <NumberInput
            label="Number of Days"
            placeholder="Number of Days"
            {...form.getInputProps("duration")}
          />
          <Group justify="right">
            <Button
              onClick={() => {
                setShowQuestionAddModal(true);
              }}
              justify="right"
            >
              Add Question
            </Button>
            {form.values?.questions?.length > 0 && (
              <Text>{form.values?.questions?.length} Questions</Text>
            )}
          </Group>
          <Group position="right" mt="xl">
            <Button variant="subtle" onClick={onClose} color="gray">
              Cancel
            </Button>
            <Button
              type="submit"
              leftIcon={<IconCheck size="1.2rem" />}
              style={{ backgroundColor: "#009C9A" }}
            >
              Save Configuration
            </Button>
          </Group>
        </Stack>

        {
          <QuestionForm
            opened={showQuestionAddModal}
            onClose={() => {
              setShowQuestionAddModal(false);
            }}
            form={form}
          />
        }
      </form>
    </Modal>
  );
}
