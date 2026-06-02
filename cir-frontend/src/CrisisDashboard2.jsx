import React, { useState, useMemo, useEffect } from "react";

import { api } from "./utils";
import { Link } from "react-router-dom";
import MapComponent from "./MapComponent";
// ─── Sample Data ──────────────────────────────────────────────────────────────
const now = new Date();
const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();

// ─── Config ───────────────────────────────────────────────────────────────────
const CRISIS_CONFIG = {
  earthquake: {
    emoji: "🏚️",
    color: "#e67e22",
    bg: "#fdf2e6",
    label: "Earthquake",
  },
  flood: { emoji: "🌊", color: "#2980b9", bg: "#ebf5fb", label: "Flood" },
  war: { emoji: "💥", color: "#c0392b", bg: "#fdedec", label: "War/Conflict" },
  conflict: {
    emoji: "⚔️",
    color: "#c0392b",
    bg: "#fdedec",
    label: "War/Conflict",
  },
  tsunami: { emoji: "🌊", color: "#1a5276", bg: "#d6eaf8", label: "Tsunami" },
  wildfire: { emoji: "🔥", color: "#e74c3c", bg: "#fdedec", label: "Wildfire" },
  cyclone: { emoji: "🌀", color: "#7d3c98", bg: "#f5eef8", label: "Cyclone" },
  volcano: { emoji: "🌋", color: "#d35400", bg: "#fef5e7", label: "Volcano" },
  drought: { emoji: "☀️", color: "#b7950b", bg: "#fef9e7", label: "Drought" },
  landslide: {
    emoji: "⛰️",
    color: "#6e2f0e",
    bg: "#f9ecde",
    label: "Landslide",
  },
};

const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "#c0392b", bg: "#fadbd8" },
  high: { label: "High", color: "#e67e22", bg: "#fdebd0" },
  medium: { label: "Medium", color: "#f0b400", bg: "#fef9e7" },
  low: { label: "Low", color: "#27ae60", bg: "#e9f7ef" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

// ─── Components ───────────────────────────────────────────────────────────────

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}40`,
        textTransform: "uppercase",
      }}
    >
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const cfg = CRISIS_CONFIG[type] || {
    emoji: "⚠️",
    color: "#555",
    bg: "#f0f0f0",
    label: type,
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}30`,
      }}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function CrisisCard({ crisis, isSelected, onClick }) {
  const cfg = CRISIS_CONFIG[crisis.type] || {
    emoji: "⚠️",
    color: "#555",
    bg: "#f9f9f9",
  };

  return (
    <div
      // onClick={() => onClick(crisis)}
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
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <TypeBadge type={crisis.type} />
        <SeverityBadge severity={crisis.severity} />
      </div>
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

      <a
        href={`/add-report/${crisis.id}/${crisis.name}`}
        style={{ marginTop: 10, fontSize: 12 }}
      >
        Add Report
      </a>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function CrisisDashboard2() {
  const [crisesList, setCrisesList] = useState([]);

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
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
              Global Crisis Impact reporting center
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
          </div>
        </div>
      </div>
      <a href={`/add-report`} style={{ marginTop: 10, fontSize: 12 }}>
        Add New Crisis Report
      </a>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
        {/* Stats Row */}

        {/* Filters & List */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* Sidebar Filters */}

          {/* Crisis Cards List */}
          <div style={{ flex: "1 1 400px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {crisesList.map((crisis) => (
                <CrisisCard
                  key={crisis.id}
                  crisis={crisis}
                  // isSelected={selectedCrisis?.id === crisis.id}
                  // onClick={handleSelect}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
}
