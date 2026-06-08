import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8000/api/",
});



// Utility function to convert base64 to File
export function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}


export function timeAgo(isoString) {
    const diff = Math.floor((Date.now() - new Date(isoString)) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
}


export function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toLocaleString();
}



export const CRISIS_CONFIG = {
    earthquake: {
        emoji: "🏚️",
        color: "#e67e22",
        bg: "#fdf2e6",
        label: "Earthquake",
    },
    flood: { emoji: "⛈️", color: "#2980b9", bg: "#ebf5fb", label: "Flood" },
    war: { emoji: "💥", color: "#c0392b", bg: "#fdedec", label: "War/Conflict" },
    conflict: {
        emoji: "⚔️",
        color: "#c0392b",
        bg: "#fdedec",
        label: "War/Conflict",
    },
    tsunami: { emoji: "🌊", color: "#1a5276", bg: "#d6eaf8", label: "Tsunami" },
    hurricane: {
        emoji: "🌀",
        color: "#1a5276",
        bg: "#d6eaf8",
        label: "Hurricane",
    },
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

export const SEVERITY_CONFIG = {
    critical: { label: "Critical", color: "#c0392b", bg: "#fadbd8" },
    high: { label: "High", color: "#e67e22", bg: "#fdebd0" },
    medium: { label: "Medium", color: "#f0b400", bg: "#fef9e7" },
    low: { label: "Low", color: "#27ae60", bg: "#e9f7ef" },
};

// ─── Components ───────────────────────────────────────────────────────────────

export function SeverityBadge({ severity }) {
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

export function TypeBadge({ type }) {
    const cfg = CRISIS_CONFIG[type.toLowerCase()] || {
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