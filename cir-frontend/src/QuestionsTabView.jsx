import {
  Stack,
  Text,
  Paper,
  Group,
  Badge,
  Divider,
  Skeleton,
  Alert,
  Box,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { api } from "./utils";

const QuestionsTabView = ({ impactReportId, natureOfCrisis }) => {
  const [questions, setQuestions] = useState([]);
  const [nocQuestions, setNocQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch both endpoints in parallel for better performance
        const [generalRes, nocRes] = await Promise.all([
          api.get(`impact-reports/${impactReportId}/get_qa_for_impact_report/`),
          api.get(
            `impact-reports/${impactReportId}/get_noc_qa_for_impact_report/`,
          ),
        ]);

        setQuestions(generalRes.data);
        setNocQuestions(nocRes.data);
      } catch (err) {
        setError("Failed to load impact report questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (impactReportId) {
      fetchAllQuestions();
    }
  }, [impactReportId]);

  // Helper function to render a consistently styled Q&A card
  const renderQACard = (q, index) => (
    <Paper
      key={q.id || index}
      withBorder
      p="md"
      radius="md"
      bg="var(--mantine-color-gray-0)"
    >
      <Stack gap="xs">
        <Text size="sm" fw={600} c="dark.8">
          {q.question}
        </Text>
        <Group wrap="nowrap" align="flex-start" gap="sm">
          <Text size="sm" fw={700} c="blue.6">
            A:
          </Text>
          <Text size="sm" fs="italic" c="dark.6">
            {q.answer || "No answer provided"}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={80} radius="md" />
        <Skeleton height={80} radius="md" />
        <Skeleton height={80} radius="md" />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert title="Error" color="red" radius="md">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      {/* General Questions Section */}
      <Box>
        <Text size="lg" fw={700} mb="md">
          General Impact Questions
        </Text>
        {questions.length > 0 ? (
          <Stack gap="sm">
            {questions.map((q, index) => renderQACard(q, index))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            No general questions found.
          </Text>
        )}
      </Box>

      {/* Nature of Crisis Questions Section */}
      <Box>
        <Group mb="sm" justify="space-between">
          <Text size="lg" fw={700}>
            Crisis Specific Questions
          </Text>
          {natureOfCrisis && (
            <Badge color="red" variant="light" size="md">
              {natureOfCrisis}
            </Badge>
          )}
        </Group>

        <Divider mb="md" variant="dashed" />

        {nocQuestions.length > 0 ? (
          <Stack gap="sm">
            {nocQuestions.map((q, index) => renderQACard(q, index))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            No crisis-specific questions found.
          </Text>
        )}
      </Box>
    </Stack>
  );
};

export default QuestionsTabView;
