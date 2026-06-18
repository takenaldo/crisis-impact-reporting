import React, { useState, useMemo } from "react";

// ─── Sample Data ──────────────────────────────────────────────────────────────
const now = new Date();
const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();

export const CRISIS_DATA = [
  {
    id: 1,
    type: "earthquake",
    title: "7.8 Magnitude Earthquake",
    location: "Kathmandu, Nepal",
    lat: 27.7,
    lng: 85.3,
    severity: "critical",
    casualties: 312,
    displaced: 45000,
    description:
      "Devastating earthquake strikes central Nepal. Multiple aftershocks reported. Search and rescue operations ongoing.",
    timestamp: hoursAgo(3),
    source: "USGS / Nepal NDM",
    region: "Asia",
  },
  {
    id: 2,
    type: "flood",
    title: "Severe Flash Flooding",
    location: "São Paulo , Brazil",
    lat: -23.5,
    lng: -46.6,
    severity: "high",
    casualties: 28,
    displaced: 12000,
    description:
      "Record-breaking rainfall triggers flash floods across metropolitan area. Highways submerged, hundreds of homes destroyed.",
    timestamp: hoursAgo(7),
    source: "Brazil Civil Defense",
    region: "South America",
  },
  {
    id: 3,
    type: "war",
    title: "Armed Conflict Escalation",
    location: "Khartoum, Sudan",
    lat: 15.5,
    lng: 32.5,
    severity: "critical",
    casualties: 84,
    displaced: 200000,
    description:
      "Heavy urban fighting reported in capital. Civilian corridors blocked. UN calls for immediate ceasefire.",
    timestamp: hoursAgo(1),
    source: "UN OCHA",
    region: "Africa",
  },
  {
    id: 4,
    type: "tsunami",
    title: "Tsunami Warning Issued",
    location: "Hokkaido, Japan",
    lat: 43.0,
    lng: 141.3,
    severity: "high",
    casualties: 4,
    displaced: 8500,
    description:
      "6.9 submarine earthquake triggers 2.4m tsunami waves. Coastal evacuations underway. Ports closed.",
    timestamp: hoursAgo(5),
    source: "Japan Meteorological Agency",
    region: "Asia",
  },
  {
    id: 5,
    type: "wildfire",
    title: "Wildfire Outbreak",
    location: "Athens, Greece",
    lat: 37.9,
    lng: 23.7,
    severity: "high",
    casualties: 7,
    displaced: 3200,
    description:
      "Multiple wildfire fronts burning in Attica region. Strong winds hamper containment efforts. 4,000 hectares burned.",
    timestamp: hoursAgo(12),
    source: "Greek Fire Service",
    region: "Europe",
  },
  {
    id: 6,
    type: "cyclone",
    title: "Cyclone Landfall",
    location: "Odisha, India",
    lat: 20.2,
    lng: 85.8,
    severity: "critical",
    casualties: 16,
    displaced: 180000,
    description:
      "Category 4 cyclone makes landfall. Winds exceeding 220 km/h. Massive evacuation completed before impact.",
    timestamp: hoursAgo(9),
    source: "India Meteorological Dept.",
    region: "Asia",
  },
  {
    id: 7,
    type: "flood",
    title: "River Overflow Crisis",
    location: "Dhaka, Bangladesh",
    lat: 23.8,
    lng: 90.4,
    severity: "medium",
    casualties: 9,
    displaced: 32000,
    description:
      "Brahmaputra River breaches embankments. Low-lying districts inundated. Relief camps established.",
    timestamp: hoursAgo(18),
    source: "Bangladesh BWDB",
    region: "Asia",
  },
  {
    id: 8,
    type: "earthquake",
    title: "6.1 Earthquake Aftershock",
    location: "Diyarbakır, Turkey",
    lat: 37.9,
    lng: 40.2,
    severity: "medium",
    casualties: 12,
    displaced: 5000,
    description:
      "Strong aftershock from previous week's seismic activity. Several buildings collapse. AFAD deployed.",
    timestamp: hoursAgo(22),
    source: "AFAD Turkey",
    region: "Europe",
  },
  {
    id: 9,
    type: "volcano",
    title: "Volcanic Eruption Alert",
    location: "Mount Etna, Italy",
    lat: 37.7,
    lng: 15.0,
    severity: "medium",
    casualties: 0,
    displaced: 1200,
    description:
      "Strombolian eruption with lava fountains reaching 800m. Airport temporarily closed. Nearby towns on alert.",
    timestamp: hoursAgo(14),
    source: "INGV Italy",
    region: "Europe",
  },
  {
    id: 10,
    type: "conflict",
    title: "Humanitarian Crisis",
    location: "Gaza Strip, Palestine",
    lat: 31.4,
    lng: 34.3,
    severity: "critical",
    casualties: 140,
    displaced: 75000,
    description:
      "Ongoing hostilities. Critical shortage of medical supplies and food. Multiple UN agencies appeal for access.",
    timestamp: hoursAgo(2),
    source: "UN OCHA / ICRC",
    region: "Middle East",
  },
  {
    id: 11,
    type: "drought",
    title: "Severe Drought Emergency",
    location: "Mogadishu, Somalia",
    lat: 2.0,
    lng: 45.3,
    severity: "high",
    casualties: 0,
    displaced: 420000,
    description:
      "Fourth consecutive failed rainy season. 3 million facing acute food insecurity. Famine conditions in southern regions.",
    timestamp: hoursAgo(30),
    source: "FEWS NET / WFP",
    region: "Africa",
  },
  {
    id: 12,
    type: "landslide",
    title: "Deadly Landslides",
    location: "Medellín, Colombia",
    lat: 6.2,
    lng: -75.5,
    severity: "high",
    casualties: 34,
    displaced: 2800,
    description:
      "Heavy rainfall triggers multiple landslides in hillside communities. Rescue teams working through night.",
    timestamp: hoursAgo(8),
    source: "UNGRD Colombia",
    region: "South America",
  },
];

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

function StatCard({ value, label, icon, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "18px 22px",
        flex: "1 1 160px",
        minWidth: 140,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function MapDot({ crisis, isSelected, onClick }) {
  const cfg = CRISIS_CONFIG[crisis.type] || { color: "#888" };
  const x = ((crisis.lng + 180) / 360) * 100;
  const y = ((90 - crisis.lat) / 180) * 100;
  const sizeMap = { critical: 18, high: 14, medium: 11, low: 8 };
  const size = sizeMap[crisis.severity] || 10;

  return (
    <div
      onClick={() => onClick(crisis)}
      title={`${crisis.title} — ${crisis.location}`}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: cfg.color,
        border: isSelected ? "3px solid #fff" : "2px solid #fff",
        boxShadow: isSelected
          ? `0 0 0 3px ${cfg.color}, 0 0 16px ${cfg.color}80`
          : `0 0 6px ${cfg.color}80`,
        transform: "translate(-50%, -50%)",
        cursor: "pointer",
        transition: "all 0.2s",
        zIndex: isSelected ? 10 : 1,
        animation:
          crisis.severity === "critical" ? "pulse 1.5s infinite" : "none",
      }}
    />
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
      onClick={() => onClick(crisis)}
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
        {crisis.title}
      </div>
      <div style={{ fontSize: 13, color: "#555", marginBottom: 6 }}>
        📍 {crisis.location} &nbsp;·&nbsp; {timeAgo(crisis.timestamp)}
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
        Source: {crisis.source}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function CrisisDashboard() {
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [search, setSearch] = useState("");

  const regions = useMemo(
    () => ["all", ...new Set(CRISIS_DATA.map((c) => c.region))],
    [],
  );
  const types = useMemo(
    () => ["all", ...new Set(CRISIS_DATA.map((c) => c.type))],
    [],
  );

  const filtered = useMemo(
    () =>
      CRISIS_DATA.filter((c) => filterType === "all" || c.type === filterType)
        .filter(
          (c) => filterSeverity === "all" || c.severity === filterSeverity,
        )
        .filter((c) => filterRegion === "all" || c.region === filterRegion)
        .filter(
          (c) =>
            !search ||
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.location.toLowerCase().includes(search.toLowerCase()),
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [filterType, filterSeverity, filterRegion, search],
  );

  const totalCasualties = CRISIS_DATA.reduce((s, c) => s + c.casualties, 0);
  const totalDisplaced = CRISIS_DATA.reduce((s, c) => s + c.displaced, 0);
  const criticalCount = CRISIS_DATA.filter(
    (c) => c.severity === "critical",
  ).length;

  const handleSelect = (crisis) => {
    setSelectedCrisis((prev) => (prev?.id === crisis.id ? null : crisis));
  };

  const FilterBtn = ({ value, label, current, setter, color }) => (
    <button
      onClick={() => setter(value)}
      style={{
        padding: "5px 12px",
        borderRadius: 20,
        border: `1.5px solid ${
          current === value ? color || "#e53e3e" : "#ddd"
        }`,
        background: current === value ? color || "#e53e3e" : "#fff",
        color: current === value ? "#fff" : "#555",
        fontSize: 12,
        fontWeight: current === value ? 700 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

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
              🌐 Global Crisis Monitor
            </h1>
            <p style={{ color: "#a0aec0", margin: "4px 0 0", fontSize: 13 }}>
              Real-time crisis tracking · Last 48 hours · {CRISIS_DATA.length}{" "}
              active events
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

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
        {/* Stats Row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <StatCard
            value={CRISIS_DATA.length}
            label="Active Crises (48h)"
            icon="🚨"
            color="#e53e3e"
          />
          <StatCard
            value={criticalCount}
            label="Critical Events"
            icon="🔴"
            color="#c0392b"
          />
          <StatCard
            value={formatNumber(totalCasualties)}
            label="Total Casualties"
            icon="💔"
            color="#e67e22"
          />
          <StatCard
            value={formatNumber(totalDisplaced)}
            label="People Displaced"
            icon="🏠"
            color="#3182ce"
          />
          <StatCard
            value={new Set(CRISIS_DATA.map((c) => c.region)).size}
            label="Regions Affected"
            icon="🌍"
            color="#38a169"
          />
        </div>

        {/* World Map */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a2e",
              }}
            >
              🗺️ Crisis Map
            </h2>
            <div
              style={{ display: "flex", gap: 12, fontSize: 12, color: "#777" }}
            >
              {Object.entries({
                critical: "#c0392b",
                high: "#e67e22",
                medium: "#f0b400",
              }).map(([k, c]) => (
                <span
                  key={k}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c,
                      display: "inline-block",
                    }}
                  />
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </span>
              ))}
            </div>
          </div>
          <div
            style={{
              position: "relative",
              paddingTop: "42%",
              background: "#dbeafe",
              overflow: "hidden",
            }}
          >
            <svg
              viewBox="0 0 1000 500"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="1000" height="500" fill="#bfdbfe" />
              {/* North America */}
              <path
                d="M 90 80 L 180 70 L 240 110 L 260 160 L 230 200 L 200 230 L 170 280 L 140 270 L 100 220 L 80 170 Z"
                fill="#d1fae5"
                stroke="#93c5fd"
                strokeWidth="1"
              />
              {/* South America */}
              <path
                d="M 190 290 L 240 270 L 270 300 L 280 360 L 260 430 L 220 460 L 190 430 L 170 370 L 175 320 Z"
                fill="#d1fae5"
                stroke="#93c5fd"
                strokeWidth="1"
              />
              {/* Europe */}
              <path
                d="M 440 60 L 520 55 L 540 80 L 530 110 L 510 130 L 470 140 L 445 120 L 430 90 Z"
                fill="#d1fae5"
                stroke="#93c5fd"
                strokeWidth="1"
              />
              {/* Africa */}
              <path
                d="M 450 160 L 530 150 L 560 190 L 560 270 L 540 360 L 510 400 L 480 390 L 450 340 L 430 260 L 430 190 Z"
                fill="#d1fae5"
                stroke="#93c5fd"
                strokeWidth="1"
              />
              {/* Asia */}
              <path
                d="M 560 50 L 750 45 L 840 80 L 860 140 L 820 200 L 760 220 L 700 210 L 650 230 L 600 220 L 560 180 L 540 130 L 545 80 Z"
                fill="#d1fae5"
                stroke="#93c5fd"
                strokeWidth="1"
              />
              {/* Australia */}
              <path
                d="M 760 290 L 840 285 L 870 310 L 870 370 L 840 390 L 780 385 L 750 360 L 745 320 Z"
                fill="#d1fae5"
                stroke="#93c5fd"
                strokeWidth="1"
              />
              {[100, 200, 300, 400].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="1000"
                  y2={y}
                  stroke="#93c5fd"
                  strokeWidth="0.5"
                  strokeDasharray="4,6"
                  opacity="0.5"
                />
              ))}
              {[200, 400, 600, 800].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="500"
                  stroke="#93c5fd"
                  strokeWidth="0.5"
                  strokeDasharray="4,6"
                  opacity="0.5"
                />
              ))}
            </svg>
            {filtered.map((crisis) => (
              <MapDot
                key={crisis.id}
                crisis={crisis}
                isSelected={selectedCrisis?.id === crisis.id}
                onClick={handleSelect}
              />
            ))}
          </div>
        </div>

        {/* Filters & List */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* Sidebar Filters */}
          <div style={{ flex: "0 0 220px", minWidth: 200 }}>
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                🔍 Search
              </h3>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search crisis or location..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1.5px solid #e0e0e0",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                ⚠️ Severity
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["all", "critical", "high", "medium"].map((s) => {
                  const colors = {
                    critical: "#c0392b",
                    high: "#e67e22",
                    medium: "#f0b400",
                    all: "#555",
                  };
                  return (
                    <FilterBtn
                      key={s}
                      value={s}
                      label={s === "all" ? "All" : SEVERITY_CONFIG[s].label}
                      current={filterSeverity}
                      setter={setFilterSeverity}
                      color={colors[s]}
                    />
                  );
                })}
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                🌍 Region
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {regions.map((r) => (
                  <FilterBtn
                    key={r}
                    value={r}
                    label={r === "all" ? "All" : r}
                    current={filterRegion}
                    setter={setFilterRegion}
                    color="#3182ce"
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                🏷️ Crisis Type
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {types.map((t) => {
                  const cfg = CRISIS_CONFIG[t];
                  return (
                    <FilterBtn
                      key={t}
                      value={t}
                      label={t === "all" ? "All" : cfg?.label || t}
                      current={filterType}
                      setter={setFilterType}
                      color={cfg?.color || "#555"}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Crisis Cards List */}
          <div style={{ flex: "1 1 400px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1a1a2e",
                }}
              >
                Active Events
                <span
                  style={{
                    marginLeft: 10,
                    background: "#e53e3e",
                    color: "#fff",
                    borderRadius: 12,
                    padding: "2px 10px",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {filtered.length}
                </span>
              </h2>
              <span style={{ fontSize: 12, color: "#999" }}>
                Sorted by most recent
              </span>
            </div>

            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 60,
                  color: "#aaa",
                  background: "#fff",
                  borderRadius: 12,
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16 }}>No crises match your filters</div>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {filtered.map((crisis) => (
                  <CrisisCard
                    key={crisis.id}
                    crisis={crisis}
                    isSelected={selectedCrisis?.id === crisis.id}
                    onClick={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 32,
            color: "#aaa",
            fontSize: 12,
            padding: "16px 0",
            borderTop: "1px solid #e8e8e8",
          }}
        >
          ⚠️ Sample dashboard with simulated data for demonstration only.
          &nbsp;|&nbsp; Sources: UN OCHA · USGS · WHO · ReliefWeb
        </div>
      </div>
    </div>
  );
}
