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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SERVER_URL from "../../config";

const LabManagementScreen = () => {
  /* Patient State */
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  /* Test Info */
  const [testName, setTestName] = useState("");
  const [technician, setTechnician] = useState("");

  /* Vitals */
  const [bp, setBp] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [temperature, setTemperature] = useState("");
  const [pulse, setPulse] = useState("");

  /* Metrics */
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
        Alert.alert("Not Found", data.detail || "Patient ID does not exist.");
        setPatientName("");
        return;
      }
      setPatientDetails(data);
      setPatientName(data.name);
    } catch {
      Alert.alert("Error", "Check your internet connection.");
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleSaveLabRecord = async () => {
    if (!patientId || !testName || !technician) {
      Alert.alert("Missing Info", "Please fill in the Patient, Test Name, and Technician.");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/admin/lab-report-add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId, patientName, testName, technician,
          bp, bloodSugar, temperature, pulse, metrics, remarks,
          reportUploaded: false,
        }),
      });

      if (!response.ok) throw new Error();

      Alert.alert("Success", "Lab record has been filed successfully.");
      resetForm();
    } catch {
      Alert.alert("Error", "Failed to save record. Please try again.");
    }
  };

  const resetForm = () => {
    setPatientId(""); setPatientName(""); setPatientDetails(null);
    setTestName(""); setTechnician(""); setBp("");
    setBloodSugar(""); setTemperature(""); setPulse("");
    setMetrics(""); setRemarks("");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Lab Management</Text>
          <Text style={styles.subtitle}>Enter clinical findings and test results</Text>
        </View>

        {/* Section 1: Patient Search */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-search-outline" size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Patient Verification</Text>
          </View>
          
          <Text style={styles.label}>Patient ID</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="e.g. PAT-102"
              value={patientId}
              onChangeText={setPatientId}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={fetchPatientDetails}>
              {loadingPatient ? <ActivityIndicator color="#fff" /> : <Ionicons name="search" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>

          {patientDetails && (
            <View style={styles.patientInfoBox}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account-check" size={20} color="#059669" />
                <Text style={styles.patientNameText}>{patientDetails.name}</Text>
              </View>
              <Text style={styles.patientSubText}>DOB: {patientDetails.dob}  •  ID: {patientId}</Text>
            </View>
          )}
        </View>

        {/* Section 2: Test Details */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flask-outline" size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Test Information</Text>
          </View>

          <Text style={styles.label}>Test Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Full Blood Count" 
            value={testName} 
            onChangeText={setTestName} 
          />

          <Text style={styles.label}>Lab Technician</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Name of performing technician" 
            value={technician} 
            onChangeText={setTechnician} 
          />
        </View>

        {/* Section 3: Vitals Grid */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pulse-outline" size={20} color="#EF4444" />
            <Text style={styles.sectionTitle}>Patient Vitals</Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>BP (mmHg)</Text>
              <TextInput style={styles.input} placeholder="120/80" value={bp} onChangeText={setBp} />
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Sugar (mg/dL)</Text>
              <TextInput style={styles.input} placeholder="95" value={bloodSugar} onChangeText={setBloodSugar} />
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Temp (°C)</Text>
              <TextInput style={styles.input} placeholder="36.5" value={temperature} onChangeText={setTemperature} />
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Pulse (bpm)</Text>
              <TextInput style={styles.input} placeholder="72" value={pulse} onChangeText={setPulse} />
            </View>
          </View>
        </View>

        {/* Section 4: Observations */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Metrics & Observations</Text>
          </View>
          
          <Text style={styles.label}>Clinical Metrics</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Detailed measurements..." 
            multiline 
            numberOfLines={3} 
            value={metrics} 
            onChangeText={setMetrics} 
          />

          <Text style={styles.label}>Remarks</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Additional notes..." 
            multiline 
            numberOfLines={2} 
            value={remarks} 
            onChangeText={setRemarks} 
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveLabRecord}>
          <Text style={styles.submitText}>Complete Lab Record</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingHorizontal: 20 },
  header: { marginTop: 24, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#1E293B" },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },

  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#334155" },

  label: { fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 15,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textArea: { textAlignVertical: "top", minHeight: 80 },

  searchRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  searchBtn: {
    backgroundColor: "#2563EB",
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  patientInfoBox: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  patientNameText: { fontSize: 16, fontWeight: "700", color: "#166534" },
  patientSubText: { fontSize: 12, color: "#15803D", marginTop: 4, marginLeft: 28 },

  grid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  gridItem: { flex: 1 },

  submitBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    margin: 10,
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});

export default LabManagementScreen;