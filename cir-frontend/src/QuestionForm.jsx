import React from "react";
import {
  MantineProvider,
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Switch,
  TagsInput,
  Button,
  Stack,
  Group,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck } from "@tabler/icons-react";

const designTheme = {
  fontFamily: "'Poppins', sans-serif",
  headings: {
    fontFamily: "'Montserrat', sans-serif",
  },
  colors: {
    brandTeal: [
      "#e0f5f5",
      "#c2ebea",
      "#a3e0e0",
      "#85d6d5",
      "#66cccc",
      "#47c2c1",
      "#29b8b7",
      "#009C9A",
      "#007d7b",
      "#005e5c",
    ],
  },
  primaryColor: "brandTeal",
  primaryShade: 7,
};

export default function QuestionForm({ addQuestion, opened, onClose, form }) {
  const questionsForm = useForm({
    initialValues: {
      question: "",
      is_multiple_choice: false,
      choice_options: [], // We keep it an array in the UI state for easy editing
    },
    validate: {
      question: (value) =>
        value.length < 5 ? "Question must have at least 5 characters" : null,
      choice_options: (value, values) => {
        if (!values.is_multiple_choice) return null;
        if (value.length < 2) return "Please provide at least two options.";
        if (value.length > 10) return "Maximum 10 options allowed.";
        return null;
      },
    },
  });

  const handleSubmit = (values) => {
    // 1. Initialize the formatted choices as null
    let formattedChoices = null;

    // 2. If multiple choice, map the array to a JSON object with keys a-j
    if (values.is_multiple_choice) {
      formattedChoices = {};
      const alphabetKeys = "abcdefghij"; // Max 10 keys representing a-j

      values.choice_options.forEach((optionText, index) => {
        if (index < 10) {
          const key = alphabetKeys[index];
          formattedChoices[key] = optionText;
        }
      });
    }

    // 3. Construct the final payload for Django
    const payload = {
      question: values.question,
      is_multiple_choice: values.is_multiple_choice,
      choice_options: formattedChoices,
    };
    onClose();
    // Check your console to see the formatted JSON output
    console.log("Submitting to Django API:", payload);
    // e.g., Output: { "a": "Yes", "b": "No", "c": "Maybe" }

    form.setFieldValue("questions", [...form.values.questions, payload]);

    console.log(form.values);

    onClose();
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
          Add a Question
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
      <Container size="sm" py="xl">
        <Paper
          radius="md"
          p="xl"
          shadow="sm"
          bg="white"
          style={{ borderTop: "4px solid #0D3B66" }}
        >
          <Stack spacing="lg">
            <Group position="apart" align="flex-start">
              <div>
                <Title order={2} style={{ color: "#0D3B66", fontWeight: 700 }}>
                  Create New Question
                </Title>
                <Text
                  size="sm"
                  color="dimmed"
                  mt="xs"
                  style={{ fontWeight: 400 }}
                >
                  Define the question parameters for field reports.
                </Text>
              </div>
            </Group>

            <form onSubmit={questionsForm.onSubmit(handleSubmit)}>
              <Stack spacing="md">
                <TextInput
                  label="Question Prompt"
                  placeholder="e.g., What is the current status of the road?"
                  required
                  radius="md"
                  styles={{
                    label: {
                      color: "#0D3B66",
                      fontWeight: 500,
                      marginBottom: "4px",
                    },
                  }}
                  {...questionsForm.getInputProps("question")}
                />

                <Switch
                  label="Is this a multiple choice question?"
                  description="Toggle to allow users to select from a predefined list."
                  color="#009C9A"
                  radius="xl"
                  size="md"
                  styles={{
                    label: { color: "#0D3B66", fontWeight: 500 },
                    description: { marginTop: "2px" },
                  }}
                  {...questionsForm.getInputProps("is_multiple_choice", {
                    type: "checkbox",
                  })}
                />

                {questionsForm.values.is_multiple_choice && (
                  <TagsInput
                    label="Choice Options (Max 10)"
                    placeholder="Type an option and press Enter"
                    description="Keys (a, b, c...) will be assigned automatically upon saving."
                    required
                    radius="md"
                    clearable
                    maxTags={10} // Enforces the 10 item maximum in the UI
                    styles={{
                      label: {
                        color: "#0D3B66",
                        fontWeight: 500,
                        marginBottom: "4px",
                      },
                      pill: {
                        backgroundColor: "#E6F4F1",
                        color: "#0D3B66",
                        fontWeight: 500,
                      },
                    }}
                    {...questionsForm.getInputProps("choice_options")}
                  />
                )}

                <Group position="right" mt="xl">
                  <Button
                    type="submit"
                    radius="md"
                    size="md"
                    leftIcon={<IconCheck size="1.2rem" />}
                    style={{ backgroundColor: "#009C9A", fontWeight: 600 }}
                  >
                    Save Question
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Modal>
  );
}
