import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
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

const COLORS = {
  primary: "#1E3A8A",
  secondary: "#10B981",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  danger: "#EF4444",
  accent: "#F1F5F9",
};

const AdminUpdateVitalsScreen: React.FC = () => {
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  // --- Vitals State ---
  const [heartRate, setHeartRate] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [spo2, setSpo2] = useState("");
  const [respirationRate, setRespirationRate] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");

  const fetchPatientDetails = async () => {
    if (!patientId.trim()) {
      Alert.alert("Input Required", "Please enter a Patient ID to begin.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/patient/${patientId}`);

      if (!res.ok) {
        Alert.alert("Not Found", "No patient record associated with this ID.");
        setPatient(null);
        return;
      }

      const data = await res.json();
      setPatient(data);
    } catch (err) {
      Alert.alert("Network Error", "Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const submitVitals = async () => {
    if (!patient) {
      Alert.alert("Error", "Please verify a patient first.");
      return;
    }

    // Basic validation to check if at least one vital is entered
    if (!heartRate && !bloodPressure && !temperature && !spo2 && !respirationRate && !bloodSugar) {
      Alert.alert("Empty Data", "Please enter at least one vital metric.");
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
      timestamp: new Date().toISOString(),
    };

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/admin/vitals/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert("Success", "Vitals have been logged successfully.");
        resetVitals();
      } else {
        Alert.alert("Update Failed", "Server rejected the update. Please check data format.");
      }
    } catch {
      Alert.alert("Error", "Server connection lost.");
    } finally {
      setLoading(false);
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vitals Monitoring</Text>
          <Text style={styles.headerSub}>Update real-time patient metrics</Text>
        </View>

        {/* --- Patient Search Card --- */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>IDENTIFY PATIENT</Text>
          <View style={styles.searchRow}>
            <View style={styles.inputContainer}>
              <Ionicons name="id-card-outline" size={18} color={COLORS.textSub} style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. PAT-102"
                value={patientId}
                onChangeText={setPatientId}
                autoCapitalize="characters"
              />
            </View>
            <TouchableOpacity 
              style={[styles.fetchButton, loading && { opacity: 0.7 }]} 
              onPress={fetchPatientDetails}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Ionicons name="search" size={20} color="#FFF" />}
            </TouchableOpacity>
          </View>

          {patient && (
            <View style={styles.patientProfile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
              </View>
              <View style={styles.patientMeta}>
                <Text style={styles.pName}>{patient.name}</Text>
                <Text style={styles.pData}>
                  {patient.gender || "N/A"} • {patient.age ? `${patient.age} yrs` : "Age N/A"} • ID: {patient.id}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.secondary} />
            </View>
          )}
        </View>

        {/* --- Vitals Entry Grid --- */}
        {patient && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardLabel}>BIOMETRIC DATA</Text>
              <TouchableOpacity onPress={resetVitals}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              <VitalBox icon="heart-pulse" label="Heart Rate" unit="BPM" value={heartRate} onChange={setHeartRate} color="#EF4444" />
              <VitalBox icon="blood-bag" label="Blood Pressure" unit="mmHg" value={bloodPressure} onChange={setBloodPressure} color="#3B82F6" />
            </View>

            <View style={styles.grid}>
              <VitalBox icon="thermometer" label="Temp" unit="°F" value={temperature} onChange={setTemperature} color="#F59E0B" />
              <VitalBox icon="oxygen-cylinder" label="SpO₂" unit="%" value={spo2} onChange={setSpo2} color="#10B981" />
            </View>

            <View style={styles.grid}>
              <VitalBox icon="lungs" label="Respiration" unit="rate" value={respirationRate} onChange={setRespirationRate} color="#8B5CF6" />
              <VitalBox icon="diabetes" label="Blood Sugar" unit="mg/dL" value={bloodSugar} onChange={setBloodSugar} color="#EC4899" />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={submitVitals} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>Save Vitals Log</Text>
                  <Ionicons name="cloud-upload-outline" size={20} color="#FFF" style={{marginLeft: 8}} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Specialized Input Sub-component ---
const VitalBox = ({
  icon,
  label,
  unit,
  value,
  onChange,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  unit: string;
  value: string;
  onChange: (text: string) => void;
  color: string;
}) => (
  <View style={styles.vitalBox}>
    <View style={styles.vitalHeader}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
      <Text style={styles.vitalLabel}>{label}</Text>
    </View>
    <View style={styles.vitalInputContainer}>
      <TextInput
        style={styles.vitalInput}
        placeholder="--"
        placeholderTextColor="#CBD5E1"
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
      />
      <Text style={styles.unitText}>{unit}</Text>
    </View>
  </View>
);

export default AdminUpdateVitalsScreen;

// --- Enhanced Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  header: { marginBottom: 25, marginTop: Platform.OS === 'ios' ? 0 : 20 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: COLORS.primary },
  headerSub: { fontSize: 15, color: COLORS.textSub, marginTop: 4 },

  card: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
  },

  cardLabel: { fontSize: 11, fontWeight: "800", color: COLORS.textSub, letterSpacing: 1.2, marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearText: { fontSize: 12, color: COLORS.danger, fontWeight: '600', marginBottom: 15 },

  searchRow: { flexDirection: "row", alignItems: "center" },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingHorizontal: 15,
  },
  searchIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  fetchButton: {
    marginLeft: 12,
    backgroundColor: COLORS.secondary,
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  patientProfile: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#F0FDF4", 
    padding: 15, 
    borderRadius: 18, 
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#DCFCE7"
  },
  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: COLORS.secondary, 
    justifyContent: "center", 
    alignItems: "center",
    marginRight: 15 
  },
  avatarText: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  patientMeta: { flex: 1 },
  pName: { fontSize: 18, fontWeight: "700", color: "#166534" },
  pData: { fontSize: 13, color: "#15803D", marginTop: 2 },

  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  vitalBox: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vitalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  vitalLabel: { fontSize: 12, fontWeight: "700", color: COLORS.textSub },
  vitalInputContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  vitalInput: { 
    fontSize: 22, 
    fontWeight: "800", 
    color: COLORS.textMain, 
    padding: 0,
    minWidth: 40 
  },
  unitText: { fontSize: 12, color: COLORS.textSub, fontWeight: "600", marginBottom: 4 },

  submitButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 17,
  },
});