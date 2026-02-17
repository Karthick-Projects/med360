import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SERVER_URL from "../../config";

/* =======================
    COLORS & THEME
======================= */
const COLORS = {
  primary: "#0EA5A4",
  secondary: "#1E3A8A",
  success: "#10B981",
  danger: "#EF4444",
  caution: "#F59E0B",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  textDark: "#0F172A",
  textLight: "#64748B",
  border: "#E2E8F0",
};

/* =======================
    TYPES
======================= */
type LabParameter = {
  name: string;
  value: string;
  normal: string;
  status: "Normal" | "High" | "Low";
};

type LabReport = {
  id: string;
  testName: string;
  date: string;
  status: "Completed";
  parameters: LabParameter[];
};

/* =======================
    PARAMETER ROW
======================= */
const ParameterRow = ({ item }: { item: LabParameter }) => {
  const color =
    item.status === "High"
      ? COLORS.danger
      : item.status === "Low"
      ? COLORS.caution
      : COLORS.success;

  return (
    <View style={styles.paramRow}>
      <View style={styles.rowBetween}>
        <Text style={styles.paramName}>{item.name}</Text>
        <Text style={[styles.statusTag, { color, backgroundColor: color + "15" }]}>
          {item.status}
        </Text>
      </View>
      <Text style={[styles.paramValue, { color }]}>{item.value}</Text>
      <Text style={styles.paramNormal}>Reference: {item.normal}</Text>
    </View>
  );
};

/* =======================
    LAB REPORT CARD
======================= */
const LabReportCard = ({ report }: { report: LabReport }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.rowBetween}
        onPress={() => setExpanded(!expanded)}
      >
        <View>
          <Text style={styles.cardTitle}>{report.testName}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textLight} />
            <Text style={styles.dateText}> {report.date}</Text>
          </View>
        </View>

        <Ionicons
          name={expanded ? "chevron-up-circle" : "chevron-down-circle"}
          size={26}
          color={COLORS.primary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.reportBody}>
          {report.parameters.map((p, index) => (
            <ParameterRow key={index} item={p} />
          ))}
        </View>
      )}
    </View>
  );
};

/* =======================
    MAIN SCREEN
======================= */
const DoctorLabLookupScreen = () => {
  const [searchId, setSearchId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchLabReports = async () => {
    if (!searchId.trim()) {
      Alert.alert("Input Required", "Please enter a Patient ID");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${SERVER_URL}/patient/lab-reports/${searchId}`);
      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Not Found", data.detail || "No reports found for this ID");
        setReports([]);
        setPatientName("");
        return;
      }

      setPatientName(data.patientName);

      const formatted: LabReport[] = data.reports.map((r: any) => ({
        id: r.reportId || Math.random().toString(),
        testName: r.testName || "Vitals/Lab Check",
        date: new Date(r.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "Completed",
        parameters: [
          { name: "Blood Pressure", value: r.bp, normal: "120/80", status: "Normal" },
          {
            name: "Blood Sugar",
            value: `${r.bloodSugar} mg/dL`,
            normal: "70–140",
            status: Number(r.bloodSugar) > 140 ? "High" : Number(r.bloodSugar) < 70 ? "Low" : "Normal",
          },
          { name: "Temperature", value: `${r.temperature} °F`, normal: "97–99", status: "Normal" },
          { name: "Pulse Rate", value: `${r.pulse} bpm`, normal: "60–100", status: "Normal" },
        ],
      }));

      setReports(formatted);
    } catch (error) {
      Alert.alert("Network Error", "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* SEARCH HEADER */}
      <View style={styles.searchSection}>
        <Text style={styles.dashTitle}>Lab Diagnostics</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.input}
            placeholder="Enter Patient ID..."
            value={searchId}
            onChangeText={setSearchId}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.lookupBtn} onPress={fetchLabReports}>
            <Text style={styles.lookupBtnText}>Fetch</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : !hasSearched ? (
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>Enter Patient ID to retrieve lab history</Text>
          </View>
        ) : (
          <>
            {/* Patient Identity Bar */}
            {patientName ? (
              <View style={styles.patientInfoBar}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{patientName.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.infoName}>{patientName}</Text>
                  <Text style={styles.infoId}>ID: {searchId}</Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>Historical Reports ({reports.length})</Text>

            {reports.length === 0 ? (
              <Text style={styles.noDataText}>No records found for this patient.</Text>
            ) : (
              reports.map((r) => <LabReportCard key={r.id} report={r} />)
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default DoctorLabLookupScreen;

/* =======================
    STYLES
======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  searchSection: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 4,
  },
  dashTitle: { fontSize: 24, fontWeight: "800", color: COLORS.secondary, marginBottom: 15 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: { flex: 1, height: 45, fontSize: 16, color: COLORS.textDark, marginLeft: 8 },
  lookupBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  lookupBtnText: { color: "#FFF", fontWeight: "700" },

  scrollContent: { padding: 16 },
  patientInfoBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  infoName: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  infoId: { color: "rgba(255,255,255,0.7)", fontSize: 12 },

  sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textLight, textTransform: "uppercase", marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 15, elevation: 2 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark },
  dateRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  dateText: { fontSize: 13, color: COLORS.textLight },
  
  reportBody: { marginTop: 15, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 15 },
  paramRow: { marginBottom: 15, backgroundColor: COLORS.bg, padding: 12, borderRadius: 10 },
  paramName: { fontSize: 14, fontWeight: "600", color: COLORS.textLight },
  paramValue: { fontSize: 18, fontWeight: "800", marginVertical: 2 },
  paramNormal: { fontSize: 11, color: COLORS.textLight },
  statusTag: { fontSize: 10, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, overflow: 'hidden' },

  emptyState: { alignItems: "center", marginTop: 80 },
  emptyText: { color: COLORS.textLight, marginTop: 15, textAlign: "center", fontSize: 15 },
  noDataText: { textAlign: "center", color: COLORS.textLight, marginTop: 20 },
});