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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import SERVER_URL from "../../config";

const UserMasterRegistrationScreen = () => {
  const [userType, setUserType] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [roleOrSpec, setRoleOrSpec] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState("");

  // Doctor-specific
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Generate time slots
  useEffect(() => {
    if (userType.toLowerCase() === "doctor") {
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

  // 📸 Pick Image (Doctor only)
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery access is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.4,
    });

    if (!result.canceled && result.assets[0].base64) {
      setProfilePic(result.assets[0].base64);
    }
  };

  const handleSaveUser = () => {
    if (!userType || !userId || !password || !name || !contact) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    const payload: any = {
      userType,
      userId,
      password,
      name,
      roleOrSpec,
      contact,
      status,
    };

    if (userType.toLowerCase() === "doctor") {
      if (selectedSlots.length === 0) {
        Alert.alert("Validation Error", "Select at least one time slot");
        return;
      }
      payload.timeSlots = selectedSlots;
      payload.profile_pic = profilePic;
    }

    fetch(`${SERVER_URL}/admin/create-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        Alert.alert("Success", `${userType} registered successfully`);
        setUserType("");
        setUserId("");
        setPassword("");
        setName("");
        setRoleOrSpec("");
        setContact("");
        setStatus("");
        setSelectedSlots([]);
        setProfilePic(null);
      })
      .catch(() => Alert.alert("Error", "Failed to register user"));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>User Master Registration</Text>

      <View style={styles.card}>
        <Text style={styles.label}>User Type *</Text>
        <TextInput style={styles.input} value={userType} onChangeText={setUserType} />

        <Text style={styles.label}>User ID *</Text>
        <TextInput style={styles.input} value={userId} onChangeText={setUserId} />

        <Text style={styles.label}>Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Role / Specialization</Text>
        <TextInput style={styles.input} value={roleOrSpec} onChangeText={setRoleOrSpec} />

        <Text style={styles.label}>Contact *</Text>
        <TextInput style={styles.input} value={contact} onChangeText={setContact} />

        <Text style={styles.label}>Status</Text>
        <TextInput style={styles.input} value={status} onChangeText={setStatus} />

        {/* Doctor Section */}
        {userType.toLowerCase() === "doctor" && (
          <>
            <Text style={styles.label}>Profile Picture</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              <Text style={styles.uploadText}>Upload Photo</Text>
            </TouchableOpacity>

            {profilePic && (
              <Image
                source={{ uri: `data:image/jpeg;base64,${profilePic}` }}
                style={styles.preview}
              />
            )}

            <Text style={styles.label}>Available Time Slots</Text>
            <View style={styles.slotContainer}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slot,
                    selectedSlots.includes(slot) && styles.slotSelected,
                  ]}
                  onPress={() => toggleSlot(slot)}
                >
                  <Text style={{ color: selectedSlots.includes(slot) ? "#fff" : "#000" }}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveUser}>
          <Text style={styles.submitText}>Register User</Text>
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },

  passwordInput: {
    flex: 1,
    padding: 12,
  },

  eyeIcon: {
    paddingHorizontal: 12,
  },
  slotContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },

  slot: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },

  slotSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  slotText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
  },

  slotTextSelected: {
    color: "#ffffff",
  },
uploadBtn: {
  backgroundColor: "#2563eb",
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
},

uploadText: {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: "600",
},

preview: {
  width: 120,
  height: 120,
  borderRadius: 60,
  alignSelf: "center",
  marginTop: 10,
  marginBottom: 16,
  borderWidth: 2,
  borderColor: "#e5e7eb",
  backgroundColor: "#f3f4f6",
},

});

export default UserMasterRegistrationScreen;
