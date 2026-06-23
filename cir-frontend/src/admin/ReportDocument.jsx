import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  PDFViewer,
} from "@react-pdf/renderer";
import { SERVER_IP } from "../constants";

// --- STYLES FOR ENTERPRISE LOOK ---
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#1E3A8A",
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: "#1E3A8A",
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 4,
    border: "1pt solid #E5E7EB",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 150,
    fontSize: 10,
    color: "#4B5563",
    fontWeight: "bold",
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: "#111827",
  },
  descriptionBox: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
    marginTop: 5,
  },
  photoGrid: {
    flexDirection: "column", // Changed to column for full width
    gap: 20, // Increased gap between photos
    marginTop: 10,
  },
  photoCard: {
    width: "100%", // Expanded from 48% to 100%
    marginBottom: 15,
  },
  photo: {
    height: 300, // Increased from 120 to 300
    objectFit: "cover",
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  photoCaption: {
    fontSize: 10, // Slightly bumped up caption font size to match larger image
    color: "#6B7280",
    marginTop: 6,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
});

// --- HELPER FUNCTION ---
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- PDF DOCUMENT COMPONENT ---
const ReportDocument = ({ data }) => {
  const IMAGE_BASE_URL = SERVER_IP;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Damage Assessment Report</Text>
            <Text style={styles.headerSubtitle}>Report ID: {data?.id || ""}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerSubtitle}>
              Generated On: {new Date().toLocaleDateString()}
            </Text>
            <Text style={styles.headerSubtitle}>Submission: impact report</Text>
          </View>
        </View>

        {/* INCIDENT DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Reported By:</Text>
            <Text style={styles.value}>
              {data?.reported_by?.user || ""} (ID: {data?.reported_by?.id || ""})
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Damage Occurred:</Text>
            <Text style={styles.value}>{formatDate(data?.damage_datetime)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Report Created:</Text>
            <Text style={styles.value}>{formatDate(data.created_at)}</Text>
          </View>
        </View>

        {/* INFRASTRUCTURE INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Infrastructure Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Facility Name:</Text>
            <Text style={styles.value}>{data?.infrastructure_name || ""}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Facility Type:</Text>
            <Text style={styles.value}>{data?.infrastructure_type || ""}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Damage Severity:</Text>
            <Text style={styles.value}>{data?.damage_severity || ""}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Debris Present:</Text>
            <Text style={styles.value}>{data?.debris ? "Yes" : "No"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Electricty Condition:</Text>
            <Text style={styles.value}>{data?.electricity_condition || ""}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Health Service:</Text>
            <Text style={styles.value}>{data.health_services_rating || ""}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Pressing Need:</Text>
            <Text style={styles.value}>{data?.pressing_need || ""}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Coordinates:</Text>
            <Text style={styles.value}>
              Lat: {data?.location?.infrastructure_latitude?.toFixed(6) || ""},
              Lan:{data?.location?.infrastructure_longitude?.toFixed(6) || ""}
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reporter's Damage description</Text>
          <Text style={styles.descriptionBox}>{data?.description || ""}</Text>
        </View>

        {/* PHOTOS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photographic Evidence</Text>
          <View style={styles.photoGrid}>
            {data.photos.map((photo) => (
              // wrap={false} prevents an image from splitting across two pages
              <View key={photo.id} style={styles.photoCard} wrap={false}>
                <Image
                  src={IMAGE_BASE_URL + "/" + photo.image}
                  style={styles.photo}
                />
                <Text style={styles.photoCaption}>
                  {photo?.description
                    ? `Description: ${photo.description}`
                    : `Image ID: ${photo.id.split("-")[0]}`}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* FOOTER */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

// --- MAIN WRAPPER COMPONENT ---
export default function EnterprisePDFViewer({ jsonData }) {
  return (
    <div style={{ width: "100%", height: "100vh", backgroundColor: "#333" }}>
      <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
        <ReportDocument data={jsonData} />
      </PDFViewer>
    </div>
  );
}
