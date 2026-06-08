import React, { useState, useMemo, useEffect } from "react";

import {
  api,
  CRISIS_CONFIG,
  formatNumber,
  SeverityBadge,
  timeAgo,
  TypeBadge,
} from "./utils";
import { Link, Navigate, useNavigate } from "react-router-dom";
import MapComponent from "./MapComponent";
import { Badge, Group, SimpleGrid, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Select } from "@mantine/core";

// ─── Sample Data ──────────────────────────────────────────────────────────────
const now = new Date();
const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();

function CrisisCard({ crisis, isSelected, onClick }) {
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
        navigate("/crisis/" + crisis.id + "/", { state: { crisis } });
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function CrisisDashboard2() {
  const navigate = useNavigate();
  const [crisesList, setCrisesList] = useState([]);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const response = await api.get("/crises/");
        setCrisesList(response.data);
        console.log("Fetched crises:", response.data);
      } catch (error) {
        console.error("Error fetching crises:", error);
      }
    };

    fetchCrises();
  }, []);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {t("hello")}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(192,57,43,0.6); transform: translate(-50%,-50%) scale(1); }
          50% { box-shadow: 0 0 18px rgba(192,57,43,0.9); transform: translate(-50%,-50%) scale(1.35); }
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          padding: "20px 32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                color: "#fff",
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: -0.5,
              }}
            >
              Global Crisis Impact reporting portal
            </h1>
            <p style={{ color: "#a0aec0", margin: "4px 0 0", fontSize: 13 }}>
              Real-time crisis reporting
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: "6px 14px",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#2ecc71",
                  display: "inline-block",
                  animation: "pulse 2s infinite",
                }}
              />
              <span style={{ color: "#a0aec0", fontSize: 12 }}>
                Live Updates
              </span>
            </div>
            <div style={{ color: "#718096", fontSize: 12 }}>
              Updated: {new Date().toLocaleTimeString()}
            </div>
            <div>
              <Select
                value={i18n.language}
                onChange={changeLanguage}
                size="xs"
                data={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Espanol" },
                  { value: "fr", label: "Français" },
                  { value: "ch", label: "中文" },
                  { value: "ar", label: "العربية" },
                  { value: "ru", label: "Русский" },
                  { value: "am", label: "Amharic" },
                ]}
                w={100}
                style={{
                  marginTop: 20,
                  background: "rgba(255,255,255,0.1)",
                  color: "#a0aec0",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 20,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Group justify="flex-end" p={5}>
        <a href={`/add-report`} style={{ marginTop: 10, fontSize: 12 }}>
          Add New Crisis Report
        </a>
      </Group>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
        {/* Stats Row */}

        {/* Filters & List */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* Sidebar Filters */}

          {/* Crisis Cards List */}
          <div style={{ flex: "1 1 400px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {crisesList.map((crisis) => (
                <a
                  key={crisis.id}
                  // href={"/crisis/" + crisis.id + "/"}
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  <CrisisCard key={crisis.id} crisis={crisis} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
