import React, { useState } from "react";
import {
  AppShell,
  NavLink,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Box,
  rem,
  Image,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconMap,
  IconFileText,
  IconChartBar,
  IconUsers,
  IconSettings,
  IconPlus,
  IconMaximize,
} from "@tabler/icons-react";

import { CrisisMapPage } from "./crisisMap";
import { ReportsPage } from "./ReportsPage";
import { SettingsPage } from "./settingPage";
import { TeamsPage } from "./TeamsPage";
import { AnalyticsPage } from "./analyticsPage";
import { DashboardPage } from "./adminPage";

// ==================== THEME ====================
const colors = {
  darkBlue: "#0c3461",
  sidebarBg: "#092546",
  teal: "#00a396",
  bgLight: "#f4f6f9",
  orange: "#f59e0b",
  red: "#ef4444",
  textSecondary: "#64748b",
};

// ==================== NAVIGATION ====================
const navItems = [
  { label: "Dashboard", icon: IconLayoutDashboard },
  { label: "Crisis Map", icon: IconMap },
  { label: "Reports", icon: IconFileText },
  { label: "Analytics", icon: IconChartBar },
  { label: "Teams", icon: IconUsers },
  { label: "Settings", icon: IconSettings },
];

// ==================== MAIN APP ====================
export function CrisisImpactDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const renderActivePage = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardPage />;
      case "Crisis Map":
        return <CrisisMapPage />;
      case "Reports":
        return <ReportsPage />;
      case "Analytics":
        return <AnalyticsPage />;
      case "Teams":
        return <TeamsPage />;
      case "Settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppShell
      navbar={{ width: 280, breakpoint: "md" }}
      padding="md"
      styles={{
        root: { backgroundColor: colors.bgLight },
        main: {
          height: "100vh",
          overflowY: "auto",
          paddingLeft: `calc(var(--app-shell-navbar-offset, 0rem) + ${rem(
            16
          )})`,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      }}
    >
      {/* Sidebar */}
      <AppShell.Navbar
        p="md"
        bg={colors.sidebarBg}
        styles={{
          navbar: {
            borderRight: "none",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
          },
        }}
      >
        {/* Refactored Logo Section */}
        <Box
          py="lg"
          px="sm"
          mb="md"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Group align="center" gap="sm">
            <Box style={{ borderRadius: "8px", display: "flex" }}>
              <Image
                src="https://www.atachcommunity.com/fileadmin/_processed_/a/e/csm_undp_logo_landscape_854813103b.png"
                alt="UNDP Logo"
                w={50}
                h={40}
                fit="fit"
              />
            </Box>
            <Stack gap={0}>
              <Title
                fw={800}
                size="h4"
                lh={1}
                style={{ color: "white", letterSpacing: "-0.02em" }}
              >
                Crisis Impact
              </Title>
              <Text
                size="xs"
                opacity={0.6}
                style={{
                  color: "white",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Reporting
              </Text>
            </Stack>
          </Group>
        </Box>

        {/* Navigation */}
        <Stack gap="xs" px="sm" style={{ flexGrow: 1, overflowY: "auto" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              active={activeTab === item.label}
              label={item.label}
              leftSection={<item.icon size={20} stroke={1.5} />}
              onClick={() => setActiveTab(item.label)}
              styles={{
                root: {
                  borderRadius: "8px",
                  color: activeTab === item.label ? "white" : "#94a3b8",
                  backgroundColor:
                    activeTab === item.label ? colors.teal : "transparent",
                  padding: `${rem(10)} ${rem(12)}`,
                  "&:hover": {
                    backgroundColor:
                      activeTab === item.label
                        ? colors.teal
                        : "rgba(255,255,255,0.05)",
                  },
                },
                label: {
                  fontWeight: activeTab === item.label ? 600 : 400,
                  color: "white",
                },
              }}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Stack gap="lg" pb="xl">
          {renderActivePage()}
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}

// ... MiniMapCanvas component remains unchanged as per requirements
