import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

export const CRISIS_CONFIG = {
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

export const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "#c0392b", bg: "#fadbd8" },
  complete: { label: "Critical", color: "#c0392b", bg: "#fadbd8" },
  high: { label: "High", color: "#e67e22", bg: "#fdebd0" },
  medium: { label: "Medium", color: "#f0b400", bg: "#fef9e7" },
  low: { label: "Low", color: "#27ae60", bg: "#e9f7ef" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export const COLORS = {
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

    Complete: '#FCECE9',
    CompleteText: '#E0533C',
    Minimal: '#FEF3E6',
    MinimalText: '#F08C43',
  
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
