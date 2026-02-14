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
import { Ionicons } from "@expo/vector-icons"; // for eye icon
import SERVER_URL from "../../config"; // your server URL

const StaffRegistrationScreen = () => {
  const [staffId, setStaffId] = useState("");
  const [staffName, setStaffName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [shift, setShift] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [availability, setAvailability] = useState("");

  /* Validation & Save */
  const handleSaveStaff = async () => {
    if (
      !staffId ||
      !staffName ||
      !password ||
      !role ||
      !department ||
      !shift ||
      !contactNumber
    ) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/admin/staff-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          name: staffName,
          password,
          role,
          department,
          shift,
          contactNumber,
          availability,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.detail || "Failed to register staff");
        return;
      }

      Alert.alert("Success", `Staff registered successfully\nID: ${data.staffId}`);

      // Reset form
      setStaffId("");
      setStaffName("");
      setPassword("");
      setRole("");
      setDepartment("");
      setShift("");
      setContactNumber("");
      setAvailability("");
      setShowPassword(false);

    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Unable to register staff");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Staff Registration</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Staff ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Staff ID"
          value={staffId}
          onChangeText={setStaffId}
        />

        <Text style={styles.label}>Staff Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Full name"
          value={staffName}
          onChangeText={setStaffName}
        />

        <Text style={styles.label}>Password *</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeIcon}>
              {showPassword ? "🙉" : "🙈"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Role *</Text>
        <TextInput
          style={styles.input}
          placeholder="Doctor / Nurse / Technician / Admin"
          value={role}
          onChangeText={setRole}
        />

        <Text style={styles.label}>Department *</Text>
        <TextInput
          style={styles.input}
          placeholder="Assigned department"
          value={department}
          onChangeText={setDepartment}
        />

        <Text style={styles.label}>Shift *</Text>
        <TextInput
          style={styles.input}
          placeholder="Morning / Evening / Night"
          value={shift}
          onChangeText={setShift}
        />

        <Text style={styles.label}>Contact Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={setContactNumber}
        />

        <Text style={styles.label}>Availability</Text>
        <TextInput
          style={styles.input}
          placeholder="Available / On Leave"
          value={availability}
          onChangeText={setAvailability}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveStaff}>
          <Text style={styles.submitText}>Register Staff</Text>
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
  passwordWrapper: { flexDirection: "row", alignItems: "center" },
  submitBtn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 20 },
  submitText: { color: "#ffffff", fontWeight: "700" },
    eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
});

export default StaffRegistrationScreen;
