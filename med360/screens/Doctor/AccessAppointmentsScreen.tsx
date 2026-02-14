import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

// Appointment data type
type Appointment = {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  department: string;
  status: "Pending" | "Completed" | "Cancelled";
};

// Dummy appointment database (replace with API)
const APPOINTMENT_DB: Appointment[] = [
  {
    id: "1",
    patientName: "Ramesh Kumar",
    patientId: "PID1023",
    date: "10 Jan 2026",
    time: "10:30 AM",
    department: "General Medicine",
    status: "Pending",
  },
  {
    id: "2",
    patientName: "Suresh B",
    patientId: "PID1045",
    date: "11 Jan 2026",
    time: "11:15 AM",
    department: "Cardiology",
    status: "Completed",
  },
];

const AccessAppointmentsScreen: React.FC = () => {
  const [patientId, setPatientId] = useState("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search appointment logic
  const searchAppointment = () => {
    // Reset previous states
    setError("");
    setAppointment(null);

    // Validation
    if (!patientId.trim()) {
      setError("Please enter Patient ID");
      return;
    }

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const result = APPOINTMENT_DB.find(
        (item) => item.patientId === patientId.trim()
      );

      if (result) {
        setAppointment(result);
      } else {
        setError("No appointment found for this Patient ID");
      }

      setLoading(false);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* Screen Title */}
      <Text style={styles.title}>Access Patient Appointment</Text>
      <Text style={styles.subtitle}>
        Search and view appointment details using Patient ID
      </Text>

      {/* Input Field */}
      <TextInput
        placeholder="Enter Patient ID (e.g., PID1023)"
        style={styles.input}
        value={patientId}
        onChangeText={setPatientId}
        autoCapitalize="characters"
      />

      {/* Search Button */}
      <TouchableOpacity style={styles.button} onPress={searchAppointment}>
        <Text style={styles.buttonText}>Search Appointment</Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#1E3A8A" />}

      {/* Error Message */}
      {error !== "" && <Text style={styles.errorText}>{error}</Text>}

      {/* Appointment Result */}
      {appointment && (
        <View style={styles.card}>
          <Text style={styles.patientName}>
            {appointment.patientName}
          </Text>

          <Text style={styles.info}>
            Patient ID: {appointment.patientId}
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{appointment.date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{appointment.time}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{appointment.department}</Text>
          </View>

          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.statusValue}>{appointment.status}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default AccessAppointmentsScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8FAFC",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#1E3A8A",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  errorText: {
    color: "#DC2626",
    marginBottom: 10,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    elevation: 3,
  },

  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },

  info: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    marginTop: 6,
  },

  label: {
    width: 90,
    fontSize: 14,
    color: "#475569",
  },

  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },

  statusBox: {
    marginTop: 12,
    backgroundColor: "#E0F2FE",
    padding: 10,
    borderRadius: 10,
  },

  statusLabel: {
    fontSize: 12,
    color: "#0369A1",
  },

  statusValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0369A1",
  },
});
