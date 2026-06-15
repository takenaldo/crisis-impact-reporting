import React from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Group,
  Button,
  ActionIcon,
  Badge,
  TextInput,
  Avatar,
  Box,
  Divider,
  Select,
  Table,
  ThemeIcon,
  Anchor,Stack
} from '@mantine/core';
import {
  IconSearch,
  IconCalendar,
  IconDownload,
  IconBell,
  IconMapPin,
  IconEye,
  IconFileText,
  IconClock,
  IconCircleCheck,
  IconDeviceMobile,
  IconAlertTriangle
} from '@tabler/icons-react';

// Design-matched UI Palette
const COLORS = {
  primaryTeal: '#008080',
  darkBlue: '#0B2545',
  lightBackground: '#F4F7F6',
  white: '#FFFFFF',
  
  // Severity backgrounds & colors
  severity: {
    highBg: '#FCECE9',
    highText: '#E0533C',
    mediumBg: '#FEF3E6',
    mediumText: '#F08C43',
    lowBg: '#EBF7F6',
    lowText: '#2A9D8F',
  },

  // Status tokens
  status: {
    verifiedBg: '#EBF7F6',
    verifiedText: '#2A9D8F',
    pendingBg: '#FEF3E6',
    pendingText: '#F08C43',
    reviewBg: '#EEF2F6',
    reviewText: '#4A5D6E',
  }
};

// Raw layout mock data exactly representing the image's row entries
const MOCK_REPORTS = [
  {
    id: 'RPT-2046',
    title: 'Severe flooding — residential blocks',
    location: 'Mogadishu, SO',
    severity: 'High',
    status: 'Verified',
    owner: 'A. Ndjoli',
    updated: '12m ago'
  },
  {
    id: 'RPT-2045',
    title: 'Bridge collapse — main access road',
    location: 'Nairobi, KE',
    severity: 'High',
    status: 'Pending',
    owner: 'F. Hassan',
    updated: '38m ago'
  },
  {
    id: 'RPT-2044',
    title: 'Cholera cluster — refugee camp',
    location: 'Dadaab, KE',
    severity: 'Medium',
    status: 'Review',
    owner: 'T. Bekele',
    updated: '1h ago'
  },
  {
    id: 'RPT-2043',
    title: 'Wildfire spread — northern slope',
    location: 'Addis Ababa, ET',
    severity: 'High',
    status: 'Verified',
    owner: 'A. Ndjoli',
    updated: '2h ago'
  },
  {
    id: 'RPT-2042',
    title: 'Food supply shortage — district 4',
    location: 'Juba, SS',
    severity: 'Medium',
    status: 'Pending',
    owner: 'F. Hassan',
    updated: '3h ago'
  },
  {
    id: 'RPT-2041',
    title: 'Power outage — community center',
    location: 'Kampala, UG',
    severity: 'Low',
    status: 'Verified',
    owner: 'T. Bekele',
    updated: '4h ago'
  }
];

export  function ReportsPage() {
  
  // Helper for rendering Severity Badges
  const renderSeverity = (severity) => {
    let styles = {};
    if (severity === 'High') {
      styles = { bg: COLORS.severity.highBg, c: COLORS.severity.highText };
    } else if (severity === 'Medium') {
      styles = { bg: COLORS.severity.mediumBg, c: COLORS.severity.mediumText };
    } else {
      styles = { bg: COLORS.severity.lowBg, c: COLORS.severity.lowText };
    }

    return (
      <Badge 
        variant="filled" 
        bg={styles.bg} 
        c={styles.c} 
        radius="xl" 
        size="sm" 
        px="sm"
        style={{ textTransform: 'capitalize' }}
        leftSection={<Box w={5} h={5} style={{ borderRadius: '50%', backgroundColor: styles.c }} />}
      >
        {severity}
      </Badge>
    );
  };

  // Helper for rendering Status Badges
  const renderStatus = (status) => {
    let styles = {};
    let icon = null;

    if (status === 'Verified') {
      styles = { bg: COLORS.status.verifiedBg, c: COLORS.status.verifiedText };
      icon = <IconCircleCheck size={12} stroke={2.5} />;
    } else if (status === 'Pending') {
      styles = { bg: COLORS.status.pendingBg, c: COLORS.status.pendingText };
      icon = <IconClock size={12} stroke={2.5} />;
    } else {
      styles = { bg: COLORS.status.reviewBg, c: COLORS.status.reviewText };
      icon = <IconAlertTriangle size={12} stroke={2.5} />;
    }

    return (
      <Badge 
        variant="filled" 
        bg={styles.bg} 
        c={styles.c} 
        radius="md" 
        size="sm" 
        px="xs"
        leftSection={icon}
        style={{ border: `1px solid ${styles.c}30`, textTransform: 'capitalize' }}
      >
        {status === 'Review' ? 'Review' : status}
      </Badge>
    );
  };

  return (
    <Box bg={COLORS.lightBackground} minHeight="100vh" py="md" px="lg">
      <Container size="xl">
        
        {/* ================= HEADER NAVBAR ================= */}
        <Group justify="space-between" mb="xl">
          <Group>
            <Text size="xs" c="dimmed" fw={700} lts={1}>UNDP / Africa</Text>
            <Text size="xl" fw={700} c={COLORS.darkBlue} style={{ marginTop: -5 }}>
              Reports
            </Text>
          </Group>

          <Group gap="md">
            <TextInput
              placeholder="Search reports, locations, teams..."
              leftSection={<IconSearch size={16} stroke={1.5} />}
              rightSection={<Badge variant="light" color="gray" size="sm">⌘K</Badge>}
              w={300}
              radius="md"
            />
            <Button 
              variant="default" 
              leftSection={<IconCalendar size={16} />} 
              radius="md"
            >
              Last 7 days
            </Button>
            <Button 
              bg={COLORS.primaryTeal} 
              leftSection={<IconDownload size={16} />} 
              radius="md"
            >
              Export
            </Button>
            <ActionIcon variant="default" size="lg" radius="md">
              <IconBell size={18} stroke={1.5} />
            </ActionIcon>
            
            <Divider orientation="vertical" />
            
            <Group gap="xs">
              <Avatar color="blue" radius="xl">KS</Avatar>
              <Box>
                <Text size="sm" fw={600}>Karim S.</Text>
                <Text size="xs" c="dimmed">Responder - KE</Text>
              </Box>
            </Group>
          </Group>
        </Group>

        {/* ================= SUB METRICS HORIZONTAL GRID ================= */}
        <Grid mb="lg">
          {/* New Today */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="md" radius="lg" withBorder={false}>
              <Group gap="md" align="center">
                <ThemeIcon size="xl" radius="md" variant="light" color="blue" bg="#EEF4FC" c="#2B6CB0">
                  <IconFileText size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed" fw={500}>New today</Text>
                  <Text size="xl" fw={700} c={COLORS.darkBlue}>71</Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>

          {/* Awaiting Review */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="md" radius="lg">
              <Group gap="md" align="center">
                <ThemeIcon size="xl" radius="md" variant="light" color="orange" bg="#FFF3E0" c="#E65100">
                  <IconClock size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed" fw={500}>Awaiting review</Text>
                  <Text size="xl" fw={700} c={COLORS.secondaryOrange}>124</Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>

          {/* Verified Today */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="md" radius="lg">
              <Group gap="md" align="center">
                <ThemeIcon size="xl" radius="md" variant="light" color="teal" bg="#E6F4EA" c="#137333">
                  <IconCircleCheck size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed" fw={500}>Verified today</Text>
                  <Text size="xl" fw={700} c={COLORS.primaryTeal}>52</Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>

          {/* Mobile Submissions */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card padding="md" radius="lg">
              <Group gap="md" align="center">
                <ThemeIcon size="xl" radius="md" variant="light" color="indigo" bg="#EEF2FA" c="#3949AB">
                  <IconDeviceMobile size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed" fw={500}>Mobile submissions</Text>
                  <Text size="xl" fw={700} c={COLORS.darkBlue}>89%</Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* ================= MAIN REPORT MANAGEMENT DATA CARD ================= */}
        <Card padding="lg" radius="lg" shadow="xs">
          {/* Section Controls Toolbar Header */}
          <Group justify="space-between" mb="xl">
            <Box>
              <Text fw={700} size="lg" c={COLORS.darkBlue}>Report Management</Text>
              <Text size="xs" c="dimmed">Triage, verify, and assign field submissions</Text>
            </Box>
            
            <Group gap="xs">
              <Select
                placeholder="All severities"
                data={['High', 'Medium', 'Low']}
                w={140}
                radius="md"
                size="xs"
              />
              <Select
                placeholder="All regions"
                data={['Nairobi, KE', 'Mogadishu, SO', 'Addis Ababa, ET', 'Juba, SS', 'Kampala, UG']}
                w={130}
                radius="md"
                size="xs"
              />
              <Select
                placeholder="All statuses"
                data={['Verified', 'Pending', 'Review']}
                w={130}
                radius="md"
                size="xs"
              />
            </Group>
          </Group>

          {/* Management Records Table */}
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="md" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th><Text size="xs" c="dimmed" fw={700}>REPORT</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={700}>LOCATION</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={700}>SEVERITY</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={700}>STATUS</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={700}>OWNER</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={700}>UPDATED</Text></Table.Th>
                  <Table.Th ta="right"><Text size="xs" c="dimmed" fw={700}>ACTION</Text></Table.Th>
                </Table.Tr>
              </Table.Thead>
              
              <Table.Tbody>
                {MOCK_REPORTS.map((row) => (
                  <Table.Tr key={row.id}>
                    
                    {/* Report Info Column */}
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm" fw={700} c={COLORS.darkBlue}>
                          {row.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {row.id}
                        </Text>
                      </Stack>
                    </Table.Td>

                    {/* Location Column */}
                    <Table.Td>
                      <Group gap={4} c="dimmed">
                        <IconMapPin size={14} />
                        <Text size="sm">{row.location}</Text>
                      </Group>
                    </Table.Td>

                    {/* Severity Badge Column */}
                    <Table.Td>{renderSeverity(row.severity)}</Table.Td>

                    {/* Status Badge Column */}
                    <Table.Td>{renderStatus(row.status)}</Table.Td>

                    {/* Owner Column */}
                    <Table.Td>
                      <Text size="sm" c="dimmed" fw={500}>{row.owner}</Text>
                    </Table.Td>

                    {/* Updated Column */}
                    <Table.Td>
                      <Text size="sm" c="dimmed">{row.updated}</Text>
                    </Table.Td>

                    {/* Interactive Action Column */}
                    <Table.Td ta="right">
                      <Anchor 
                        component="button" 
                        type="button" 
                        c={COLORS.primaryTeal} 
                        fw={700} 
                        size="xs"
                        underline="never"
                      >
                        <Group gap={4} justify="flex-end">
                          <IconEye size={14} />
                          Review
                        </Group>
                      </Anchor>
                    </Table.Td>

                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>

      </Container>
    </Box>
  );
}