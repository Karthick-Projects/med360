import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import SERVER_URL from '../../config';
const LabManagementScreen = () => {
  /* Patient & Test Info */
  const [patientName, setPatientName] = useState("");
  const [testName, setTestName] = useState("");
  const [technician, setTechnician] = useState("");

  /* Vitals */
  const [bp, setBp] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [temperature, setTemperature] = useState("");
  const [pulse, setPulse] = useState("");

  /* Metrics & Results */
  const [metrics, setMetrics] = useState("");
  const [remarks, setRemarks] = useState("");
  const [patientId, setPatientId] = useState(""); // new field

  /* Report Upload */
  const [reportUploaded, setReportUploaded] = useState(false);

  const handleUploadReport = () => {
    // Placeholder for file upload
    setReportUploaded(true);
    Alert.alert("Report Uploaded", "Patient test report uploaded successfully");
  };

const handleSaveLabRecord = async () => {
  if (!patientId || !patientName || !testName || !bp || !bloodSugar || !technician) {
    Alert.alert("Validation Error", "Please fill all required fields");
    return;
  }

  try {
    const response = await fetch(`${SERVER_URL}/admin/lab-report-add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        patientName,
        testName,
        technician,
        bp,
        bloodSugar,
        temperature,
        pulse,
        metrics,
        remarks,
        reportUploaded
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert("Error", data.detail || "Failed to save lab record");
      return;
    }

    Alert.alert("Success", "Lab record saved successfully");

    // Reset form
    setPatientId("");
    setPatientName("");
    setTestName("");
    setTechnician("");
    setBp("");
    setBloodSugar("");
    setTemperature("");
    setPulse("");
    setMetrics("");
    setRemarks("");
    setReportUploaded(false);

  } catch (error) {
    console.error(error);
    Alert.alert("Network Error", "Unable to save lab record");
  }
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lab Management</Text>

      <View style={styles.card}>
        {/* Patient & Test */}
        <Text style={styles.sectionTitle}>Patient & Test Info</Text>
        <Text style={styles.label}>Patient ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter patient ID"
          value={patientId}
          onChangeText={setPatientId}
        />

        <Text style={styles.label}>Patient Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter patient name"
          value={patientName}
          onChangeText={setPatientName}
        />

        <Text style={styles.label}>Test Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Blood Test / ECG / X-Ray"
          value={testName}
          onChangeText={setTestName}
        />

        <Text style={styles.label}>Lab Technician *</Text>
        <TextInput
          style={styles.input}
          placeholder="Technician name"
          value={technician}
          onChangeText={setTechnician}
        />

        {/* Vitals */}
        <Text style={styles.sectionTitle}>Patient Vitals</Text>

        <Text style={styles.label}>Blood Pressure (BP) *</Text>
        <TextInput
          style={styles.input}
          placeholder="120/80"
          value={bp}
          onChangeText={setBp}
        />

        <Text style={styles.label}>Blood Sugar *</Text>
        <TextInput
          style={styles.input}
          placeholder="mg/dL"
          keyboardType="numeric"
          value={bloodSugar}
          onChangeText={setBloodSugar}
        />

        <Text style={styles.label}>Temperature (°C)</Text>
        <TextInput
          style={styles.input}
          placeholder="98.6"
          keyboardType="numeric"
          value={temperature}
          onChangeText={setTemperature}
        />

        <Text style={styles.label}>Pulse Rate</Text>
        <TextInput
          style={styles.input}
          placeholder="Beats per minute"
          keyboardType="numeric"
          value={pulse}
          onChangeText={setPulse}
        />

        {/* Metrics */}
        <Text style={styles.sectionTitle}>Metrics & Observations</Text>

        <Text style={styles.label}>Metrics</Text>
        <TextInput
          style={styles.input}
          placeholder="Hb, WBC count, ECG values..."
          value={metrics}
          onChangeText={setMetrics}
        />

        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={styles.input}
          placeholder="Lab observations"
          value={remarks}
          onChangeText={setRemarks}
        />

        {/* Report Upload */}
        <Text style={styles.sectionTitle}>Test Report</Text>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={handleUploadReport}
        >
          <Text style={styles.uploadText}>
            {reportUploaded ? "✔ Report Uploaded" : "Upload Test Report"}
          </Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSaveLabRecord}
        >
          <Text style={styles.submitText}>Save Lab Record</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 6,
    color: "#1f2937",
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#ffffff",
  },
  uploadBtn: {
    backgroundColor: "#e0e7ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  uploadText: {
    color: "#1d4ed8",
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});

export default LabManagementScreen;
