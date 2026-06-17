import React, { useState } from "react";
import api from "./api";
import {
  Group,
  Paper,
  Radio,
  Stack,
  Text,
  TextInput,
  Badge,
  Button,
} from "@mantine/core";

const QuestionsForImpactReport = ({ group, report }) => {
  const [localAnswers, setLocalAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const reportId = report?.id || null;

  // Track field changes locally inside this specific report block
  const handleAnswerChange = (questionId, val) => {
    setLocalAnswers((prev) => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        report_id: reportId,
        answer: val,
      },
    }));
  };

  const handleReportSubmit = async () => {
    // Convert local dict mapping into a payload array filtering empty text rows
    const submissionPayload = Object.values(localAnswers).filter(
      (item) => item.answer.trim() !== "",
    );

    if (submissionPayload.length === 0) {
      alert(
        "Please provide at least one answer for this report section before submitting.",
      );
      return;
    }

    setSubmitting(true);
    try {
      // Fires the array payload for this report context only
      await api.post("/answers/set_survey_answers/", submissionPayload);

      setLocalAnswers({}); // Clear form inputs for this section on success
    } catch (err) {
      alert(`Submission failure: ${err.message || "Something went wrong."}`);
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.values(localAnswers).filter(
    (i) => i.answer.trim() !== "",
  ).length;

  return (
    <Paper
      withBorder
      radius="md"
      shadow="0 1px 3px rgba(0,0,0,0.05)"
      styles={{ root: { overflow: "hidden" } }}
    >
      {/* --- Minimalist Report Header Holder --- */}
      {report ? (
        <div
          style={{
            backgroundColor: "#F8F9FA",
            padding: "12px 16px",
            borderBottom: "1px solid #E9ECEF",
          }}
        >
          <Stack gap={5}>
            <Stack gap={2}>
              <Text ff="Poppins" size="sm" fw={600} c="var(--color-teal, teal)">
                {report.infrastructure_name || "General Incident Area"}
              </Text>
              <Text ff="Poppins" size="xs" c="dimmed" lineClamp={1}>
                {report.nature_of_crisis_category} •{" "}
                {report.infrastructure_type}
              </Text>
            </Stack>

            <Group gap={6} wrap="nowrap">
              <Badge
                color="red"
                variant="light"
                size="xs"
                radius="sm"
                ff="Poppins"
              >
                {report.damage_severity}
              </Badge>
              {report.debris && (
                <Badge
                  color="red"
                  variant="light"
                  size="xs"
                  radius="sm"
                  ff="Poppins"
                >
                  Debris
                </Badge>
              )}
            </Group>
          </Stack>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#F8F9FA",
            padding: "12px 16px",
            borderBottom: "1px solid #E9ECEF",
          }}
        >
          <Text ff="Poppins" size="xs" fw={500} c="dimmed">
            General Location Tasks
          </Text>
        </div>
      )}

      {/* --- Embedded Questions List --- */}
      <Stack gap={0} p="md" bg="white">
        {group.questions.map((question, index) => {
          const currentAnswerValue = localAnswers[question.id]?.answer || "";

          return (
            <Stack
              key={question.id}
              gap="xs"
              style={{
                borderBottom: "1px dashed #E9ECEF",
                paddingBottom: "16px",
                paddingTop: index === 0 ? 0 : "16px",
              }}
            >
              <Group align="flex-start" wrap="nowrap">
                <Text ff="Poppins" size="xs" fw={600} c="teal.6" mt={2}>
                  Q{index + 1}.
                </Text>
                <Text
                  fw={500}
                  size="sm"
                  ff="Poppins"
                  c="dark.4"
                  style={{ flex: 1 }}
                >
                  {question.question}
                </Text>
              </Group>

              <div style={{ paddingLeft: "24px" }}>
                {question.is_multiple_choice && question.choice_options ? (
                  <Radio.Group
                    value={currentAnswerValue}
                    onChange={(val) => handleAnswerChange(question.id, val)}
                  >
                    <Group gap="lg" mt={4}>
                      {Array.isArray(question.choice_options)
                        ? question.choice_options.map((option, idx) => (
                            <Radio
                              key={idx}
                              value={option}
                              label={option}
                              ff="Poppins"
                              styles={{ label: { fontSize: "13px" } }}
                            />
                          ))
                        : Object.entries(question.choice_options).map(
                            ([choice, choiceFullAnswer]) => (
                              <Radio
                                key={choice}
                                value={choiceFullAnswer}
                                label={`${choice}) ${choiceFullAnswer}`}
                                ff="Poppins"
                                styles={{ label: { fontSize: "13px" } }}
                              />
                            ),
                          )}
                    </Group>
                  </Radio.Group>
                ) : (
                  <TextInput
                    placeholder="Write your observation here..."
                    ff="Poppins"
                    size="xs"
                    variant="filled"
                    styles={{ input: { backgroundColor: "#F1F3F5" } }}
                    value={currentAnswerValue}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                  />
                )}
              </div>
            </Stack>
          );
        })}

        {/* --- Isolated Submit Button per Component --- */}
        <Group justify="flex-end" mt="md">
          <Button
            color="teal"
            ff="Poppins"
            size="xs"
            radius="md"
            onClick={handleReportSubmit}
            loading={submitting}
            disabled={answeredCount === 0}
          >
            Submit section ({answeredCount})
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default QuestionsForImpactReport;
