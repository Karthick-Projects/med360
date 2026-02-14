import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SERVER_URL from "../../config";

// --- Types ---
type Patient = {
  id: string;
  name: string;
  age?: number;
  gender?: string;
};

const AdminUpdateVitalsScreen: React.FC = () => {
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  // --- Vitals ---
  const [heartRate, setHeartRate] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [spo2, setSpo2] = useState("");
  const [respirationRate, setRespirationRate] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");

  // --- Fetch Patient Details ---
  const fetchPatientDetails = async () => {
    if (!patientId.trim()) {
      Alert.alert("Error", "Please enter Patient ID");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/patient/${patientId}`);

      if (!res.ok) {
        Alert.alert("Error", "Patient not found");
        setPatient(null);
        return;
      }

      const data = await res.json();
      setPatient(data);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch patient");
    } finally {
      setLoading(false);
    }
  };

  // --- Submit Vitals ---
  const submitVitals = async () => {
    if (!patient) {
      Alert.alert("Error", "Fetch patient first");
      return;
    }

    const payload = {
      patient_id: patientId,
      heart_rate: heartRate,
      blood_pressure: bloodPressure,
      temperature,
      spo2,
      respiration_rate: respirationRate,
      blood_sugar: bloodSugar,
    };

    try {
      const res = await fetch(`${SERVER_URL}/admin/vitals/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert("Success", "Vitals updated successfully");
        resetVitals();
      } else {
        Alert.alert("Error", "Failed to update vitals");
      }
    } catch {
      Alert.alert("Error", "Server error");
    }
  };

  const resetVitals = () => {
    setHeartRate("");
    setBloodPressure("");
    setTemperature("");
    setSpo2("");
    setRespirationRate("");
    setBloodSugar("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Update Patient Vitals</Text>

      {/* --- Patient ID --- */}
      <View style={styles.card}>
        <Text style={styles.label}>Patient ID</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Enter Patient ID"
            value={patientId}
            onChangeText={setPatientId}
          />
          <TouchableOpacity style={styles.fetchButton} onPress={fetchPatientDetails}>
            <Ionicons name="search" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {loading && <Text style={styles.loadingText}>Fetching patient...</Text>}

        {patient && (
          <View style={styles.patientInfo}>
            <Text style={styles.patientText}><Text style={styles.bold}>Name:</Text> {patient.name}</Text>
            <Text style={styles.patientText}><Text style={styles.bold}>ID:</Text> {patient.id}</Text>
            {patient.age && <Text style={styles.patientText}><Text style={styles.bold}>Age:</Text> {patient.age}</Text>}
            {patient.gender && <Text style={styles.patientText}><Text style={styles.bold}>Gender:</Text> {patient.gender}</Text>}
          </View>
        )}
      </View>

      {/* --- Vitals Input --- */}
      {patient && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vitals & Metrics</Text>

          <VitalInput icon="heart-pulse" label="Heart Rate (BPM)" value={heartRate} onChange={setHeartRate} />
          <VitalInput icon="blood-bag" label="Blood Pressure (mmHg)" value={bloodPressure} onChange={setBloodPressure} />
          <VitalInput icon="thermometer" label="Temperature (°F)" value={temperature} onChange={setTemperature} />
          <VitalInput icon="oxygen-cylinder" label="SpO₂ (%)" value={spo2} onChange={setSpo2} />
          <VitalInput icon="lungs" label="Respiration Rate" value={respirationRate} onChange={setRespirationRate} />
          <VitalInput icon="diabetes" label="Blood Sugar (mg/dL)" value={bloodSugar} onChange={setBloodSugar} />

          <TouchableOpacity style={styles.submitButton} onPress={submitVitals}>
            <Text style={styles.submitText}>Submit Vitals</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// --- Reusable Input Component ---
const VitalInput = ({
  icon,
  label,
  value,
  onChange,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  onChange: (text: string) => void;
}) => (
  <View style={styles.vitalRow}>
    <MaterialCommunityIcons name={icon} size={22} color="#10B981" />
    <TextInput
      style={styles.vitalInput}
      placeholder={label}
      keyboardType="numeric"
      value={value}
      onChangeText={onChange}
    />
  </View>
);

export default AdminUpdateVitalsScreen;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8", padding: 16 },
  headerTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#1E3A8A" },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center" },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFF",
  },

  fetchButton: {
    marginLeft: 10,
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 8,
  },

  loadingText: { marginTop: 8, fontSize: 12, color: "#64748B" },

  patientInfo: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  patientText: { fontSize: 14, color: "#334155", marginBottom: 4 },
  bold: { fontWeight: "700" },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },

  vitalRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#FFF",
  },

  vitalInput: { flex: 1, padding: 10 },

  submitButton: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  submitText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});
