import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
  ActionIcon,
  Breadcrumbs,
  Anchor,
  Divider,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconSearch,
  IconX,
  IconFileText,
  IconChevronLeft,
  IconArrowRight,
} from "@tabler/icons-react";
import api from "../api";
import { timeAgo, COLORS, SeverityBadge } from "../utils";
import ReportDetailsView from "./ReportDetailsView";

const PAGE_SIZE = 10;

// ── Helpers ────────────────────────────────────────────────────────────────

function userDisplayName(user) {
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return full || user.username || user.email;
}

function userInitials(user) {
  const f = user.first_name?.[0] ?? "";
  const l = user.last_name?.[0] ?? "";
  return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || "?";
}

function userCountry(user) {
  return user.location?.country ?? null;
}

function userCity(user) {
  return user.location?.city ?? null;
}

// ── Avatar ─────────────────────────────────────────────────────────────────

function UserAvatar({ user }) {
  return (
    <Box
      w={36}
      h={36}
      style={{
        borderRadius: "50%",
        backgroundColor: COLORS.sidebarBg ?? "#0D3B66",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Text c="white" fw={600} size="xs">
        {userInitials(user)}
      </Text>
    </Box>
  );
}

// ── Accounts table ─────────────────────────────────────────────────────────

function AccountsTable({ users, onViewReports, onToggleActive }) {
  if (users.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No accounts match the current filters.
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>User</Table.Th>
          <Table.Th>Email</Table.Th>
          <Table.Th>Job / Organization</Table.Th>
          <Table.Th>Location</Table.Th>
          <Table.Th>Reports</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Joined</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {users.map((user) => (
          <Table.Tr key={user.id}>
            <Table.Td>
              <Group gap="sm" wrap="nowrap">
                <UserAvatar user={user} />
                <Stack gap={0}>
                  <Text size="sm" fw={600}>
                    {userDisplayName(user)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {user.pseudonym ?? ""}
                  </Text>
                </Stack>
              </Group>
            </Table.Td>

            <Table.Td>
              <Text size="sm">{user.email}</Text>
            </Table.Td>

            <Table.Td>
              <Stack gap={0}>
                <Text size="sm">{user.job_title || "—"}</Text>
                <Text size="xs" c="dimmed">
                  {user.organization || ""}
                </Text>
              </Stack>
            </Table.Td>

            <Table.Td>
              {userCity(user) || userCountry(user) ? (
                <Stack gap={0}>
                  <Text size="sm">{userCity(user) || "—"}</Text>
                  <Text size="xs" c="dimmed">
                    {userCountry(user) || ""}
                  </Text>
                </Stack>
              ) : (
                <Text size="sm" c="dimmed">
                  —
                </Text>
              )}
            </Table.Td>

            <Table.Td ta="center">
              <Badge
                variant="light"
                color={user.report_count > 0 ? "teal" : "gray"}
              >
                {user.report_count}
              </Badge>
            </Table.Td>

            <Table.Td>
              <Switch
                checked={user.is_active}
                color="teal"
                size="sm"
                onChange={() => onToggleActive(user)}
              />
            </Table.Td>

            <Table.Td>
              <Stack gap={0}>
                <Text size="xs">{new Date(user.date_joined).toLocaleDateString()}</Text>
                <Text size="xs" c="dimmed">
                  {user.last_login ? timeAgo(user.last_login) : "Never logged in"}
                </Text>
              </Stack>
            </Table.Td>

            <Table.Td>
              <Button
                size="xs"
                variant="light"
                color="blue"
                leftSection={<IconFileText size={13} />}
                onClick={() => onViewReports(user)}
                disabled={user.report_count === 0}
              >
                Reports
              </Button>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

// ── Filters bar ────────────────────────────────────────────────────────────

function FiltersBar({ filters, setFilters, organizations, countries }) {
  const clearAll = () =>
    setFilters({
      search: "",
      status: "all",
      organization: null,
      hasReports: "all",
      country: null,
      joinedFrom: null,
      joinedTo: null,
      lastLogin: "all",
    });

  const hasActive =
    filters.search ||
    filters.status !== "all" ||
    filters.organization ||
    filters.hasReports !== "all" ||
    filters.country ||
    filters.joinedFrom ||
    filters.joinedTo ||
    filters.lastLogin !== "all";

  return (
    <Stack gap="sm">
      <Group gap="sm" align="flex-end" wrap="wrap">
        <TextInput
          placeholder="Search name, email, org, job title…"
          leftSection={<IconSearch size={15} />}
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          style={{ minWidth: 260, flex: 1 }}
        />

        <Select
          placeholder="Status"
          data={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v ?? "all" }))}
          clearable={false}
          w={140}
        />

        <Select
          placeholder="Organization"
          data={organizations.map((o) => ({ value: o, label: o }))}
          value={filters.organization}
          onChange={(v) => setFilters((f) => ({ ...f, organization: v }))}
          clearable
          searchable
          w={180}
        />

        <Select
          placeholder="Has reports"
          data={[
            { value: "all", label: "All users" },
            { value: "yes", label: "With reports" },
            { value: "no", label: "No reports yet" },
          ]}
          value={filters.hasReports}
          onChange={(v) => setFilters((f) => ({ ...f, hasReports: v ?? "all" }))}
          clearable={false}
          w={160}
        />

        <Select
          placeholder="Country"
          data={countries.map((c) => ({ value: c, label: c }))}
          value={filters.country}
          onChange={(v) => setFilters((f) => ({ ...f, country: v }))}
          clearable
          searchable
          w={160}
        />
      </Group>

      <Group gap="sm" align="flex-end" wrap="wrap">
        <DatePickerInput
          type="range"
          placeholder="Joined date range"
          value={[filters.joinedFrom, filters.joinedTo]}
          onChange={([from, to]) =>
            setFilters((f) => ({ ...f, joinedFrom: from, joinedTo: to }))
          }
          clearable
          w={220}
        />

        <Select
          placeholder="Last login"
          data={[
            { value: "all", label: "Any last login" },
            { value: "30d", label: "Active last 30 days" },
            { value: "90d", label: "Active last 90 days" },
            { value: "never", label: "Never logged in" },
          ]}
          value={filters.lastLogin}
          onChange={(v) => setFilters((f) => ({ ...f, lastLogin: v ?? "all" }))}
          clearable={false}
          w={200}
        />

        {hasActive && (
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconX size={13} />}
            onClick={clearAll}
          >
            Clear filters
          </Button>
        )}
      </Group>
    </Stack>
  );
}

// ── User reports list ──────────────────────────────────────────────────────

function UserReportsList({ user, onViewDetail, onBack }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`impact-reports/get_reports_by_user_id/`, {
        params: { user_id: user.id },
      })
      .then((res) => setReports(res.data))
      .catch(() => setError("Failed to load reports."))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <Stack gap="md">
      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={onBack}>
          <IconChevronLeft size={18} />
        </ActionIcon>
        <Title order={5} c={COLORS.sidebarBg ?? "#0D3B66"}>
          Reports by {userDisplayName(user)}
        </Title>
        {!loading && (
          <Badge variant="light" color="teal">
            {reports.length}
          </Badge>
        )}
      </Group>

      <Divider />

      {loading && (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      )}

      {error && (
        <Text c="red" ta="center">
          {error}
        </Text>
      )}

      {!loading && !error && reports.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          This user has no reports yet.
        </Text>
      )}

      {!loading && !error && reports.length > 0 && (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Infrastructure</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Severity</Table.Th>
              <Table.Th>Submitted</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reports.map((report) => (
              <Table.Tr key={report.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {report.infrastructure_name || "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{report.infrastructure_type || "—"}</Text>
                </Table.Td>
                <Table.Td>
                  {report.damage_severity ? (
                    <SeverityBadge severity={report.damage_severity} />
                  ) : (
                    <Text size="sm" c="dimmed">—</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="xs">{timeAgo(report.created_at)}</Text>
                </Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    variant="light"
                    color="teal"
                    rightSection={<IconArrowRight size={13} />}
                    onClick={() => onViewDetail(report)}
                  >
                    View Details
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}

// ── Main AccountsPage ──────────────────────────────────────────────────────

export function AccountsPage() {
  // ── Data ────────────────────────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── View state ──────────────────────────────────────────────────────────
  const [view, setView] = useState("accounts"); // 'accounts' | 'user-reports' | 'report-detail'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  // ── Filters ─────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    organization: null,
    hasReports: "all",
    country: null,
    joinedFrom: null,
    joinedTo: null,
    lastLogin: "all",
  });

  // ── Pagination ──────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ── Load users ──────────────────────────────────────────────────────────
  useEffect(() => {
    api
      .get("user/user_list_for_admin/")
      .then((res) => setAllUsers(res.data))
      .catch(() => setError("Failed to load accounts."))
      .finally(() => setLoading(false));
  }, []);

  // ── Toggle active (optimistic) ──────────────────────────────────────────
  const handleToggleActive = useCallback((user) => {
    const next = !user.is_active;
    setAllUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, is_active: next } : u))
    );
    api
      .post(`user/${user.id}/set_active/`, { is_active: next })
      .catch(() => {
        // Revert on failure
        setAllUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_active: user.is_active } : u))
        );
      });
  }, []);

  // ── Dynamic dropdown options ─────────────────────────────────────────────
  const organizations = useMemo(
    () =>
      [...new Set(allUsers.map((u) => u.organization).filter(Boolean))].sort(),
    [allUsers]
  );

  const countries = useMemo(
    () =>
      [
        ...new Set(
          allUsers.map((u) => u.location?.country).filter(Boolean)
        ),
      ].sort(),
    [allUsers]
  );

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const now = Date.now();
    const ms30 = 30 * 24 * 60 * 60 * 1000;
    const ms90 = 90 * 24 * 60 * 60 * 1000;
    const q = filters.search.toLowerCase();

    return allUsers.filter((u) => {
      if (q) {
        const haystack = [
          userDisplayName(u),
          u.email,
          u.organization,
          u.job_title,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (filters.status === "active" && !u.is_active) return false;
      if (filters.status === "inactive" && u.is_active) return false;

      if (filters.organization && u.organization !== filters.organization)
        return false;

      if (filters.hasReports === "yes" && u.report_count === 0) return false;
      if (filters.hasReports === "no" && u.report_count > 0) return false;

      if (filters.country && u.location?.country !== filters.country)
        return false;

      if (filters.joinedFrom) {
        if (new Date(u.date_joined) < filters.joinedFrom) return false;
      }
      if (filters.joinedTo) {
        if (new Date(u.date_joined) > filters.joinedTo) return false;
      }

      if (filters.lastLogin === "never" && u.last_login) return false;
      if (filters.lastLogin === "30d") {
        if (!u.last_login || now - new Date(u.last_login).getTime() > ms30)
          return false;
      }
      if (filters.lastLogin === "90d") {
        if (!u.last_login || now - new Date(u.last_login).getTime() > ms90)
          return false;
      }

      return true;
    });
  }, [allUsers, filters]);

  // Reset to page 1 whenever filters change
  useEffect(() => setPage(1), [filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Navigation handlers ──────────────────────────────────────────────────
  const goToUserReports = (user) => {
    setSelectedUser(user);
    setView("user-reports");
  };

  const goToReportDetail = (report) => {
    setSelectedReport(report);
    setView("report-detail");
  };

  const goBackToAccounts = () => {
    setSelectedUser(null);
    setSelectedReport(null);
    setView("accounts");
  };

  const goBackToUserReports = () => {
    setSelectedReport(null);
    setView("user-reports");
  };

  // ── Breadcrumb ───────────────────────────────────────────────────────────
  const breadcrumbItems = [
    <Anchor key="accounts" size="sm" onClick={goBackToAccounts} style={{ cursor: "pointer" }}>
      Accounts
    </Anchor>,
    ...(selectedUser
      ? [
          <Anchor
            key="user"
            size="sm"
            onClick={view === "report-detail" ? goBackToUserReports : undefined}
            style={{ cursor: view === "report-detail" ? "pointer" : "default" }}
            c={view === "report-detail" ? undefined : "dimmed"}
          >
            {userDisplayName(selectedUser)}
          </Anchor>,
        ]
      : []),
    ...(selectedReport
      ? [
          <Text key="report" size="sm" c="dimmed">
            Report Detail
          </Text>,
        ]
      : []),
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Box py="md" px="lg">
      <Container size="xl">
        <Card radius="lg" withBorder p="xl">
          {/* Header */}
          <Group justify="space-between" mb="md">
            <Stack gap={2}>
              <Title order={4} c={COLORS.sidebarBg ?? "#0D3B66"}>
                Registered Accounts
              </Title>
              <Text size="xs" c="dimmed">
                Manage user accounts, status, and their submitted reports.
              </Text>
            </Stack>
            {/* {!loading && (
              <Badge variant="light" color="teal" size="lg">
                {allUsers.length} total
              </Badge>
            )} */}
          </Group>

          {/* Breadcrumb (only when drilling in) */}
          {view !== "accounts" && (
            <>
              <Breadcrumbs mb="md" separator="›">
                {breadcrumbItems}
              </Breadcrumbs>
              <Divider mb="md" />
            </>
          )}

          {/* Loading / error */}
          {loading && (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          )}

          {error && (
            <Text c="red" ta="center" py="xl">
              {error}
            </Text>
          )}

          {/* Accounts view */}
          {!loading && !error && view === "accounts" && (
            <Stack gap="md">
              <FiltersBar
                filters={filters}
                setFilters={setFilters}
                organizations={organizations}
                countries={countries}
              />

              <Text size="xs" c="dimmed">
                Showing {paginated.length} of {filtered.length} accounts
                {filtered.length !== allUsers.length &&
                  ` (filtered from ${allUsers.length})`}
              </Text>

              <AccountsTable
                users={paginated}
                onViewReports={goToUserReports}
                onToggleActive={handleToggleActive}
              />

              {totalPages > 1 && (
                <Group justify="center" mt="sm">
                  <Pagination
                    total={totalPages}
                    value={page}
                    onChange={setPage}
                    color="teal"
                    size="sm"
                  />
                </Group>
              )}
            </Stack>
          )}

          {/* User reports view */}
          {!loading && !error && view === "user-reports" && selectedUser && (
            <UserReportsList
              user={selectedUser}
              onViewDetail={goToReportDetail}
              onBack={goBackToAccounts}
            />
          )}

          {/* Report detail view */}
          {!loading && !error && view === "report-detail" && selectedReport && (
            <Stack gap="md">
              <ReportDetailsView report={selectedReport} />
            </Stack>
          )}
        </Card>
      </Container>
    </Box>
  );
}
