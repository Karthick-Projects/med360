import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import SERVER_URL from "../../config";

const COLORS = {
  primary: "#2563eb",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  accent: "#EFF6FF",
};

const UserMasterRegistrationScreen = () => {
  const [userType, setUserType] = useState("Staff");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [roleOrSpec, setRoleOrSpec] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState("Active");
  const [loading, setLoading] = useState(false);

  // Doctor-specific
  const [startHour] = useState(9);
  const [endHour] = useState(18);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    if (userType === "Doctor") {
      const slots: string[] = [];
      for (let hour = startHour; hour < endHour; hour++) {
        const ampm = hour >= 12 ? "PM" : "AM";
        const hr = hour % 12 || 12;
        slots.push(`${hr}:00 ${ampm}`);
      }
      setTimeSlots(slots);
    } else {
      setTimeSlots([]);
      setSelectedSlots([]);
      setProfilePic(null);
    }
  }, [userType, startHour, endHour]);

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery access is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.5,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0].base64) {
      setProfilePic(result.assets[0].base64);
    }
  };

  const handleSaveUser = async () => {
    if (!userId || !password || !name || !contact) {
      Alert.alert("Validation Error", "Please fill all required fields marked with *");
      return;
    }

    setLoading(true);
    const payload = {
      userType,
      userId,
      password,
      name,
      roleOrSpec,
      contact,
      status,
      ...(userType === "Doctor" && { timeSlots: selectedSlots, profile_pic: profilePic }),
    };

    try {
      const response = await fetch(`${SERVER_URL}/admin/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert("Success", `${userType} registered successfully`);
        resetForm();
      } else {
        throw new Error();
      }
    } catch {
      Alert.alert("Error", "Failed to register user. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUserId(""); setPassword(""); setName(""); setRoleOrSpec("");
    setContact(""); setSelectedSlots([]); setProfilePic(null);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>Register system users and medical staff</Text>
        </View>

        {/* 1. TYPE SELECTION */}
        <View style={styles.card}>
          <Text style={styles.label}>Select User Type</Text>
          <View style={styles.typeRow}>
            {["Staff", "Doctor", "Admin"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, userType === type && styles.typeChipActive]}
                onPress={() => setUserType(type)}
              >
                <Text style={[styles.typeText, userType === type && styles.typeTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. PROFILE IMAGE (ONLY FOR DOCTOR) */}
        {userType === "Doctor" && (
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imageCircle} onPress={pickImage}>
              {profilePic ? (
                <Image source={{ uri: `data:image/jpeg;base64,${profilePic}` }} style={styles.preview} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="camera-outline" size={32} color={COLORS.textSub} />
                  <Text style={styles.placeholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 3. CORE CREDENTIALS */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>User ID *</Text>
              <TextInput style={styles.input} placeholder="ID-2024" value={userId} onChangeText={setUserId} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.textSub} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} />

          <Text style={styles.label}>{userType === "Doctor" ? "Specialization" : "Designation / Role"}</Text>
          <TextInput style={styles.input} placeholder={userType === "Doctor" ? "Cardiology" : "Receptionist"} value={roleOrSpec} onChangeText={setRoleOrSpec} />

          <Text style={styles.label}>Contact Number *</Text>
          <TextInput style={styles.input} keyboardType="phone-pad" value={contact} onChangeText={setContact} />
        </View>

        {/* 4. DOCTOR AVAILABILITY */}
        {userType === "Doctor" && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Available Slots</Text>
            </View>
            <View style={styles.slotContainer}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slot, selectedSlots.includes(slot) && styles.slotSelected]}
                  onPress={() => toggleSlot(slot)}
                >
                  <Text style={[styles.slotText, selectedSlots.includes(slot) && styles.slotTextSelected]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveUser} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.submitText}>Complete Registration</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
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

  label: { fontSize: 12, fontWeight: "800", color: COLORS.textSub, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { 
    height: 52, 
    backgroundColor: COLORS.bg, 
    borderRadius: 14, 
    paddingHorizontal: 15, 
    fontWeight: "600", 
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  row: { flexDirection: "row" },

  typeRow: { flexDirection: "row", gap: 10 },
  typeChip: { 
    flex: 1, 
    height: 45, 
    borderRadius: 12, 
    backgroundColor: COLORS.bg, 
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border
  },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeText: { fontWeight: "700", color: COLORS.textSub },
  typeTextActive: { color: "#fff" },

  passwordContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.bg, 
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border 
  },
  passwordInput: { flex: 1, height: 52, paddingHorizontal: 15, fontWeight: "600" },
  eyeBtn: { paddingHorizontal: 12 },

  imageSection: { alignItems: "center", marginVertical: 10 },
  imageCircle: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    backgroundColor: COLORS.white, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    elevation: 3
  },
  preview: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center" },
  placeholderText: { fontSize: 10, fontWeight: "700", color: COLORS.textSub, marginTop: 4 },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textMain },
  slotContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slot: { 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 10, 
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border 
  },
  slotSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotText: { fontSize: 12, fontWeight: "700", color: COLORS.textSub },
  slotTextSelected: { color: "#fff" },

  submitBtn: { 
    backgroundColor: COLORS.primary, 
    height: 60, 
    borderRadius: 20, 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 10,
    gap: 10,
    elevation: 5
  },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default UserMasterRegistrationScreen;