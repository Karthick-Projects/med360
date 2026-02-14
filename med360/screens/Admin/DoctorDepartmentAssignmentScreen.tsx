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
import SERVER_URL from "../../config";

const DoctorDepartmentAssignmentScreen = () => {
  const [admissionId, setAdmissionId] = useState("");
  const [admissionData, setAdmissionData] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);

  const [doctorName, setDoctorName] = useState("");
  const [department, setDepartment] = useState("");
  const [doctorRole, setDoctorRole] = useState("");

  /* Fetch Admission + Patient Details */
  const handleAdmissionLookup = async () => {
    if (!admissionId) {
      Alert.alert("Error", "Enter Admission ID");
      return;
    }

    try {
      // 1️⃣ Fetch admission by ID
      const resAdmission = await fetch(`${SERVER_URL}/admin/admissions/${admissionId}`);
      const admission = await resAdmission.json();
      console.log(admission)
      if (!resAdmission.ok) {
        Alert.alert("Error", admission.detail || "Admission not found");
        return;
      }

      setAdmissionData(admission);

      // 2️⃣ Fetch patient by patientId from admission
      const resPatient = await fetch(`${SERVER_URL}/admin/get-user/${admission.patientId}`);

      const patient = await resPatient.json();

      if (!resPatient.ok) {
        Alert.alert("Error", patient.detail || "Patient not found");
        return;
      }

      setPatientData(patient);
      Alert.alert("Success", "Admission & Patient details loaded");

    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Unable to fetch details");
    }
  };

  /* Assign Doctor */
  const handleAssign = async () => {
    if (!admissionData || !patientData || !doctorName || !department || !doctorRole) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/admin/doctor-department-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionId: admissionData.admissionId,
          patientId: patientData.userId,
          doctorName,
          department,
          doctorRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Failed to assign doctor");
        return;
      }

      Alert.alert("Success", "Doctor assigned successfully");

      // Reset form
      setDoctorName("");
      setDepartment("");
      setDoctorRole("");
      setAdmissionId("");
      setAdmissionData(null);
      setPatientData(null);

    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Unable to assign doctor");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Doctor & Department Assignment</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Admission ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Admission ID"
          value={admissionId}
          onChangeText={setAdmissionId}
        />

        <TouchableOpacity
          style={styles.lookupBtn}
          onPress={handleAdmissionLookup}
        >
          <Text style={styles.lookupText}>Fetch Patient</Text>
        </TouchableOpacity>

        {/* Show Admission + Patient info */}
        {(admissionData || patientData) && (
          <View style={styles.infoBox}>
            {admissionData && (
              <>
                <Text style={styles.infoTitle}>Admission Info</Text>
                <Text>Admission ID: {admissionData.admissionId}</Text>
                <Text>Ward: {admissionData.ward}</Text>
                <Text>Bed Number: {admissionData.bedNumber}</Text>
                <Text>Type: {admissionData.admissionType}</Text>
                <Text>Date: {admissionData.admissionDateTime}</Text>
              </>
            )}

            {patientData && (
              <>
                <Text style={styles.infoTitle}>Patient Info</Text>
                <Text>Patient ID: {patientData.userId}</Text>
                <Text>Name: {patientData.name}</Text>
                <Text>Contact: {patientData.mobile}</Text>
                <Text>Status: {patientData.status}</Text>
              </>
            )}
          </View>
        )}

        <Text style={styles.label}>Doctor Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter doctor name"
          value={doctorName}
          onChangeText={setDoctorName}
        />

        <Text style={styles.label}>Department *</Text>
        <TextInput
          style={styles.input}
          placeholder="General / Ortho / Cardiology"
          value={department}
          onChangeText={setDepartment}
        />

        <Text style={styles.label}>Doctor Role *</Text>
        <TextInput
          style={styles.input}
          placeholder="Consultant / Assistant"
          value={doctorRole}
          onChangeText={setDoctorRole}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleAssign}>
          <Text style={styles.submitText}>Assign Doctor</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fa", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 14 },
  card: { backgroundColor: "#ffffff", borderRadius: 18, padding: 16, elevation: 3 },
  label: { fontSize: 13, color: "#6b7280", marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12, backgroundColor: "#ffffff" },
  lookupBtn: { backgroundColor: "#e0e7ff", padding: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  lookupText: { color: "#1d4ed8", fontWeight: "600" },
  patientName: { marginTop: 10, fontSize: 14, fontWeight: "600", color: "#065f46" },
  infoBox: { backgroundColor: "#f0f9ff", padding: 12, borderRadius: 12, marginTop: 12 },
  infoTitle: { fontWeight: "700", marginBottom: 4 },
  submitBtn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 20 },
  submitText: { color: "#ffffff", fontWeight: "700" },
});

export default DoctorDepartmentAssignmentScreen;
