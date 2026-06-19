import {
  Stack,
  Text,
  Paper,
  Group,
  Badge,
  Divider,
  Box,
  ThemeIcon,
} from "@mantine/core";
import { useState } from "react";

const COLORS = {
  navy: "#0D3B66",
  teal: "#009C9A",
  redOrange: "#E76F51",
  amber: "#F4A261",
  mint: "#E6F4F1",
  bg: "#F4F7F9",
};

const QuestionsTabView = ({ report, natureOfCrisis }) => {
  const [questions, setQuestions] = useState([]);
  const [nocQuestions, setNocQuestions] = useState([]);

  const renderQACard = (q, index) => (
    <Paper
      key={q.id || index}
      withBorder
      p={{ base: "md", sm: "xl" }} // Scales padding
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
          Question {index}
        </Badge>
        <Text
          // size="lg"
          // size={{ base: "md", sm: "lg" }}
          // fw={500}
          c={COLORS.navy}
          style={{
            fontFamily: "Montserrat, sans-serif",
            wordBreak: "break-word",
          }}
        >
          {q.question}
        </Text>
      </Box>

      <Divider color={COLORS.mint} mb={{ base: "sm", sm: "md" }} />

      <Box bg="#FAFAFA" p={{ base: "sm", sm: "md" }} radius="md">
        <Group wrap="nowrap" align="flex-start" gap={{ base: "sm", sm: "md" }}>
          <ThemeIcon color={COLORS.teal} variant="light" size="md" radius="xl">
            <Text size="sm" fw={700}>
              A
            </Text>
          </ThemeIcon>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text
              // size="md"
              // size={{ base: "sm", sm: "md" }}
              c={COLORS.navy}
              // fw={300}
              style={{
                fontFamily: "Poppins, sans-serif",
                wordBreak: "break-word",
              }}
            >
              {q.answer || "No answer provided"}
            </Text>
          </Box>
        </Group>
      </Box>
    </Paper>
  );

  return (
    <Stack
      gap={{ base: "lg", sm: "xl" }}
      p={{ base: "xs", sm: "md" }}
      bg={COLORS.bg}
    >
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

        <Stack gap={{ base: "md", sm: "lg" }}>
          {renderQACard(
            {
              question:
                "Current condition of local electricity infrastructure:",
              answer: report?.electricity_condition,
            },
            1,
          )}
          {renderQACard(
            {
              question:
                "Operational capability of health services since event execution:",
              answer: report?.health_services_rating,
            },
            2,
          )}
          {renderQACard(
            {
              question:
                "Immediate pressing needs within target sector: (Select all that apply)",
              answer: report?.pressing_need,
            },
            3,
          )}

          {questions.length > 0 &&
            questions.map((q, index) => renderQACard(q, index + 4))}
        </Stack>
      </Box>

      <Box>
        {/* Wrap allowed on mobile to prevent the badge from overflowing the screen on very small devices */}

        <Divider color={COLORS.mint} mb={{ base: "md", sm: "lg" }} />
      </Box>
    </Stack>
  );
};

export default QuestionsTabView;
