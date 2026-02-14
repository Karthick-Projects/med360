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

const DoctorExperienceScreen = () => {
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [achievements, setAchievements] = useState("");
  const [workHistory, setWorkHistory] = useState("");

  /* Dummy Doctor Lookup */
  const handleDoctorLookup = () => {
    if (!doctorId) {
      Alert.alert("Error", "Enter Doctor ID");
      return;
    }

    // Dummy data (API later)
    setDoctorName("Dr. Suresh Kumar");
    setQualification("MBBS, MD");
    setSpecialization("Cardiology");
    setExperience("12");
    setAchievements("Best Cardiologist Award 2022");
    setWorkHistory("Apollo Hospital, Chennai");

    Alert.alert("Doctor Found", "Doctor profile loaded");
  };

  /* Validation & Save */
  const handleSaveProfile = () => {
    if (
      !doctorId ||
      !doctorName ||
      !qualification ||
      !specialization ||
      !experience
    ) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    Alert.alert("Success", "Doctor profile saved successfully");

    // Reset
    setDoctorId("");
    setDoctorName("");
    setQualification("");
    setSpecialization("");
    setExperience("");
    setAchievements("");
    setWorkHistory("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Doctor Experience & Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Doctor ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Doctor ID"
          value={doctorId}
          onChangeText={setDoctorId}
        />

        <TouchableOpacity style={styles.lookupBtn} onPress={handleDoctorLookup}>
          <Text style={styles.lookupText}>Fetch Doctor Details</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Doctor Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Doctor full name"
          value={doctorName}
          onChangeText={setDoctorName}
        />

        <Text style={styles.label}>Qualification *</Text>
        <TextInput
          style={styles.input}
          placeholder="MBBS, MD, MS..."
          value={qualification}
          onChangeText={setQualification}
        />

        <Text style={styles.label}>Specialization *</Text>
        <TextInput
          style={styles.input}
          placeholder="Cardiology, Ortho, Neurology..."
          value={specialization}
          onChangeText={setSpecialization}
        />

        <Text style={styles.label}>Years of Experience *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter years"
          keyboardType="numeric"
          value={experience}
          onChangeText={setExperience}
        />

        <Text style={styles.label}>Achievements</Text>
        <TextInput
          style={styles.input}
          placeholder="Awards, recognitions"
          value={achievements}
          onChangeText={setAchievements}
        />

        <Text style={styles.label}>Work History</Text>
        <TextInput
          style={styles.input}
          placeholder="Previous hospitals / clinics"
          value={workHistory}
          onChangeText={setWorkHistory}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveProfile}>
          <Text style={styles.submitText}>Save Doctor Profile</Text>
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
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 4,
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

export default DoctorExperienceScreen;
