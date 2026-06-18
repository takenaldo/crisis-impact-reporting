
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
  Select, Container
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
import { COLORS } from '../utils';
export function TeamsPage() {
  const members = [
    { name: 'Yohan B.', role: 'Lead Crisis Coordinator', zone: 'HQ Central', active: true },
    { name: 'Amina M.', role: 'Geospatial Analyst', zone: 'East Cluster', active: true },
    { name: 'Marcus K.', role: 'Field Response Officer', zone: 'Northern Outpost', active: false },
  ];

  return (
    <Box bg={COLORS.lightBackground} minHeight="100vh" py="md" px="lg">
      <Container size="xl">
    <Card radius="lg" withBorder p="xl">
      <Group justify="space-between" mb="xl">
        <Stack gap={2}>
          <Title order={4} color={COLORS.sidebarBg}>
            Response Team Deployment Directory
          </Title>
          <Text size="xs" color={COLORS.textSecondary}>
            Coordinate user roles, permission clearances, and status switches for rapid field command teams.
          </Text>
        </Stack>
        <Button leftSection={<IconUserPlus size={16} />} bg={COLORS.teal} radius="md">
          Invite Member
        </Button>
      </Group>

      <Grid gutter="lg">
        {members.map((member, idx) => (
          <Grid.Col span={{ base: 12, md: 4 }} key={idx}>
            <Card withBorder radius="md" p="md" bg={COLORS.bgLight}>
              <Group justify="space-between" align="center" mb="md">
                <Box
                  w={40}
                  h={40}
                  bg={COLORS.sidebarBg}
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
              <Text fw={600} size="sm" color={COLORS.sidebarBg}>
                {member.name}
              </Text>
              <Text size="xs" color={COLORS.textSecondary} mb="xs">
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
    </Container>
    </Box>
  );
}

