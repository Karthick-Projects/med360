import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SERVER_URL from "../../config";

/* ================= THEME ================= */

const PRIMARY_TEAL = "#00A896";
const COMPLEMENT_MAGENTA = "#A80096";
const PRIMARY_DARK = "#0F172A";
const LIGHT_BACKGROUND = "#F4F6F8";

/* ================= TYPES ================= */

type PatientDetails = {
  id: string;
  user_id: string;
  role: string;
  name: string;
  dob: string;
  age: number;
  gender: string;
  mobile: string;
  address: string;
  disease: string;
  assignedDoctor: string;
  status: string;
};

type HistoryRecord = {
  id: string;
  date: string;
  title: string;
  type: string;
  details: string;
};

type VitalsRecord = {
  id: string;
  date: string;
  bloodPressure: string;
  heartRate: number;
  temperature: string;
  weight: string;
  spo2: number;
};

type PrescriptionRecord = {
  id: string;
  date: string;
  medication: string;
  dosage: string;
};

/* ================= DUMMY DATA ================= */

const HISTORY_RECORDS: HistoryRecord[] = [
  {
    id: "h1",
    date: "10 Jan 2026",
    title: "Acute Fever & Body Aches",
    type: "Consultation",
    details:
      "Patient presented with high fever (102.5°F) for 3 days. Prescribed Acetaminophen.",
  },
  {
    id: "h2",
    date: "05 Feb 2026",
    title: "Routine Checkup",
    type: "Consultation",
    details: "General health checkup. All vitals normal.",
  },
];

const VITALS_RECORDS: VitalsRecord[] = [
  {
    id: "v1",
    date: "10 Jan 2026",
    bloodPressure: "135/85",
    heartRate: 88,
    temperature: "38.9",
    weight: "75",
    spo2: 97,
  },
  {
    id: "v2",
    date: "05 Feb 2026",
    bloodPressure: "130/80",
    heartRate: 82,
    temperature: "37.2",
    weight: "74",
    spo2: 98,
  },
];

const PRESCRIPTION_DATA: PrescriptionRecord[] = [
  {
    id: "p1",
    date: "10 Jan 2026",
    medication: "Acetaminophen",
    dosage: "500mg (3× daily)",
  },
  {
    id: "p2",
    date: "05 Feb 2026",
    medication: "Vitamin D",
    dosage: "1000 IU daily",
  },
];

/* ================= COMPONENTS ================= */

const DetailRow = ({ icon, label, value }: any) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={18} color={PRIMARY_TEAL} />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

/* ================= MAIN SCREEN ================= */

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7;

const PatientMedicalHistoryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Records" | "Vitals" | "Prescriptions">("Records");
  const [patientData, setPatientData] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        setLoading(true);
        const patientId = await AsyncStorage.getItem("PATIENT_ID");
        if (!patientId) throw new Error("Patient ID not found");

        const response = await fetch(`${SERVER_URL}/patient/${patientId}`);
        if (!response.ok) throw new Error("Failed to fetch patient profile");

        const data: PatientDetails = await response.json();
        setPatientData(data);
      } catch (err: any) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading patient profile...</Text>
      </View>
    );
  }

  if (error || !patientData) {
    return (
      <View style={styles.center}>
        <Text>{error ?? "No patient data found"}</Text>
      </View>
    );
  }

  /* Horizontal Card Renderer */
  const renderCards = (data: any[], type: "Records" | "Vitals" | "Prescriptions") => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {data.map((item) => (
        <View key={item.id} style={[styles.card, { width: CARD_WIDTH, marginRight: 15 }]}>
          {type === "Records" && (
            <>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.type} – {item.date}</Text>
              <Text style={styles.cardDetails}>{item.details}</Text>
            </>
          )}
          {type === "Vitals" && (
            <>
              <Text style={styles.cardTitle}>Vitals – {item.date}</Text>
              <View style={styles.vitalsHorizontal}>
                <Text style={styles.vitalLabel}>🩸 BP: {item.bloodPressure}</Text>
                <Text style={styles.vitalLabel}>❤️ HR: {item.heartRate} bpm</Text>
                <Text style={styles.vitalLabel}>🌡️ Temp: {item.temperature}°C</Text>
                <Text style={styles.vitalLabel}>⚖️ Weight: {item.weight} kg</Text>
                <Text style={styles.vitalLabel}>🫁 SpO₂: {item.spo2}%</Text>
              </View>
            </>
          )}
          {type === "Prescriptions" && (
            <>
              <Text style={styles.cardTitle}>{item.medication}</Text>
              <Text style={styles.cardSub}>Date: {item.date}</Text>
              <Text style={styles.cardDetails}>Dosage: {item.dosage}</Text>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.screenContainer}>
      <ScrollView stickyHeaderIndices={[1]}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medical History</Text>
          <Text style={styles.headerName}>{patientData.name}</Text>
          <Text style={styles.headerSubtitle}>Patient ID: {patientData.user_id}</Text>

          <View style={styles.patientInfoCard}>
            <DetailRow icon="person-outline" label="Gender" value={patientData.gender} />
            <DetailRow icon="water-outline" label="Disease" value={patientData.disease} />
            <DetailRow icon="hourglass-outline" label="Age" value={`${patientData.age} yrs`} />
          </View>
        </View>

        {/* HORIZONTAL TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {["Records", "Vitals", "Prescriptions"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={activeTab === tab ? styles.tabLabelTextActive : styles.tabLabelText}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* HORIZONTAL CONTENT */}
        <View style={styles.content}>
          {activeTab === "Records" && renderCards(HISTORY_RECORDS, "Records")}
          {activeTab === "Vitals" && renderCards(VITALS_RECORDS, "Vitals")}
          {activeTab === "Prescriptions" && renderCards(PRESCRIPTION_DATA, "Prescriptions")}
        </View>
      </ScrollView>
    </View>
  );
};

export default PatientMedicalHistoryScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: LIGHT_BACKGROUND },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: PRIMARY_TEAL,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerTitle: { color: "#DCE3F0", fontSize: 14 },
  headerName: { color: "#fff", fontSize: 30, fontWeight: "800" },
  headerSubtitle: { color: "#DCE3F0", marginBottom: 10 },

  patientInfoCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  detailRow: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: { marginLeft: 6, fontWeight: "600", color: PRIMARY_DARK },
  detailValue: { marginLeft: 4, fontWeight: "700" },

  tabsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#F4F6F8",
    flexDirection: "row",
  },

  tabLabel: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  tabLabelActive: {
    backgroundColor: PRIMARY_TEAL,
  },
  tabLabelText: {
    fontWeight: "600",
    color: "#475569",
  },
  tabLabelTextActive: {
    fontWeight: "700",
    color: "#fff",
  },

  content: { paddingVertical: 15, paddingLeft: 15 },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: PRIMARY_DARK,
  },

  cardSub: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },

  cardDetails: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 18,
  },

  vitalsHorizontal: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 12,
    marginTop: 6,
  },

  vitalLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
});
