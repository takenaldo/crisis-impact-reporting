import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { timeAgo } from "./utils";
import {
  Badge,
  Box,
  Fieldset,
  Group,
  Image,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import ReportCard from "./ReportCardOld";
import CrisisCard from "./CrisisCard";
import { MobileFormDrawer } from "./MobileFormDrawer";
import api from "./api";
const CrisisDetailPage = () => {
  const { id } = useParams();
  const [reports, setReports] = useState([]);

  const loc = useLocation();
  const crisis = loc.state?.crisis;

  useEffect(() => {
    const fetchReportsForCrisis = async () => {
      try {
        const response = await api.get(
          "impact-reports/" + id + "/get_reports_for_crisis/",
        );
        setReports(response.data);
      } catch (error) {}
    };

    fetchReportsForCrisis();
  }, [id]);

  return (
    <Box m={10}>
      <CrisisCard crisis={crisis} isSelected={true} clickable={false} />
      <Text mt="md" mb="xs" color="dimmed">
        {reports.length} report{reports.length !== 1 && "s"} · Updated{" "}
        {timeAgo(crisis.updated_at)}
      </Text>

      {reports?.map((report) => (
        <ReportCard report={report} />
      ))}
    </Box>
  );
};

export default CrisisDetailPage;
