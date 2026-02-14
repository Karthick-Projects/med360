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

/* Disease → Specialty Mapping */
const diseaseSpecialtyMap: Record<string, string> = {
  Fever: "General",
  Skin: "Dermatology",
  Bone: "Orthopaedics",
  Heart: "Cardiology",
  Diabetes: "Endocrinology",
};

/* Doctor Interface */
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  status: string;
}

const PatientRegistrationScreen = () => {
  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [disease, setDisease] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  /* Auto-generate Patient ID */
  useEffect(() => {
    const id = "PID-" + Math.floor(1000 + Math.random() * 9000);
    setPatientId(id);
  }, []);

  /* Fetch doctors */
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/doctors`);
      const data = await res.json();
      setDoctors(data);
    } catch (error) {
      Alert.alert("Error", "Unable to load doctors");
    }
  };

  /* Filter doctors when disease changes */
  useEffect(() => {
    if (disease) {
      const specialty = diseaseSpecialtyMap[disease];
      const filtered = doctors.filter(
        (doc) =>
          doc.specialty === specialty &&
          doc.status.toLowerCase() === "active"
      );
      setAvailableDoctors(filtered);
      setSelectedDoctor("");
    } else {
      setAvailableDoctors([]);
    }
  }, [disease, doctors]);

  const handleRegister = async () => {
    if (
      !name ||
      !age ||
      !gender ||
      !mobile ||
      !address ||
      !password ||
      !disease ||
      !selectedDoctor
    ) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    try {
      const response = await fetch(
        `${SERVER_URL}/admin/patient-register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId,
            password,
            name,
            age: Number(age),
            dob,
            gender,
            mobile,
            address,
            disease,
            assignedDoctor: selectedDoctor,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.detail || "Registration failed");
        return;
      }

      Alert.alert(
        "Success",
        `Patient registered successfully\nPatient ID: ${patientId}`
      );

      // Reset form
      setName("");
      setAge("");
      setGender("");
      setMobile("");
      setAddress("");
      setPassword("");
      setShowPassword(false);
      setDisease("");
      setSelectedDoctor("");
    } catch (error) {
      Alert.alert("Network Error", "Server not reachable");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Patient Registration</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Patient ID</Text>
        <Text style={styles.patientId}>{patientId}</Text>

        <Text style={styles.label}>Patient Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter full name"
        />

        <Text style={styles.label}>Age *</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholder="Enter age"
        />
        <Text style={styles.label}>DOB *</Text>
        <TextInput
          style={styles.input}
          value={dob}
          onChangeText={setDob}
          placeholder="Enter DOB"
        />

        <Text style={styles.label}>Gender *</Text>
        <TextInput
          style={styles.input}
          value={gender}
          onChangeText={setGender}
          placeholder="Male / Female"
        />

        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          placeholder="Enter mobile number"
        />

        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, styles.addressInput]}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter full address"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Password */}
        <Text style={styles.label}>Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeIcon}>
              {showPassword ? "🙉" : "🙈"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Disease */}
        <Text style={styles.label}>Disease / Reason *</Text>
        {Object.keys(diseaseSpecialtyMap).map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.optionCard,
              disease === item && styles.selectedOption,
            ]}
            onPress={() => setDisease(item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </TouchableOpacity>
        ))}

        {/* Doctors */}
        {availableDoctors.length > 0 && (
          <>
            <Text style={styles.label}>Available Doctors *</Text>
            {availableDoctors.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.optionCard,
                  selectedDoctor === doc.id && styles.selectedOption,
                ]}
                onPress={() => setSelectedDoctor(doc.id)}
              >
                <Text style={styles.optionText}>
                  {doc.name} ({doc.specialty})
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleRegister}
        >
          <Text style={styles.submitText}>Register Patient</Text>
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
    marginBottom: 6,
  },
  patientId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#ffffff",
  },
  addressInput: {
    height: 80,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  optionCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#e0e7ff",
    borderColor: "#2563eb",
  },
  optionText: {
    fontSize: 14,
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

export default PatientRegistrationScreen;
