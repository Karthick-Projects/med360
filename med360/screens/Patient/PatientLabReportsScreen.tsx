import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SERVER_URL from "../../config";

/* =======================
    COLORS
======================= */
const COLORS = {
  primary: "#0EA5A4",
  secondary: "#1E88E5",
  success: "#4CAF50",
  danger: "#A40E0E",
  caution: "#FF9800",
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
      <Text style={styles.paramName}>{item.name}</Text>
      <Text style={[styles.paramValue, { color }]}>{item.value}</Text>
      <Text style={styles.paramNormal}>Normal: {item.normal}</Text>
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
        style={styles.rowBetween}
        onPress={() => setExpanded(!expanded)}
      >
        <View>
          <Text style={styles.cardTitle}>{report.testName}</Text>
          <Text style={styles.dateText}>
            <Ionicons name="calendar-outline" size={12} /> {report.date}
          </Text>
        </View>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
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
const PatientLabReportsScreen = () => {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientId();
  }, []);

  useEffect(() => {
    if (patientId) fetchLabReports(patientId);
  }, [patientId]);

  const loadPatientId = async () => {
    const id = await AsyncStorage.getItem("PATIENT_ID");
    setPatientId(id);
  };

  const fetchLabReports = async (pid: string) => {
    try {
      const res = await fetch(
        `${SERVER_URL}/patient/lab-reports/${pid}`
      );
      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Invalid patient data");
        return;
      }

      setPatientName(data.patientName);

      const formatted: LabReport[] = data.reports.map((r: any) => ({
        id: r.reportId,
        testName: r.testName,
        date: new Date(r.createdAt).toDateString(),
        status: "Completed",
        parameters: [
          { name: "BP", value: r.bp, normal: "120/80", status: "Normal" },
          {
            name: "Blood Sugar",
            value: r.bloodSugar,
            normal: "70–140",
            status: Number(r.bloodSugar) > 140 ? "High" : "Normal",
          },
          {
            name: "Temperature",
            value: r.temperature,
            normal: "97–99",
            status: "Normal",
          },
          {
            name: "Pulse",
            value: r.pulse,
            normal: "60–100",
            status: "Normal",
          },
        ],
      }));

      setReports(formatted);
    } catch (error) {
      Alert.alert("Network Error", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* Patient Info */}
        <View style={styles.patientCard}>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.patientId}>Patient ID: {patientId}</Text>
        </View>

        <Text style={styles.headerTitle}>Lab Reports</Text>

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Loading...
          </Text>
        ) : (
          reports.map((r) => (
            <LabReportCard key={r.id} report={r} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default PatientLabReportsScreen;

/* =======================
    STYLES
======================= */
const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 14,
    color: COLORS.textDark,
  },
  patientCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
    elevation: 2,
  },
  patientName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  patientId: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  reportBody: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  paramRow: {
    marginBottom: 10,
  },
  paramName: {
    fontSize: 14,
    fontWeight: "700",
  },
  paramValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  paramNormal: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
