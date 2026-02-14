import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  // Doctor-specific time slots
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Generate AM/PM slots dynamically
  useEffect(() => {
    if (userType.toLowerCase() === "doctor") {
      const slots: string[] = [];
      for (let hour = startHour; hour < endHour; hour++) {
        const dt = new Date();
        dt.setHours(hour, 0);
        let ampm = hour >= 12 ? "PM" : "AM";
        let hr = hour % 12 || 12;
        slots.push(`${hr}:00 ${ampm}`);
      }
      setTimeSlots(slots);
    } else {
      setTimeSlots([]);
      setSelectedSlots([]);
    }
  }, [userType, startHour, endHour]);

  const toggleSlot = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleSaveUser = () => {
    if (!userType || !userId || !password || !name || !contact) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    // Include doctor slots in payload if user is doctor
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
      payload.timeSlots = selectedSlots;
    }

    // Post to backend
    fetch(`${SERVER_URL}/admin/create-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        Alert.alert("Success", `${userType} registered successfully\nUser ID: ${userId}`);
        // Reset form
        setUserType("");
        setUserId("");
        setPassword("");
        setName("");
        setRoleOrSpec("");
        setContact("");
        setStatus("");
        setSelectedSlots([]);
      })
      .catch((err) => Alert.alert("Error", "Failed to register user"));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>User Master Registration</Text>

      <View style={styles.card}>
        <Text style={styles.label}>User Type *</Text>
        <TextInput
          style={styles.input}
          placeholder="Patient / Doctor / Admin"
          value={userType}
          onChangeText={setUserType}
        />

        <Text style={styles.label}>User ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="PID001 / DID001 / AID001"
          value={userId}
          onChangeText={setUserId}
        />

        <Text style={styles.label}>Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Role / Specialization</Text>
        <TextInput
          style={styles.input}
          placeholder="Doctor specialization / Admin role"
          value={roleOrSpec}
          onChangeText={setRoleOrSpec}
        />

        <Text style={styles.label}>Contact *</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone / Email"
          value={contact}
          onChangeText={setContact}
        />

        <Text style={styles.label}>Account Status</Text>
        <TextInput
          style={styles.input}
          placeholder="Active / Inactive"
          value={status}
          onChangeText={setStatus}
        />

        {/* --- Time Slots Section for Doctor --- */}
        {userType.toLowerCase() === "doctor" && (
          <>
            <Text style={[styles.label, { marginTop: 16 }]}>Available Time Slots</Text>
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
                  <Text
                    style={{
                      color: selectedSlots.includes(slot) ? "#fff" : "#1f2937",
                    }}
                  >
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

});

export default UserMasterRegistrationScreen;
