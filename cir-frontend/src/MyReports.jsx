import { Box, Center, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import api from "./api";
import ReportDetailsDrawer from "./ReportDetailsDrawer";
import ReportCard from "./ReportCard";
import { getUserDetails } from "./utils";
import QuestionForm from "./QuestionForm";
import { QuestionGroupModal } from "./QuestionGroupModal";
import QuestionsForImpactReport from "./QuestionsForImpactReport";

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (getUserDetails() !== null) {
          const response = await api.get("impact-reports/get_user_reports/");

          setReports(response.data);
        } else {
          const reportIDs = JSON.parse(
            localStorage.getItem("report_ids") || "[]",
          );
          const response = await api.post(
            "impact-reports/get_reports_by_stored_ids/",
            {
              report_ids: reportIDs,
            },
          );
          setReports(response.data);
        }
      } catch (error) {}
    };

    fetchUserDetails();
  }, []);

  return (
    <Box h={"100%"}>
      <Stack gap={10}>
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onClick={() => {
              setSelectedReport(report);
            }}
          />
        ))}
      </Stack>
      <ReportDetailsDrawer
        opened={selectedReport !== null}
        onClose={() => {
          setSelectedReport(null);
        }}
        report={selectedReport}
      />
    </Box>
  );
};

export default MyReports;
