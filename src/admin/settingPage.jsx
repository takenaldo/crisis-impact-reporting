
import React, { useState } from 'react';
import {
  AppShell,
  NavLink,
  Title,
  Text,
  Group,
  Stack,
  TextInput,
  Button,
  Grid,
  Card,
  Badge,
  RingProgress,
  ActionIcon,
  SegmentedControl,
  Box,
  rem,
  Switch,
  Select,
} from '@mantine/core';
import {
  IconLayoutDashboard,
  IconMap,
  IconFileText,
  IconChartBar,
  IconUsers,
  IconSettings,
  IconSearch,
  IconBell,
  IconPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconUserPlus,
  IconMaximize,        // ← Added back
} from '@tabler/icons-react';

const colors = {
  darkBlue: '#0c3461',
  sidebarBg: '#092546',
  teal: '#00a396',
  bgLight: '#f4f6f9',
  orange: '#f59e0b',
  red: '#ef4444',
  textSecondary: '#64748b',
};

export function SettingsPage() {
  return (
    <Card radius="lg" withBorder p="xl">
      <Title order={4} color={colors.sidebarBg} mb="xs">
        System Configuration & Parameters
      </Title>
      <Text size="xs" color={colors.textSecondary} mb="xl">
        Alter structural parameters, automated calculation metrics, and security authentication filters.
      </Text>

      <Stack gap="md" style={{ maxWidth: 500 }}>
        <Switch
          label="Activate immediate emergency notifications pipeline to target hubs"
          defaultChecked
          styles={{ label: { fontWeight: 500 } }}
        />
        <Switch
          label="Perform real-time continuous localized vector cache compression"
          defaultChecked
          styles={{ label: { fontWeight: 500 } }}
        />
        <Switch
          label="Strict Mode verification schema validation protocols"
          styles={{ label: { fontWeight: 500 } }}
        />

        <Select
          label="Default Mapping Base Layer Provider Engine"
          placeholder="Select Map Base"
          data={['OpenStreetMap Framework', 'Mapbox Vector Engine', 'Satellite Pipeline Engine']}
          defaultValue="OpenStreetMap Framework"
          mt="xs"
        />

        <Button bg={colors.sidebarBg} radius="md" w="max-content" mt="md">
          Save All System States
        </Button>
      </Stack>
    </Card>
  );
}