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
  StatusBar,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import SERVER_URL from "../../config";

const COLORS = {
  primary: "#2563eb",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  info: "#0EA5E9",
};

const DoctorDepartmentAssignmentScreen = () => {
  const [admissionId, setAdmissionId] = useState("");
  const [admissionData, setAdmissionData] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [doctorName, setDoctorName] = useState("");
  const [department, setDepartment] = useState("");
  const [doctorRole, setDoctorRole] = useState("");

  const handleAdmissionLookup = async () => {
    if (!admissionId) return Alert.alert("Required", "Enter Admission ID");
    
    setLoading(true);
    try {
      const resAdmission = await fetch(`${SERVER_URL}/admin/admissions/${admissionId}`);
      const admission = await resAdmission.json();

      if (!resAdmission.ok) {
        Alert.alert("Error", admission.detail || "Admission not found");
        setLoading(false);
        return;
      }

      setAdmissionData(admission);

      const resPatient = await fetch(`${SERVER_URL}/admin/get-user/${admission.patientId}`);
      const patient = await resPatient.json();

      if (!resPatient.ok) {
        Alert.alert("Error", patient.detail || "Patient details missing");
      } else {
        setPatientData(patient);
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to fetch details");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!admissionData || !doctorName || !department || !doctorRole) {
      Alert.alert("Validation", "Please complete all assignment fields");
      return;
    }

    try {
const res = await fetch(`${SERVER_URL}/admin/doctor-department-assign`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    admissionId: admissionData.admissionId,
    patientId: admissionData.patientId, // ✅ FIX
    doctorName,
    department,
    doctorRole,
  }),
});

      if (res.ok) {
        Alert.alert("Success", "Doctor assigned successfully");
        setDoctorName("");
        setDepartment("");
        setDoctorRole("");
        setAdmissionId("");
        setAdmissionData(null);
        setPatientData(null);
      }
    } catch (error) {
      Alert.alert("Error", "Assignment failed");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assign Consultant</Text>
        <Text style={styles.headerSub}>Link doctors to active admissions</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        {/* CARD 1: ADMISSION LOOKUP */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SEARCH ADMISSION</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: ADM-123456"
              value={admissionId}
              onChangeText={setAdmissionId}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleAdmissionLookup}>
              {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="search" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>

          {admissionData && patientData && (
            <View style={styles.dataPreview}>
              <View style={styles.patientRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{patientData.name[0]}</Text>
                </View>
                <View>
                    <Text style={styles.pName}>{patientData.name}</Text>
                    <Text style={styles.pInfo}>{patientData.userId} • {patientData.mobile}</Text>
                </View>
              </View>

              <View style={styles.detailGrid}>
                <DetailItem icon="bed" label="Ward" value={admissionData.ward} />
                <DetailItem icon="hospital-user" label="Bed" value={admissionData.bedNumber} isFA />
                <DetailItem icon="alert-circle" label="Type" value={admissionData.admissionType} />
              </View>
            </View>
          )}
        </View>

        {/* CARD 2: ASSIGNMENT DETAILS */}
        <View style={[styles.card, !admissionData && styles.disabled]}>
          <Text style={styles.cardLabel}>ASSIGNMENT DETAILS</Text>
          
          <Text style={styles.fieldLabel}>Consulting Doctor *</Text>
          <View style={styles.inputIconWrapper}>
            <FontAwesome5 name="user-md" size={16} color={COLORS.primary} style={styles.fieldIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Search or Enter Doctor Name"
              value={doctorName}
              onChangeText={setDoctorName}
              editable={!!admissionData}
            />
          </View>

          <Text style={styles.fieldLabel}>Department *</Text>
          <View style={styles.inputIconWrapper}>
            <MaterialCommunityIcons name="office-building" size={18} color={COLORS.primary} style={styles.fieldIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="e.g. Cardiology"
              value={department}
              onChangeText={setDepartment}
              editable={!!admissionData}
            />
          </View>

          <Text style={styles.fieldLabel}>Doctor Role *</Text>
          <View style={styles.chipGroup}>
            {["Lead Consultant", "Assistant", "Resident"].map((role) => (
              <TouchableOpacity
                key={role}
                onPress={() => setDoctorRole(role)}
                style={[styles.chip, doctorRole === role && styles.chipActive]}
                disabled={!admissionData}
              >
                <Text style={[styles.chipText, doctorRole === role && styles.chipTextActive]}>{role}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, !doctorName && styles.submitBtnDisabled]} 
            onPress={handleAssign}
            disabled={!admissionData}
          >
            <Text style={styles.submitText}>Finalize Assignment</Text>
            <Ionicons name="shield-checkmark" size={20} color="#fff" style={{marginLeft: 10}} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const DetailItem = ({ icon, label, value, isFA }: any) => (
  <View style={styles.detailItem}>
    {isFA ? <FontAwesome5 name={icon} size={12} color={COLORS.textSub} /> : <Ionicons name={icon} size={14} color={COLORS.textSub} />}
    <Text style={styles.detailLabel}>{label}: </Text>
    <Text style={styles.detailVal}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 60, paddingHorizontal: 25, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: COLORS.textMain },
  headerSub: { fontSize: 14, color: COLORS.textSub, marginTop: 4 },
  
  scrollBody: { paddingHorizontal: 20, paddingBottom: 40 },
  
  card: { 
    backgroundColor: COLORS.white, 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#64748B",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  disabled: { opacity: 0.6 },
  cardLabel: { fontSize: 11, fontWeight: "800", color: COLORS.textSub, letterSpacing: 1, marginBottom: 15 },
  
  searchContainer: { flexDirection: "row", gap: 10 },
  searchInput: { 
    flex: 1, 
    height: 50, 
    backgroundColor: COLORS.bg, 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    fontWeight: "600",
    color: COLORS.textMain 
  },
  searchBtn: { 
    width: 50, 
    height: 50, 
    backgroundColor: COLORS.primary, 
    borderRadius: 15, 
    justifyContent: "center", 
    alignItems: "center" 
  },

  dataPreview: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  patientRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#E0E7FF", justifyContent: "center", alignItems: "center" },
  avatarText: { color: COLORS.primary, fontSize: 18, fontWeight: "bold" },
  pName: { fontSize: 16, fontWeight: "700", color: COLORS.textMain },
  pInfo: { fontSize: 12, color: COLORS.textSub, marginTop: 2 },
  
  detailGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 15, gap: 15 },
  detailItem: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  detailLabel: { fontSize: 11, color: COLORS.textSub, marginLeft: 5 },
  detailVal: { fontSize: 11, fontWeight: "700", color: COLORS.textMain },

  fieldLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textMain, marginTop: 20, marginBottom: 8 },
  inputIconWrapper: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.bg, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  fieldIcon: { paddingLeft: 15 },
  inputWithIcon: { flex: 1, height: 50, paddingHorizontal: 10, fontWeight: "600", color: COLORS.textMain },

  chipGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 5 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.textSub },
  chipTextActive: { color: "#fff" },

  submitBtn: { 
    backgroundColor: COLORS.primary, 
    height: 55, 
    borderRadius: 18, 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 30,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  submitBtnDisabled: { backgroundColor: COLORS.textSub, elevation: 0 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default DoctorDepartmentAssignmentScreen;