import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import SERVER_URL from "../../config";

const COLORS = {
  primary: "#2563eb",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  accent: "#EEF2FF",
};

const StaffRegistrationScreen = () => {
  const [staffId, setStaffId] = useState("");
  const [staffName, setStaffName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Nurse");
  const [department, setDepartment] = useState("");
  const [shift, setShift] = useState("Morning");
  const [contactNumber, setContactNumber] = useState("");
  const [availability, setAvailability] = useState("Available");

  const handleSaveStaff = async () => {
    if (!staffId || !staffName || !password || !department || !contactNumber) {
      Alert.alert("Required Fields", "Please complete all fields marked with *");
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
      if (!response.ok) throw new Error(data.detail || "Registration failed");

      Alert.alert("Success", `Staff ID ${data.staffId} registered successfully`);
      resetForm();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const resetForm = () => {
    setStaffId(""); setStaffName(""); setPassword("");
    setDepartment(""); setContactNumber("");
    setShowPassword(false);
  };

  const SelectableChip = ({ label, current, setter }: any) => (
    <TouchableOpacity 
      onPress={() => setter(label)}
      style={[styles.chip, current === label && styles.chipActive]}
    >
      <Text style={[styles.chipText, current === label && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add New Staff</Text>
        <Text style={styles.headerSub}>Create professional credentials</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        {/* CARD 1: ACCOUNT DETAILS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="key-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Account Security</Text>
          </View>

          <Text style={styles.label}>Staff ID *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="id-card-outline" size={18} color={COLORS.textSub} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="e.g. STF-990" 
              value={staffId} 
              onChangeText={setStaffId} 
            />
          </View>

          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSub} style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              placeholder="Min 6 characters" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPassword} 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* CARD 2: PROFESSIONAL INFO */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="user-tie" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Professional Profile</Text>
          </View>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput 
            style={styles.simpleInput} 
            placeholder="John Doe" 
            value={staffName} 
            onChangeText={setStaffName} 
          />

          <Text style={styles.label}>Role *</Text>
          <View style={styles.chipGroup}>
            {["Doctor", "Nurse", "Technician", "Admin"].map(r => (
              <SelectableChip key={r} label={r} current={role} setter={setRole} />
            ))}
          </View>

          <Text style={styles.label}>Department *</Text>
          <TextInput 
            style={styles.simpleInput} 
            placeholder="e.g. Radiology" 
            value={department} 
            onChangeText={setDepartment} 
          />
        </View>

        {/* CARD 3: OPERATIONS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Shift & Contact</Text>
          </View>

          <Text style={styles.label}>Assigned Shift *</Text>
          <View style={styles.chipGroup}>
            {["Morning", "Evening", "Night"].map(s => (
              <SelectableChip key={s} label={s} current={shift} setter={setShift} />
            ))}
          </View>

          <Text style={styles.label}>Contact Number *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color={COLORS.textSub} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="+1 234 567 890" 
              keyboardType="phone-pad" 
              value={contactNumber} 
              onChangeText={setContactNumber} 
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveStaff}>
          <Text style={styles.submitText}>Complete Registration</Text>
          <Ionicons name="person-add-outline" size={20} color="#fff" style={{marginLeft: 10}} />
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textMain },

  label: { fontSize: 12, fontWeight: "700", color: COLORS.textSub, marginTop: 15, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  inputWrapper: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.bg, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  inputIcon: { paddingLeft: 15 },
  input: { flex: 1, height: 50, paddingHorizontal: 12, fontWeight: "600", color: COLORS.textMain },
  simpleInput: { backgroundColor: COLORS.bg, borderRadius: 14, height: 50, paddingHorizontal: 15, fontWeight: "600", color: COLORS.textMain, borderWidth: 1, borderColor: COLORS.border },
  eyeBtn: { paddingRight: 15 },

  chipGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.textSub },
  chipTextActive: { color: "#fff" },

  submitBtn: { 
    backgroundColor: COLORS.primary, 
    height: 60, 
    borderRadius: 20, 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 10,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default StaffRegistrationScreen;