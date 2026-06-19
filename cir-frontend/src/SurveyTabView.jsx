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
  Center,
} from "@mantine/core";
import { useEffect, useState } from "react";
import api from "./api";
import {
  IconUserCircle,
  IconInbox,
  IconAlertCircle,
} from "@tabler/icons-react";

import example from "./example.json";
import { categorizeReports } from "./utils";

const COLORS = {
  navy: "#0D3B66",
  teal: "#009C9A",
  redOrange: "#E76F51",
  amber: "#F4A261",
  mint: "#E6F4F1",
  bg: "#F4F7F9",
};

const SurveyTabView = ({ report, impactReportId }) => {
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllSurveyAnswers = async () => {
      setLoading(true);
      setError(null);
      try {
        const [generalRes] = await Promise.all([
          api.get(
            `impact-reports/get_survey_answers_for_report/?reportID=${impactReportId}`,
          ),
        ]);
        setQuestions(generalRes.data);
      } catch (err) {
        setError("Failed to load impact report questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (impactReportId) {
      fetchAllSurveyAnswers();
    }
  }, [impactReportId]);

  // Enhanced, layout-accurate skeleton
  if (loading) {
    return (
      <Stack gap="lg" p={{ base: "md", sm: "lg" }} bg={COLORS.bg}>
        <Skeleton height={28} width="60%" mb="xs" />
        {[1, 2].map((item) => (
          <Paper key={item} withBorder p={{ base: "md", sm: "xl" }} radius="lg">
            <Skeleton height={20} width="20%" mb="sm" />
            <Skeleton height={24} width="80%" mb="lg" />
            <Divider mb="md" color={COLORS.mint} />
            <Skeleton height={60} radius="md" mb="sm" />
            <Skeleton height={60} radius="md" />
          </Paper>
        ))}
      </Stack>
    );
  }

  // Polished error state
  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={20} />}
        color="red"
        title="Unable to load questions"
        radius="md"
        m={{ base: "sm", sm: 0 }}
      >
        {error}
      </Alert>
    );
  }

  const questionEntries = Object.entries(questions || {});

  return (
    <Stack
      gap={{ base: "lg", sm: "xl" }}
      p={{ base: "sm", sm: "md" }}
      bg={COLORS.bg}
    >
      {console.log(categorizeReports(example))}

      <Box>
        <Text
          size={{ base: "lg", sm: "xl" }}
          fw={700}
          c={COLORS.navy}
          mb={{ base: "sm", sm: "lg" }}
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          General Impact Questions
        </Text>

        {questionEntries.length > 0 ? (
          <Stack gap={{ base: "md", sm: "lg" }}>
            {questionEntries.map(([questionId, details], index) => (
              <Paper
                key={questionId}
                withBorder
                p={{ base: "md", sm: "xl" }}
                radius="lg"
                shadow="sm"
                bg="white"
                style={{ borderColor: "#E9ECEF" }}
              >
                <Box mb={{ base: "sm", sm: "md" }}>
                  <Badge
                    bg={COLORS.mint}
                    c={COLORS.teal}
                    radius="sm"
                    size="sm"
                    tt="none"
                    fw={600}
                    mb="xs"
                  >
                    Question {index + 1}
                  </Badge>
                  <Text
                    size={{ base: "md", sm: "lg" }}
                    fw={700}
                    c={COLORS.navy}
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      wordBreak: "break-word",
                      lineHeight: 1.4,
                    }}
                  >
                    {details.question}
                  </Text>
                </Box>

                <Stack gap="xs">
                  <Badge
                    bg={COLORS.mint}
                    c={COLORS.navy}
                    radius="sm"
                    size="sm"
                    tt="none"
                    fw={600}
                    mb={4}
                  >
                    Answers
                  </Badge>

                  <Stack gap="sm">
                    {details.answers.map((answer) => (
                      <Box
                        key={answer.id}
                        bg="#FAFAFA"
                        // p={5}
                        p={{ base: "sm", sm: "md" }}
                        radius="md"
                        style={{ border: "1px solid #F1F3F5" }} // Added subtle border for better separation
                      >
                        <Stack gap="xs">
                          <Text
                            // size={{ base: "sm", sm: "md" }}
                            size="sm"
                            c={COLORS.navy}
                            fw={500}
                            style={{
                              fontFamily: "Poppins, sans-serif",
                              wordBreak: "break-word",
                              lineHeight: 1.5,
                            }}
                          >
                            {answer.answer || "No answer provided"}
                          </Text>

                          {answer.reported_by && (
                            <Group gap={6} align="center" mt={4}>
                              <IconUserCircle
                                size={16}
                                color="var(--color-gray)"
                              />
                              <Text
                                size={"xs"}
                                c="dimmed"
                                fw={500}
                                style={{ wordBreak: "break-all" }}
                              >
                                {answer.reported_by.user}
                              </Text>
                            </Group>
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Paper
            withBorder
            p="xl"
            radius="lg"
            bg="white"
            style={{ borderColor: "#E9ECEF" }}
          >
            <Center>
              <Stack align="center" gap="xs">
                <IconInbox size={40} color="#CED4DA" stroke={1.5} />
                <Text
                  size="sm"
                  c="dimmed"
                  fw={500}
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  No general questions found for this report.
                </Text>
              </Stack>
            </Center>
          </Paper>
        )}
      </Box>
    </Stack>
  );
};

export default SurveyTabView;
