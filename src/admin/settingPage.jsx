import React, { useState } from "react";
import {
 
  Title,
  Text,

  Stack,

  Button,
  Grid,
  Card,
  Badge,


  Switch,
  Select,
  Box,
  Container
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
  IconMaximize, // ← Added back
} from "@tabler/icons-react";

import { COLORS } from '../utils';

export function SettingsPage() {
  return (

    <Box bg={COLORS.lightBackground} minHeight="100vh" py="md" px="lg">
      <Container size="xl">
        <Card radius="lg" withBorder p="xl">
          <Title order={4} color={COLORS.sidebarBg} mb="xs">
            System Configuration & Parameters
          </Title>
          <Text size="xs" color={COLORS.textSecondary} mb="xl">
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

            <Button bg={COLORS.sidebarBg} radius="md" w="max-content" mt="md">
              Save All System States
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
            <Button bg={COLORS.sidebarBg} radius="md" w="max-content" mt="md">
              Save All System States
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
