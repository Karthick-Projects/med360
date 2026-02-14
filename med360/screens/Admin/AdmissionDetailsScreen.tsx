import React, { useEffect, useState } from "react";
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

const AdmissionDetailsScreen = () => {
  const [admissionId, setAdmissionId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState<any>(null);

  const [ward, setWard] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [admissionType, setAdmissionType] = useState("");
  const [admissionDateTime, setAdmissionDateTime] = useState("");

  /* Auto-generate Admission ID */
  useEffect(() => {
    setAdmissionId("ADM-" + Math.floor(100000 + Math.random() * 900000));
    setAdmissionDateTime(new Date().toLocaleString());
  }, []);

  /* Fetch Patient */
  const handlePatientLookup = async () => {
    if (!patientId) {
      Alert.alert("Error", "Enter Patient ID");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/admin/${patientId}`);
      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Patient not found");
        setPatient(null);
        return;
      }

      setPatient(data);
    } catch (error) {
      Alert.alert("Network Error", "Unable to fetch patient");
    }
  };

  /* Save Admission */
const handleSaveAdmission = async () => {
  if (!patient || !ward || !bedNumber || !admissionType) {
    Alert.alert("Validation Error", "Please fill all required fields");
    return;
  }

  try {
    const res = await fetch(`${SERVER_URL}/admin/admission-create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient.patientId,
        admissionType,
        ward,
        bedNumber
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      Alert.alert("Error", data.detail || "Failed to create admission");
      return;
    }

    Alert.alert(
      "Success",
      `Patient admitted successfully\nAdmission ID: ${data.admissionId}`
    );

    // Reset form (keep patient search optional)
    setPatientId("");
    setPatient(null);
    setWard("");
    setBedNumber("");
    setAdmissionType("");

  } catch (error) {
    console.error(error);
    Alert.alert("Network Error", "Unable to save admission");
  }
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admission Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Admission ID</Text>
        <Text style={styles.highlight}>{admissionId}</Text>

        <Text style={styles.label}>Patient ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Patient ID"
          value={patientId}
          onChangeText={setPatientId}
        />

        <TouchableOpacity style={styles.lookupBtn} onPress={handlePatientLookup}>
          <Text style={styles.lookupText}>Fetch Patient Details</Text>
        </TouchableOpacity>

        {/* Patient Details Box */}
        {patient && (
          <View style={styles.patientBox}>
            <Text style={styles.patientTitle}>Patient Details</Text>

            <Text style={styles.patientRow}>
              <Text style={styles.patientLabel}>Name: </Text>
              {patient.name}
            </Text>

            <Text style={styles.patientRow}>
              <Text style={styles.patientLabel}>Age: </Text>
              {patient.age}
            </Text>

            <Text style={styles.patientRow}>
              <Text style={styles.patientLabel}>Gender: </Text>
              {patient.gender}
            </Text>

            <Text style={styles.patientRow}>
              <Text style={styles.patientLabel}>Mobile: </Text>
              {patient.mobile}
            </Text>

            <Text style={styles.patientRow}>
              <Text style={styles.patientLabel}>Disease: </Text>
              {patient.disease}
            </Text>

            <Text style={styles.patientRow}>
              <Text style={styles.patientLabel}>Doctor: </Text>
              {patient.assignedDoctor}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Admission Type *</Text>
        <TextInput
          style={styles.input}
          placeholder="Emergency / OP to IP"
          value={admissionType}
          onChangeText={setAdmissionType}
        />

        <Text style={styles.label}>Ward *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ward name / number"
          value={ward}
          onChangeText={setWard}
        />

        <Text style={styles.label}>Bed Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter bed number"
          keyboardType="numeric"
          value={bedNumber}
          onChangeText={setBedNumber}
        />

        <Text style={styles.label}>Admission Date & Time</Text>
        <Text style={styles.readonly}>{admissionDateTime}</Text>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveAdmission}>
          <Text style={styles.submitText}>Confirm Admission</Text>
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
    backgroundColor: "#ff2ffff",
    borderRadius: 18,
    padding: 16,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 4,
  },
  highlight: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#ffffff",
  },
  lookupBtn: {
    backgroundColor: "#e0e7ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  lookupText: {
    color: "#1d4ed8",
    fontWeight: "600",
  },
  patientBox: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  patientTitle: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#065f46",
  },
  patientRow: {
    fontSize: 14,
    marginBottom: 2,
  },
  patientLabel: {
    fontWeight: "600",
  },
  readonly: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    color: "#374151",
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

export default AdmissionDetailsScreen;