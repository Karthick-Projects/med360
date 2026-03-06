import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import SERVER_URL from "../../config";

// UI Theme Constants
const PRIMARY_TEAL = "#00A896";
const PRIMARY_DARK = "#0F172A";
const LIGHT_BG = "#F8FAFC";
const BORDER_COLOR = "#E2E8F0";
const SLATE_GRAY = "#64748B";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  startTime?: string;
  endTime?: string;
};

const specialties = ["All", "Cardiology", "Dermatology", "Neurology", "Pediatrics"];

const BookNewAppointmentScreen: React.FC = () => {
  const navigation = useNavigation();

  // Data & Loading
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Selections
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(Platform.OS === "ios");

  // Availability & Registration
  const [filled, setFilled] = useState(0);
  const [remaining, setRemaining] = useState(25);
  const [reason, setReason] = useState("");
  const [mobilenumber, setMobileNumber] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);

  const availableDoctors = selectedSpecialty === "All"
    ? doctors
    : doctors.filter((d) => d.specialty === selectedSpecialty);

  useEffect(() => {
    AsyncStorage.getItem("PATIENT_ID").then((id) => setPatientId(id));
    fetchDoctors();
  }, []);

  // Triggered whenever Doctor or Date changes
  useEffect(() => {
    if (selectedDoctor) {
      fetchStatus();
    }
  }, [selectedDoctor, date]);

  const fetchDoctors = async () => {
    try {
      setLoadingDocs(true);
      const res = await fetch(`${SERVER_URL}/doctors/`);
      const data = await res.json();
      
      // Map data and ensure time strings exist (Fallback to 12PM-5PM if missing)
      const mapped = data.map((d: any) => ({
        ...d,
        startTime: d.startTime || "12:00 PM",
        endTime: d.endTime || "05:00 PM"
      }));
      setDoctors(mapped);
    } catch (err) {
      Alert.alert("Error", "Could not load doctors.");
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchStatus = async () => {
    setLoadingSlots(true);
    const dateStr = date.toISOString().split("T")[0];
    try {
      const res = await fetch(
        `${SERVER_URL}/appointments/doctor/${selectedDoctor?.id}/registrations?date=${dateStr}`
      );
      const data = await res.json();
      setFilled(data.filled || 0);
      setRemaining(data.remaining || 25);
    } catch (err) {
      console.log("Error fetching tokens:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !reason || !mobilenumber) {
      Alert.alert("Required", "Please complete all fields.");
      return;
    }

    const appointmentData = {
      patient_id: patientId,
      doctor_id: selectedDoctor.id,
      date: date.toISOString().split("T")[0],
      reason,
      mobilenumber,
      status: "Pending",
    };

    try {
      const res = await fetch(`${SERVER_URL}/appointments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (res.ok) {
        Alert.alert("Success", "Appointment Request Submitted", [
          { text: "View Bookings", onPress: () => navigation.goBack() }
        ]);
      } else {
        const data = await res.json();
        Alert.alert("Booking Error", data.detail || "Unable to book.");
      }
    } catch {
      Alert.alert("Server Error", "Please try again later.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 1. Specialties */}
        <Text style={styles.label}>1. Choose Specialty</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {specialties.map((spec) => (
            <TouchableOpacity
              key={spec}
              style={[styles.chip, selectedSpecialty === spec && styles.chipSelected]}
              onPress={() => {
                setSelectedSpecialty(spec);
                setSelectedDoctor(null);
              }}
            >
              <Text style={[styles.chipText, selectedSpecialty === spec && { color: "#fff" }]}>{spec}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 2. Doctor List */}
        <Text style={styles.label}>2. Select Doctor</Text>
        {loadingDocs ? <ActivityIndicator color={PRIMARY_TEAL} /> : availableDoctors.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={[styles.docCard, selectedDoctor?.id === doc.id && styles.docSelected]}
            onPress={() => setSelectedDoctor(doc)}
          >
            <View style={styles.avatar}><Ionicons name="person" size={20} color={PRIMARY_TEAL} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docName}>Dr. {doc.name}</Text>
              <Text style={styles.docSub}>{doc.specialty}</Text>
            </View>
            {selectedDoctor?.id === doc.id && <Ionicons name="checkmark-circle" size={24} color={PRIMARY_TEAL} />}
          </TouchableOpacity>
        ))}

        {/* 3. Schedule & Availability */}
        <Text style={styles.label}>3. Date & Available Tokens</Text>
        
        {/* Consultation Time Card */}
        {selectedDoctor && (
          <View style={styles.timeBanner}>
            <Ionicons name="time" size={20} color={PRIMARY_TEAL} />
            <Text style={styles.timeText}>Consultation Time: </Text>
            <Text style={styles.timeBold}>{selectedDoctor.startTime} - {selectedDoctor.endTime}</Text>
          </View>
        )}

        {/* Calendar Selection */}
        <View style={styles.calendarCard}>
          {Platform.OS === "android" && (
            <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowPicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={PRIMARY_TEAL} />
              <Text style={styles.dateBtnText}>{date.toDateString()}</Text>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          )}
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              minimumDate={new Date()}
              maximumDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)}
              onChange={onDateChange}
              accentColor={PRIMARY_TEAL}
            />
          )}
        </View>

        {/* Tokens Available Visualizer */}
        {selectedDoctor && (
          <View style={styles.tokenContainer}>
            <View style={styles.tokenHeader}>
              <Text style={styles.tokenTitle}>Token Availability</Text>
              <Text style={[styles.tokenCount, remaining < 5 && { color: "#EF4444" }]}>
                {remaining} of 25 Available
              </Text>
            </View>

            {loadingSlots ? <ActivityIndicator color={PRIMARY_TEAL} /> : (
              <View style={styles.grid}>
                {Array.from({ length: 25 }).map((_, i) => (
                  <View 
                    key={i} 
                    style={[styles.dot, i < filled ? styles.dotFilled : styles.dotEmpty]} 
                  />
                ))}
              </View>
            )}
            <Text style={styles.note}>Sequence tokens are assigned automatically upon booking.</Text>
          </View>
        )}

        {/* 4. Details */}
        <Text style={styles.label}>4. Patient Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          keyboardType="phone-pad"
          value={mobilenumber}
          onChangeText={setMobileNumber}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your health problem..."
          multiline
          value={reason}
          onChangeText={setReason}
        />

        <TouchableOpacity 
          style={[styles.bookBtn, (remaining <= 0 || !selectedDoctor) && styles.disabledBtn]} 
          onPress={handleBooking}
          disabled={remaining <= 0}
        >
          <Text style={styles.bookBtnText}>
            {remaining <= 0 ? "No Tokens Available" : "Confirm Appointment"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_BG },
  header: { padding: 20, paddingTop: 60, backgroundColor: PRIMARY_TEAL, flexDirection: "row", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginLeft: 15 },
  content: { padding: 20, paddingBottom: 60 },
  label: { fontSize: 16, fontWeight: "700", color: PRIMARY_DARK, marginVertical: 12 },
  
  // Specialty Chips
  row: { marginBottom: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, backgroundColor: "#fff", marginRight: 10, borderWidth: 1, borderColor: BORDER_COLOR },
  chipSelected: { backgroundColor: PRIMARY_TEAL, borderColor: PRIMARY_TEAL },
  chipText: { fontSize: 14, color: SLATE_GRAY, fontWeight: "600" },

  // Doctor Cards
  docCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: BORDER_COLOR },
  docSelected: { borderColor: PRIMARY_TEAL, backgroundColor: "#F0FDFA" },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E6F6F4", alignItems: "center", justifyContent: "center", marginRight: 15 },
  docName: { fontSize: 16, fontWeight: "bold", color: PRIMARY_DARK },
  docSub: { fontSize: 13, color: SLATE_GRAY },

  // Consultation Time
  timeBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#E6F6F4", padding: 12, borderRadius: 12, marginBottom: 10 },
  timeText: { marginLeft: 8, fontSize: 14, color: SLATE_GRAY },
  timeBold: { fontSize: 14, fontWeight: "bold", color: PRIMARY_TEAL },

  // Calendar
  calendarCard: { backgroundColor: "#fff", borderRadius: 15, padding: 10, marginBottom: 15, borderWidth: 1, borderColor: BORDER_COLOR },
  datePickerBtn: { flexDirection: "row", alignItems: "center", padding: 10 },
  dateBtnText: { flex: 1, marginLeft: 10, fontSize: 16, color: PRIMARY_DARK },
  changeLink: { color: PRIMARY_TEAL, fontWeight: "bold" },

  // Token Visualizer
  tokenContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 15, borderWidth: 1, borderColor: BORDER_COLOR, marginBottom: 20 },
  tokenHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  tokenTitle: { fontWeight: "bold", color: PRIMARY_DARK },
  tokenCount: { fontWeight: "bold", color: PRIMARY_TEAL },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 12 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  dotFilled: { backgroundColor: "#E2E8F0" },
  dotEmpty: { backgroundColor: PRIMARY_TEAL },
  note: { fontSize: 11, color: SLATE_GRAY, fontStyle: "italic" },

  // Form & Button
  input: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: BORDER_COLOR, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: "top" },
  bookBtn: { backgroundColor: PRIMARY_TEAL, padding: 18, borderRadius: 15, alignItems: "center", marginTop: 10 },
  disabledBtn: { backgroundColor: "#CBD5E1" },
  bookBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default BookNewAppointmentScreen;