import React, { useEffect, useState } from "react";
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

/* Disease → Specialty Mapping */
const diseaseSpecialtyMap: Record<string, string> = {
  Fever: "General",
  Skin: "Dermatology",
  Bone: "Orthopaedics",
  Heart: "Cardiology",
  Diabetes: "Endocrinology",
};

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  status: string;
}

const COLORS = {
  primary: "#2563EB",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  accent: "#EFF6FF",
  success: "#10B981",
};

const PatientRegistrationScreen = () => {
  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [disease, setDisease] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-generate Patient ID
  useEffect(() => {
    const id = "PID-" + Math.floor(1000 + Math.random() * 9000);
    setPatientId(id);
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/doctors/`);
      const data = await res.json();
      setDoctors(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // Filter logic
  useEffect(() => {
    if (disease) {
      const specialty = diseaseSpecialtyMap[disease];
      const filtered = doctors.filter(
        (doc) => doc.specialty === specialty && doc.status.toLowerCase() === "active"
      );
      setAvailableDoctors(filtered);
      setSelectedDoctor("");
    }
  }, [disease, doctors]);

  const handleRegister = async () => {
    if (!name || !age || !mobile || !password || !disease || !selectedDoctor) {
      Alert.alert("Missing Information", "Please complete all required fields marked with *");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/admin/patient-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId, password, name, age: Number(age), dob, gender, mobile, address, disease,
          assignedDoctor: selectedDoctor,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", `Patient ${name} registered successfully.`);
        resetForm();
      } else {
        const err = await response.json();
        Alert.alert("Error", err.detail || "Registration failed");
      }
    } catch {
      Alert.alert("Network Error", "Could not connect to medical server");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(""); setAge(""); setDob(""); setMobile(""); setAddress("");
    setPassword(""); setDisease(""); setSelectedDoctor("");
    setPatientId("PID-" + Math.floor(1000 + Math.random() * 9000));
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        <View style={styles.header}>
          <Text style={styles.title}>New Enrollment</Text>
          <Text style={styles.subtitle}>Patient ID: <Text style={styles.idText}>{patientId}</Text></Text>
        </View>

        {/* SECTION 1: PERSONAL INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>BIOGRAPHIC DATA</Text>
          
          <Text style={styles.label}>Patient Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full legal name" />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Age *</Text>
              <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="e.g. 25" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.genderRow}>
                {["Male", "Female"].map((g) => (
                  <TouchableOpacity 
                    key={g} 
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]} 
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" placeholder="Contact number" />
        </View>

        {/* SECTION 2: SECURITY */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>PORTAL ACCESS</Text>
          <Text style={styles.label}>Account Password *</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Min. 6 characters"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textSub} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 3: CLINICAL ASSIGNMENT */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>CONSULTATION DETAILS</Text>
          
          <Text style={styles.label}>Chief Complaint / Disease *</Text>
          <View style={styles.optionGrid}>
            {Object.keys(diseaseSpecialtyMap).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, disease === item && styles.chipActive]}
                onPress={() => setDisease(item)}
              >
                <Text style={[styles.chipText, disease === item && styles.chipActiveText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {disease ? (
            <View style={styles.doctorSection}>
              <Text style={styles.label}>Assigned Doctor *</Text>
              {availableDoctors.length > 0 ? (
                availableDoctors.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={[styles.docCard, selectedDoctor === doc.id && styles.docCardActive]}
                    onPress={() => setSelectedDoctor(doc.id)}
                  >
                    <MaterialCommunityIcons 
                      name="doctor" 
                      size={20} 
                      color={selectedDoctor === doc.id ? COLORS.primary : COLORS.textSub} 
                    />
                    <Text style={[styles.docName, selectedDoctor === doc.id && styles.docNameActive]}>
                      Dr. {doc.name}
                    </Text>
                    {selectedDoctor === doc.id && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyNotice}>
                  <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
                  <Text style={styles.emptyText}>No active {diseaseSpecialtyMap[disease]} doctors found.</Text>
                </View>
              )}
            </View>
          ) : null}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitText}>Complete Registration</Text>
              <Ionicons name="person-add-outline" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollBody: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 25 },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.textMain },
  subtitle: { fontSize: 14, color: COLORS.textSub, marginTop: 4 },
  idText: { color: COLORS.primary, fontWeight: "bold" },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: COLORS.textSub, letterSpacing: 1, marginBottom: 15 },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.textMain, marginBottom: 8 },
  
  input: { 
    height: 50, backgroundColor: COLORS.bg, borderRadius: 12, 
    paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.textMain, fontWeight: "600" 
  },
  row: { flexDirection: "row", marginBottom: 5 },

  genderRow: { flexDirection: "row", backgroundColor: COLORS.bg, borderRadius: 12, padding: 4, height: 50 },
  genderBtn: { flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 8 },
  genderBtnActive: { backgroundColor: COLORS.white, elevation: 2 },
  genderText: { fontWeight: "700", color: COLORS.textSub },
  genderTextActive: { color: COLORS.primary },

  passwordWrapper: { 
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.bg, 
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border 
  },
  passwordInput: { flex: 1, height: 50, paddingHorizontal: 15, fontWeight: "600" },
  eyeBtn: { paddingHorizontal: 12 },

  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  chip: { 
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, 
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border 
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: "700", color: COLORS.textSub },
  chipActiveText: { color: "#fff" },

  doctorSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 15 },
  docCard: { 
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.bg, 
    padding: 15, borderRadius: 15, marginBottom: 10, gap: 12 
  },
  docCardActive: { backgroundColor: COLORS.accent, borderWidth: 1, borderColor: COLORS.primary },
  docName: { flex: 1, fontSize: 14, fontWeight: "700", color: COLORS.textMain },
  docNameActive: { color: COLORS.primary },
  
  emptyNotice: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  emptyText: { fontSize: 13, color: "#92400E", fontWeight: "600" },

  submitBtn: { 
    backgroundColor: COLORS.primary, height: 60, borderRadius: 20, 
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 
  },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});

export default PatientRegistrationScreen;