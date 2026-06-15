
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
export function TeamsPage() {
  const members = [
    { name: 'Yohan B.', role: 'Lead Crisis Coordinator', zone: 'HQ Central', active: true },
    { name: 'Amina M.', role: 'Geospatial Analyst', zone: 'East Cluster', active: true },
    { name: 'Marcus K.', role: 'Field Response Officer', zone: 'Northern Outpost', active: false },
  ];

  return (
    <Card radius="lg" withBorder p="xl">
      <Group justify="space-between" mb="xl">
        <Stack gap={2}>
          <Title order={4} color={colors.sidebarBg}>
            Response Team Deployment Directory
          </Title>
          <Text size="xs" color={colors.textSecondary}>
            Coordinate user roles, permission clearances, and status switches for rapid field command teams.
          </Text>
        </Stack>
        <Button leftSection={<IconUserPlus size={16} />} bg={colors.teal} radius="md">
          Invite Member
        </Button>
      </Group>

      <Grid gutter="lg">
        {members.map((member, idx) => (
          <Grid.Col span={{ base: 12, md: 4 }} key={idx}>
            <Card withBorder radius="md" p="md" bg={colors.bgLight}>
              <Group justify="space-between" align="center" mb="md">
                <Box
                  w={40}
                  h={40}
                  bg={colors.sidebarBg}
                  style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text color="white" fw={600} size="sm">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Text>
                </Box>
                <Badge color={member.active ? 'green' : 'gray'} variant="filled">
                  {member.active ? 'Online' : 'Offline'}
                </Badge>
              </Group>
              <Text fw={600} size="sm" color={colors.sidebarBg}>
                {member.name}
              </Text>
              <Text size="xs" color={colors.textSecondary} mb="xs">
                {member.role}
              </Text>
              <Text size="xs" fw={500} color="gray.7">
                📍 Sector Allocation: {member.zone}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Card>
  );
}

