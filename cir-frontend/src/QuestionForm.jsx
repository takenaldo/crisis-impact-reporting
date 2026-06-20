import React, { useEffect } from "react";
import {
  Modal,
  Button,
  Text,
  TextInput,
  Switch,
  TagsInput,
  Stack,
  Group,
  Title,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconHelpCircle, IconList } from "@tabler/icons-react";

export default function QuestionForm({ opened, onClose, form }) {
  const questionsForm = useForm({
    initialValues: {
      question: "",
      is_multiple_choice: false,
      choice_options: [],
    },
    validate: {
      question: (value) =>
        value.trim().length < 5 ? "Question must have at least 5 characters" : null,
      choice_options: (value, values) => {
        if (!values.is_multiple_choice) return null;
        if (!value || value.length < 2) return "Please provide at least two options.";
        if (value.length > 10) return "Maximum 10 options allowed.";
        return null;
      },
    },
  });

  // Automatically reset local form states cleanly when modal mounts/unmounts
  useEffect(() => {
    if (opened) {
      questionsForm.reset();
    }
  }, [opened]);

  const handleSubmit = (values) => {
    let formattedChoices = null;

    if (values.is_multiple_choice) {
      formattedChoices = {};
      const alphabetKeys = "abcdefghij";

      values.choice_options.forEach((optionText, index) => {
        if (index < 10) {
          const key = alphabetKeys[index];
          formattedChoices[key] = optionText.trim();
        }
      });
    }

    const payload = {
      question: values.question.trim(),
      is_multiple_choice: values.is_multiple_choice,
      choice_options: formattedChoices,
    };

    // Safely append new constructed sub-payload element to the main configuration parent form array state
    form.setFieldValue("questions", [...(form.values.questions || []), payload]);

    onClose();
  };

  const labelStyle = {
    label: {
      color: "#0D3B66",
      fontWeight: 600,
      fontFamily: "Montserrat, sans-serif",
      fontSize: "13px",
      marginBottom: "4px",
    },
    description: {
      fontFamily: "Poppins, sans-serif",
      fontSize: "11px",
      color: "#7a92a3",
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
            fontSize: "1.15rem",
            fontFamily: "Montserrat",
            letterSpacing: "-0.3px",
          }}
        >
          Add Survey Question
        </Text>
      }
      size="md"
      radius="lg"
      overlayProps={{
        color: "#0D3B66",
        opacity: 0.3,
        blur: 4,
      }}
      styles={{
        header: {
          borderBottom: "1px solid #E6F4F1",
          paddingBottom: "14px",
          paddingHorizontal: "24px",
        },
        content: {
          fontFamily: "Poppins, sans-serif",
        },
      }}
      centered
    >
      <form onSubmit={questionsForm.onSubmit(handleSubmit)}>
        <Stack gap="lg" pt="sm">

          <Box>
            <Title order={4} style={{ color: "#0D3B66", fontWeight: 700 }}>
              Create Question Parameter
            </Title>
            <Text size="xs" c="dimmed" mt={2}>
              Define precise structural questions targeted directly towards field responder evaluation sweeps.
            </Text>
          </Box>

          <TextInput
            label="Question Prompt"
            placeholder="e.g., What is the structural condition of the facility?"
            required
            radius="md"
            leftSection={<IconHelpCircle size="1.1rem" color="#009C9A" />}
            styles={labelStyle}
            {...questionsForm.getInputProps("question")}
          />

          <Box
            p="sm"
            style={{
              backgroundColor: "#F4F9F9",
              borderRadius: "8px",
              border: "1px solid #E6F4F1"
            }}
          >
            <Switch
              label="Multiple Choice Format"
              description="Toggle to structural choices payload matrix instead of free text responses."
              color="#009C9A"
              radius="xl"
              size="sm"
              styles={{
                label: { color: "#0D3B66", fontWeight: 600, fontSize: "13px" },
                description: { marginTop: "2px", fontSize: "11px", color: "#7a92a3" },
              }}
              {...questionsForm.getInputProps("is_multiple_choice", {
                type: "checkbox",
              })}
            />
          </Box>

          {questionsForm.values.is_multiple_choice && (
            <TagsInput
              label="Choice Options Matrix (Min 2, Max 10)"
              placeholder="Type option value and press Enter"
              description="Alphanumeric indices keys (a, b, c...) will assign automatically upon pipeline ingestion."
              required
              radius="md"
              clearable
              maxTags={10}
              leftSection={<IconList size="1.1rem" color="#009C9A" />}
              styles={{
                ...labelStyle,
                pill: {
                  backgroundColor: "#E6F4F1",
                  color: "#0D3B66",
                  fontWeight: 600,
                  fontSize: "12px",
                },
              }}
              {...questionsForm.getInputProps("choice_options")}
            />
          )}

          <Group justify="flex-end" gap="sm" mt="md" pt="md" style={{ borderTop: "1px solid #E6F4F1" }}>
            <Button variant="subtle" onClick={onClose} color="gray" radius="md" size="sm">
              Cancel
            </Button>
            <Button
              type="submit"
              radius="md"
              size="sm"
              leftSection={<IconCheck size="1.1rem" />}
              style={{ backgroundColor: "#009C9A", paddingInline: "20px", fontWeight: 600 }}
            >
              Append Question
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}