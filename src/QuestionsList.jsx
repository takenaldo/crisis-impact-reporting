import React, { useState, useEffect } from "react";
import api from "./api";
import { Stack, Text, Loader, Center, ScrollArea } from "@mantine/core";
import QuestionsForImpactReport from "./QuestionsForImpactReport";
import QuestionForm from "./QuestionForm";
import QuestionGroupForm, { QuestionGroupModal } from "./QuestionGroupModal";

const QuestionsList = () => {
  const [categorizedData, setCategorizedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    const fetchLocalQuestions = async (lat, lon) => {
      try {
        const response = await api.post("/questions/get-questions-in-bound/", {
          latitude: lat,
          longitude: lon,
        });

        const categorized = response.data.reduce((acc, question) => {
          const reportId =
            question.question_group.impact_report?.id || "unassigned";
          if (!acc[reportId]) {
            acc[reportId] = {
              reportInfo: question.question_group.impact_report || null,
              questions: [],
            };
          }
          acc[reportId].questions.push(question);
          return acc;
        }, {});
        console.log("categorized::: ", categorized);

        setCategorizedData(categorized);
      } catch (err) {
        setError(err.message || "Failed to fetch questions.");
      } finally {
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchLocalQuestions(latitude, longitude);
      },
      (geoError) => {
        setError(`Location access denied or failed: ${geoError.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, []);

  if (loading) {
    return (
      <Center style={{ height: "40vh" }}>
        <Stack align="center" gap="xs">
          <Loader size="sm" type="dots" color="teal" />
          <Text ff="Poppins" size="xs" c="dimmed">
            Loading local surveys...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Text ff="Poppins" c="red" size="sm" fw={500} p="md">
        Error: {error}
      </Text>
    );
  }

  const reportGroups = Object.keys(categorizedData);

  return (
    <Stack gap="md" maxW={800} mx="auto" p="sm">
      <Text ff="Poppins" size="lg" fw={600} c="dark.4" px="xs">
        Surveys In Your Area
      </Text>
      {/* <QuestionGroupModal
        opened={true}
        reportID={"dd0abd64-0863-4178-b33b-fbb926fb6ad0"}
      /> */}
      {/* <QuestionForm /> */}

      {reportGroups.length === 0 ? (
        <Text ff="Poppins" size="sm" c="dimmed" px="xs">
          No active questions found within your boundaries.
        </Text>
      ) : (
        <ScrollArea
          h="75vh"
          scrollbarSize={6}
          offsetScrollbars
          styles={{ viewport: { paddingRight: "12px", paddingLeft: "4px" } }}
        >
          <Stack gap="xl">
            {reportGroups.map((reportId) => {
              const group = categorizedData[reportId];
              return (
                <QuestionsForImpactReport
                  key={reportId}
                  group={group}
                  report={group.reportInfo}
                />
              );
            })}
          </Stack>
        </ScrollArea>
      )}
    </Stack>
  );
};

export default QuestionsList;
