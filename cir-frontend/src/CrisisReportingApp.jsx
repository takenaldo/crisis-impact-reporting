import React, { useState } from "react";
import {
  MantineProvider,
  Group,
  Text,
  ActionIcon,
  Indicator,
  Paper,
  Box,
  Button,
  Stack,
  Flex,
  ThemeIcon,
  Badge,
  Image,
} from "@mantine/core";
import {
  IconMenu2,
  IconBell,
  IconMapPinFilled,
  IconX,
  IconPlus,
  IconMinus,
  IconCurrentLocation,
  IconArrowRight,
  IconHome,
  IconFileDescription,
  IconInfoCircle,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";
import { MobileFormDrawer2 } from "./MobileFormDrawer2";
import ImpactReportForm from "./ImpactReportForm";
import { useTranslation } from "react-i18next";
import { LanguagePicker } from "./LanguagePicker";

import IconUNDP from "./icon-undp.png";
import Home from "./Home";
import MyReports from "./MyReports";
import Information from "./Information";
import Profile from "./Profile";
import Header from "./Header";

// Design System Colors
const COLORS = {
  navy: "#0D3B66",
  teal: "#009C9A",
  redOrange: "#E76F51",
  amber: "#F4A261",
  mint: "#E6F4F1",
  gray: "#868E96",
};

// Custom Theme to inject Typography
const theme = {
  fontFamily: "'Poppins', sans-serif",
  headings: { fontFamily: "'Montserrat', sans-serif" },
  primaryColor: "blue",
};

const NAV_COMP_MAPPING = {
  HOME: <Home />,
  MY_REPORTS: <MyReports />,
  INFORMATION: <Information />,
  PROFILE: <Profile />,
};

export default function CrisisReportingApp() {
  const { t } = useTranslation();
  const [showReportForm, setShowReportForm] = useState(false);

  const [activeContent, setActiveContent] = useState("HOME");

  return (
    <MantineProvider theme={theme}>
      {/* Import Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Poppins:wght@400;500;600&display=swap');
        `}
      </style>

      <Flex
        direction="column"
        h="100dvh"
        bg="#f0f4f8"
        style={{ overflow: "hidden" }}
      >
        <Header />
        <Box style={{ flex: 1, overflowY: "auto" }} px="md" pb="md">
          {NAV_COMP_MAPPING[activeContent]}
        </Box>
        {/* BOTTOM NAVIGATION */}
        <Paper
          shadow="sm"
          style={{
            borderTop: "1px solid #f0f0f0",
            borderRadius: "24px 24px 0 0",
            zIndex: 10,
          }}
          p="xs"
          pb="calc(env(safe-area-inset-bottom) + 12px)" // Accounts for iOS home indicator
        >
          <Group justify="space-around" align="flex-end" pt={8}>
            <NavItem
              icon={<IconHome size={24} />}
              label={t("Home")}
              setActiveContent={setActiveContent}
              component={"HOME"}
              active={activeContent === "HOME"}
            />
            <NavItem
              icon={<IconFileDescription size={24} />}
              label={t("My Reports")}
              setActiveContent={setActiveContent}
              active={activeContent === "MY_REPORTS"}
              component={"MY_REPORTS"}
            />
            <NavItem
              icon={<IconInfoCircle size={24} />}
              label={t("Info")}
              setActiveContent={setActiveContent}
              component={"INFORMATION"}
              active={activeContent === "INFORMATION"}
            />
            <NavItem
              icon={<IconUser size={24} />}
              label={t("Profile")}
              setActiveContent={setActiveContent}
              component={"PROFILE"}
              active={activeContent === "PROFILE"}
            />
          </Group>
        </Paper>
      </Flex>

      <ImpactReportForm
        opened={showReportForm}
        onClose={() => setShowReportForm(false)}
      />
    </MantineProvider>
  );
}

// Helper Component for Bottom Nav
function NavItem({ icon, label, active, component, setActiveContent }) {
  const color = active ? COLORS.navy : COLORS.gray;
  return (
    <Flex
      direction="column"
      align="center"
      gap={4}
      style={{ cursor: "pointer" }}
      onClick={() => {
        setActiveContent(component);
      }}
    >
      <Box c={color}>{icon}</Box>
      <Text fz={12} fw={active ? 600 : 400} c={color}>
        {label}
        {active}
      </Text>
    </Flex>
  );
}
