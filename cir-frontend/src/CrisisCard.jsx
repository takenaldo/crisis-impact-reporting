import { Badge, Group } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import {
  CRISIS_CONFIG,
  formatNumber,
  SeverityBadge,
  timeAgo,
  TypeBadge,
} from "./utils";
import { useNavigate } from "react-router-dom";

function CrisisCard({ crisis, isSelected, clickable = true }) {
  const navigate = useNavigate();
  const cfg = CRISIS_CONFIG[crisis.type] || {
    emoji: "⚠️",
    color: "#555",
    bg: "#f9f9f9",
  };

  return (
    <div
      style={{
        background: isSelected ? cfg.bg : "#fff",
        border: `1.5px solid ${isSelected ? cfg.color : "#e8e8e8"}`,
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: isSelected
          ? `0 4px 16px ${cfg.color}30`
          : "0 1px 4px rgba(0,0,0,0.05)",
      }}
      onClick={() => {
        if (clickable) {
          navigate("/crisis/" + crisis.id + "/", { state: { crisis } });
        }
      }}
    >
      <Group gap={10} justify="flex-end">
        <TypeBadge type={crisis.nature_of_crisis} />
        <SeverityBadge severity={crisis.severity} />
      </Group>

      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "#1a1a2e",
          marginBottom: 4,
        }}
      >
        {crisis.name}
      </div>
      <div style={{ fontSize: 13, color: "#555", marginBottom: 6 }}>
        📍 {crisis.location.country} {crisis.location.state_province}{" "}
        {crisis.location.city} &nbsp;·&nbsp; {timeAgo(crisis.incident_datetime)}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#777",
          lineHeight: 1.5,
          marginBottom: 8,
        }}
      >
        {crisis.description}
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
        {crisis.casualties > 0 && (
          <span style={{ color: "#c0392b", fontWeight: 600 }}>
            💔 {formatNumber(crisis.casualties)} casualties
          </span>
        )}
        {crisis.displaced > 0 && (
          <span style={{ color: "#e67e22", fontWeight: 600 }}>
            🏠 {formatNumber(crisis.displaced)} displaced
          </span>
        )}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "#aaa" }}>
        {/* Source: {crisis.source} */}
      </div>

      <Group justify="space-between">
        <div
          style={{
            fontSize: 12,
            color: "#777",
            lineHeight: 1.5,
            marginBottom: 8,
          }}
        >
          {crisis.number_of_reports}{" "}
          {crisis.number_of_reports > 1 ? "reports" : "report"}
        </div>

        <Badge leftSection={<IconPlus size={16} />}>
          <a
            href={`/add-report/${crisis.id}/${crisis.name}`}
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "white",
              textDecoration: "none",
            }}
          >
            Add Report
          </a>
        </Badge>
      </Group>
    </div>
  );
}

export default CrisisCard;
