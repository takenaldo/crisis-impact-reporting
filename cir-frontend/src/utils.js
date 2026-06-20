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

    reportMatchGroup: {
        emoji: "📌",
        color: "#6e2f0e",
        bg: "#f9ecde",
        label: "Landslide",
    },

};

export const SEVERITY_CONFIG = {
    complete: { label: "Critical", color: "red", bg: "red" },
    partial: { label: "High", color: "#e67e22", bg: "#fdebd0" },
    minimal: { label: "Medium", color: "#f0b400", bg: "#fef9e7" },
    low: { label: "Low", color: "#27ae60", bg: "#e9f7ef" },
    no_Damage: { label: "Low", color: "#27ae60", bg: "#e9f7ef" },

};


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

// Helper to color-code severity if applicable
export function getSeverityColor(severity) {
    if (!severity) return "gray";
    // const s = severity.toLowerCase();

    const colors = {
        'No Damage': '--color-teal',
        'Partial': '--color-navy',
        'Minimal': '-color-amber',
        'Complete': '--color-red-orange'
    }
    return colors[severity]

    // if (s.includes("high") || s.includes("severe")) return "red";
    // if (s.includes("medium") || s.includes("moderate")) return "orange";
    // return "blue";
};




export function getUserDetails() {
    try {
        return JSON.parse(localStorage.getItem('user'))
    } catch (error) {
        return null;
    }
}


/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * Returns the distance in kilometers.
 */
function haversineDistance(lon1, lat1, lon2, lat2) {
    const R = 6371.0; // Radius of the Earth in km
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Swaps incident_point coordinates between [lng,lat] and [lat,lng].
// Call before submit (internal [lng,lat] → stored [lat,lng]) and after fetch (stored [lat,lng] → display [lng,lat]).
export function swapAnnotationPointCoords(annotations) {
    if (!annotations?.incident_point?.geometry?.coordinates) return annotations;
    const [a, b] = annotations.incident_point.geometry.coordinates;
    return {
        ...annotations,
        incident_point: {
            ...annotations.incident_point,
            geometry: { ...annotations.incident_point.geometry, coordinates: [b, a] },
        },
    };
}

/**
 * Categorizes an array of report objects based on proximity and time rules.
 * Returns an object with match groups as keys and arrays of items as values.
 */
export function getCategorizeReports(reports, distanceThreshold = 100, timeRangeThresholdHrs = 48) {



    const n = reports.length;
    const edges = [];

    // 1. Compare all items against each other to find matches
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            try {
                const rep1 = reports[i];
                const rep2 = reports[j];

                const [lon1, lat1] = rep1.annotations?.incident_point?.geometry?.coordinates;
                const [lon2, lat2] = rep2.annotations?.incident_point?.geometry?.coordinates;

                if (!lon1 || !lat2 || !lon2 || !lat2)
                    continue;


                const dt1 = new Date(rep1.damage_datetime);
                const dt2 = new Date(rep2.damage_datetime);

                const distanceKm = haversineDistance(lon1, lat1, lon2, lat2);
                const timeDiffHours = Math.abs(dt1 - dt2) / (1000 * 60 * 60);

                // 2. Check if both rules are met (<= 10km AND <= 48 hours)
                if (distanceKm <= distanceThreshold && timeDiffHours <= timeRangeThresholdHrs) {
                    edges.push([i, j]);
                }
            }
            catch (error) {
                continue
            }

        }

        // 3. Group interconnected matches using Union-Find algorithm
        const parent = Array.from({ length: n }, (_, i) => i);

        function find(i) {
            if (parent[i] === i) return i;
            parent[i] = find(parent[i]);
            return parent[i];
        }

        for (const [u, v] of edges) {
            const rootU = find(u);
            const rootV = find(v);
            if (rootU !== rootV) {
                parent[rootU] = rootV;
            }
        }

        // 4. Collect items into their respective groups
        const groups = {};
        for (let i = 0; i < n; i++) {
            const root = find(i);
            if (!groups[root]) {
                groups[root] = [];
            }
            groups[root].push(reports[i]);
        }

        // 5. Build the desired output object
        const categorizedResults = {
            "No Match": [] // Initialize an array for all items that don't match anything
        };
        let groupIdx = 1;

        for (const root in groups) {
            const items = groups[root];

            if (items.length > 1) {
                // Create a new key for this match group and assign the array of items
                categorizedResults[`Match group ${groupIdx}`] = items;
                groupIdx++;
            } else {
                // Push solitary items into the centralized no_match array
                categorizedResults["No Match"].push(items[0]);
            }
        }

        console.log(categorizedResults);


        return categorizedResults;
    }

}

// --- Example Usage ---
// const processedData = categorizeReports(jsonData);
// console.log(JSON.stringify(processedData, null, 2));