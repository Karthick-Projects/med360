import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SERVER_URL from "../../config";

// --- Design Tokens ---
const COLORS = {
  primary: "#2563EB",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  success: "#059669",
  danger: "#EF4444",
  accent: "#F1F5F9",
  warning: "#F59E0B",
  info: "#0EA5E9",
};

const LabManagementScreen = () => {
  /* Patient State */
  const [patientId, setPatientId] = useState("");
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  /* Clinical Info */
  const [testName, setTestName] = useState("");
  const [technician, setTechnician] = useState("");

  /* Vitals */
  const [bp, setBp] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [temperature, setTemperature] = useState("");
  const [pulse, setPulse] = useState("");

  /* Observations */
  const [metrics, setMetrics] = useState("");
  const [remarks, setRemarks] = useState("");

  const fetchPatientDetails = async () => {
    if (!patientId) {
      Alert.alert("Required", "Please enter a Patient ID to search.");
      return;
    }
    try {
      setLoadingPatient(true);
      setPatientDetails(null);
      const res = await fetch(`${SERVER_URL}/patient/${patientId}`);
      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Not Found", data.detail || "Patient record does not exist.");
        return;
      }
      setPatientDetails(data);
    } catch {
      Alert.alert("Error", "Check your internet connection.");
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleSaveLabRecord = async () => {
    if (!patientId || !testName || !technician) {
      Alert.alert("Validation", "Patient, Test Name, and Technician are required.");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/admin/lab-report-add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          patientName: patientDetails?.name,
          testName,
          technician,
          bp,
          bloodSugar,
          temperature,
          pulse,
          metrics,
          remarks,
          reportUploaded: false,
        }),
      });

      if (!response.ok) throw new Error();

      Alert.alert("Success", "Lab record filed successfully.");
      resetForm();
    } catch {
      Alert.alert("Error", "Failed to save record. Please try again.");
    }
  };

  const resetForm = () => {
    setPatientId("");
    setPatientDetails(null);
    setTestName("");
    setTechnician("");
    setBp("");
    setBloodSugar("");
    setTemperature("");
    setPulse("");
    setMetrics("");
    setRemarks("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Header Area */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lab Management</Text>
        <Text style={styles.headerSub}>Diagnostics & Clinical Metrics</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollBody}
      >
        {/* CARD 1: SEARCH & IDENTIFY */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SEARCH PATIENT</Text>
          <View style={styles.searchRow}>
            <View style={styles.inputWrapper}>
              <Ionicons name="finger-print" size={18} color={COLORS.textSub} style={styles.fieldIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="PAT-XXX"
                value={patientId}
                onChangeText={setPatientId}
                placeholderTextColor="#94A3B8"
              />
            </View>
            <TouchableOpacity style={styles.searchBtn} onPress={fetchPatientDetails}>
              {loadingPatient ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="search" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {patientDetails && (
            <View style={styles.patientProfile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{patientDetails.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pName}>{patientDetails.name}</Text>
                <Text style={styles.pSub}>DOB: {patientDetails.dob} • ID: {patientId}</Text>
              </View>
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
            </View>
          )}
        </View>

        {/* CARD 2: VITALS DASHBOARD */}
        <View style={[styles.card, !patientDetails && styles.disabledCard]}>
          <Text style={styles.cardLabel}>CLINICAL VITALS</Text>
          <View style={styles.grid}>
            <VitalGauge 
              icon="thermometer" 
              label="Temp" 
              unit="°C" 
              color={COLORS.warning} 
              value={temperature} 
              setter={setTemperature} 
              placeholder="36.5"
            />
            <VitalGauge 
              icon="heart" 
              label="Pulse" 
              unit="bpm" 
              color={COLORS.danger} 
              value={pulse} 
              setter={setPulse} 
              placeholder="72"
            />
          </View>
          <View style={[styles.grid, { marginTop: 12 }]}>
            <VitalGauge 
              icon="water" 
              label="Sugar" 
              unit="mg/dL" 
              color={COLORS.info} 
              value={bloodSugar} 
              setter={setBloodSugar} 
              placeholder="95"
            />
            <VitalGauge 
              icon="speedometer" 
              label="BP" 
              unit="mmHg" 
              color={COLORS.primary} 
              value={bp} 
              setter={setBp} 
              placeholder="120/80"
            />
          </View>
        </View>

        {/* CARD 3: TEST DETAILS */}
        <View style={[styles.card, !patientDetails && styles.disabledCard]}>
          <Text style={styles.cardLabel}>TEST CONFIGURATION</Text>
          
          <Text style={styles.fieldLabel}>Performed Test *</Text>
          <TextInput 
            style={styles.flatInput} 
            placeholder="e.g. CBC / HbA1c" 
            value={testName} 
            onChangeText={setTestName} 
            editable={!!patientDetails}
          />

          <Text style={styles.fieldLabel}>Assigned Technician *</Text>
          <TextInput 
            style={styles.flatInput} 
            placeholder="Enter Name" 
            value={technician} 
            onChangeText={setTechnician} 
            editable={!!patientDetails}
          />
        </View>

        {/* CARD 4: OBSERVATIONS */}
        <View style={[styles.card, !patientDetails && styles.disabledCard]}>
          <Text style={styles.cardLabel}>FINDINGS & REMARKS</Text>
          <TextInput 
            style={[styles.flatInput, styles.textArea]} 
            placeholder="Detailed clinical metrics..." 
            multiline 
            value={metrics} 
            onChangeText={setMetrics} 
            editable={!!patientDetails}
          />
          <TextInput 
            style={[styles.flatInput, styles.textArea, { marginTop: 12 }]} 
            placeholder="Additional doctor remarks..." 
            multiline 
            value={remarks} 
            onChangeText={setRemarks} 
            editable={!!patientDetails}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, !patientDetails && styles.btnDisabled]} 
          onPress={handleSaveLabRecord}
          disabled={!patientDetails}
        >
          <Text style={styles.submitText}>Complete Lab Record</Text>
          <MaterialCommunityIcons name="file-send-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Helper Components ---
const VitalGauge = ({ icon, label, unit, color, value, setter, placeholder }: any) => (
  <View style={styles.gaugeContainer}>
    <View style={styles.gaugeHeader}>
      <MaterialCommunityIcons name={icon} size={16} color={color} />
      <Text style={styles.gaugeLabel}>{label} ({unit})</Text>
    </View>
    <TextInput
      style={styles.gaugeInput}
      placeholder={placeholder}
      keyboardType="numeric"
      value={value}
      onChangeText={setter}
      placeholderTextColor="#CBD5E1"
    />
  </View>
);

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 60, paddingHorizontal: 25, paddingBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: COLORS.textMain },
  headerSub: { fontSize: 14, color: COLORS.textSub, marginTop: 4 },
  
  scrollBody: { paddingHorizontal: 20, paddingBottom: 40 },
  
  card: { 
    backgroundColor: COLORS.white, 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#64748B",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  disabledCard: { opacity: 0.5 },
  cardLabel: { fontSize: 11, fontWeight: "800", color: COLORS.textSub, letterSpacing: 1, marginBottom: 15 },

  searchRow: { flexDirection: "row", gap: 10 },
  inputWrapper: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.accent, 
    borderRadius: 16,
  },
  fieldIcon: { paddingLeft: 15 },
  inputWithIcon: { flex: 1, height: 50, paddingHorizontal: 12, fontWeight: "600", color: COLORS.textMain },
  searchBtn: { 
    width: 50, 
    height: 50, 
    backgroundColor: COLORS.primary, 
    borderRadius: 16, 
    justifyContent: "center", 
    alignItems: "center",
    elevation: 4,
  },

  patientProfile: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#F0FDF4", 
    padding: 15, 
    borderRadius: 20, 
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.success, justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  pName: { fontSize: 16, fontWeight: "700", color: "#166534" },
  pSub: { fontSize: 12, color: "#15803D", marginTop: 2 },
  verifiedTag: { marginLeft: "auto" },

  grid: { flexDirection: "row", gap: 12 },
  gaugeContainer: { flex: 1, backgroundColor: COLORS.accent, padding: 12, borderRadius: 18, borderBottomWidth: 3, borderBottomColor: COLORS.border },
  gaugeHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  gaugeLabel: { fontSize: 11, fontWeight: "700", color: COLORS.textSub },
  gaugeInput: { fontSize: 18, fontWeight: "bold", color: COLORS.textMain, padding: 0 },

  fieldLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textMain, marginTop: 15, marginBottom: 8 },
  flatInput: { backgroundColor: COLORS.accent, borderRadius: 14, height: 50, paddingHorizontal: 15, fontWeight: "600", color: COLORS.textMain },
  textArea: { height: 80, paddingTop: 15, textAlignVertical: "top" },

  submitBtn: { 
    backgroundColor: COLORS.primary, 
    height: 60, 
    borderRadius: 22, 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 10,
    gap: 12,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnDisabled: { backgroundColor: COLORS.textSub, elevation: 0 },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default LabManagementScreen;