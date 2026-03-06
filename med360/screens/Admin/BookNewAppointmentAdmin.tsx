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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import SERVER_URL from "../../config";

// UI Theme Constants
const PRIMARY_TEAL = "#00A896";
const EMERGENCY_RED = "#DC2626";
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

const BookNewAppointmentAdmin: React.FC = () => {
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
  const [isEmergency, setIsEmergency] = useState(false);

  // Availability & Registration
  const [filled, setFilled] = useState(0);
  const [reason, setReason] = useState("");
  const [mobilenumber, setMobileNumber] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);

  const MAX_STANDARD = 25;
  const MAX_TOTAL = 30; 
  const currentMax = isEmergency ? MAX_TOTAL : MAX_STANDARD;
  const remaining = currentMax - filled;

  const availableDoctors = selectedSpecialty === "All"
    ? doctors
    : doctors.filter((d) => d.specialty === selectedSpecialty);

  // --- TIME EXPIRY HELPER ---
  const isConsultationOver = (doc: Doctor, selectedDate: Date) => {
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (isToday && doc.endTime) {
      try {
        const [time, modifier] = doc.endTime.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const endThreshold = new Date();
        endThreshold.setHours(hours, minutes, 0, 0);

        return now > endThreshold;
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  const isExpired = selectedDoctor ? isConsultationOver(selectedDoctor, date) : false;

  useEffect(() => {
    AsyncStorage.getItem("PATIENT_ID").then((id) => setPatientId(id));
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
        // If doctor selected is already done for today, shift to tomorrow
        if (isConsultationOver(selectedDoctor, date)) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setDate(tomorrow);
            Alert.alert("Consultation Ended", `Dr. ${selectedDoctor.name}'s shift for today has ended. Date shifted to tomorrow.`);
        }
        fetchStatus();
    }
  }, [selectedDoctor, date]);

  const fetchDoctors = async () => {
    try {
      setLoadingDocs(true);
      const res = await fetch(`${SERVER_URL}/doctors/`);
      const data = await res.json();
      const mapped = data.map((d: any) => ({
        ...d,
        startTime: d.startTime || "09:00 AM",
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
    } catch (err) {
      console.log("Error fetching tokens:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (selectedDate) {
        if (selectedDoctor && isConsultationOver(selectedDoctor, selectedDate)) {
            Alert.alert("Unavailable", "Consultation time for this date has already passed.");
            return;
        }
        setDate(selectedDate);
    }
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
      reason: isEmergency ? `[EMERGENCY] ${reason}` : reason,
      mobilenumber,
      status: isEmergency ? "Confirmed" : "Pending",
      is_emergency: isEmergency,
    };

    try {
      const res = await fetch(`${SERVER_URL}/appointments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (res.ok) {
        Alert.alert(
          isEmergency ? "Emergency Confirmed" : "Success", 
          `Token assigned successfully for ${date.toDateString()}.`, 
          [{ text: "Done", onPress: () => navigation.goBack() }]
        );
      } else {
        const data = await res.json();
        Alert.alert("Booking Error", data.detail || "Unable to book.");
      }
    } catch {
      Alert.alert("Server Error", "Check connection.");
    }
  };

  const activeThemeColor = isEmergency ? EMERGENCY_RED : PRIMARY_TEAL;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, !isEmergency && { backgroundColor: PRIMARY_TEAL }]} 
            onPress={() => setIsEmergency(false)}
          >
            <Text style={[styles.tabText, !isEmergency && { color: '#fff' }]}>Standard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, isEmergency && { backgroundColor: EMERGENCY_RED }]} 
            onPress={() => setIsEmergency(true)}
          >
            <MaterialCommunityIcons name="flash" size={16} color={isEmergency ? "#fff" : EMERGENCY_RED} />
            <Text style={[styles.tabText, isEmergency && { color: '#fff' }]}>Emergency (+5)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>1. Choose Specialty</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {specialties.map((spec) => (
            <TouchableOpacity
              key={spec}
              style={[styles.chip, selectedSpecialty === spec && { backgroundColor: activeThemeColor, borderColor: activeThemeColor }]}
              onPress={() => { setSelectedSpecialty(spec); setSelectedDoctor(null); }}
            >
              <Text style={[styles.chipText, selectedSpecialty === spec && { color: "#fff" }]}>{spec}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>2. Select Doctor</Text>
        {loadingDocs ? <ActivityIndicator color={activeThemeColor} /> : availableDoctors.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={[styles.docCard, selectedDoctor?.id === doc.id && { borderColor: activeThemeColor, backgroundColor: isEmergency ? "#FEF2F2" : "#F0FDFA" }]}
            onPress={() => setSelectedDoctor(doc)}
          >
            <View style={[styles.avatar, { backgroundColor: isEmergency ? "#FEE2E2" : "#E6F6F4" }]}>
                <Ionicons name="person" size={20} color={activeThemeColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docName}>Dr. {doc.name}</Text>
              <Text style={styles.docSub}>{doc.specialty} • {doc.endTime}</Text>
            </View>
            {selectedDoctor?.id === doc.id && <Ionicons name="checkmark-circle" size={24} color={activeThemeColor} />}
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>3. Date & Available Tokens</Text>
        
        {selectedDoctor && (
          <View style={[styles.timeBanner, { backgroundColor: isExpired ? "#FEE2E2" : (isEmergency ? "#FEE2E2" : "#E6F6F4") }]}>
            <Ionicons name={isExpired ? "close-circle" : "time"} size={20} color={isExpired ? EMERGENCY_RED : activeThemeColor} />
            <Text style={styles.timeText}>{isExpired ? "Shift Ended: " : "Consultation: "}</Text>
            <Text style={[styles.timeBold, { color: isExpired ? EMERGENCY_RED : activeThemeColor }]}>
                {selectedDoctor.startTime} - {selectedDoctor.endTime}
            </Text>
          </View>
        )}

        <View style={styles.calendarCard}>
          {Platform.OS === "android" && (
            <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowPicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={activeThemeColor} />
              <Text style={styles.dateBtnText}>{date.toDateString()}</Text>
              <Text style={[styles.changeLink, { color: activeThemeColor }]}>Change</Text>
            </TouchableOpacity>
          )}
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              minimumDate={new Date()}
              onChange={onDateChange}
              accentColor={activeThemeColor}
            />
          )}
        </View>

        {selectedDoctor && (
          <View style={[styles.tokenContainer, isEmergency && { borderColor: EMERGENCY_RED }]}>
            <View style={styles.tokenHeader}>
              <Text style={styles.tokenTitle}>Token Availability</Text>
              <Text style={[styles.tokenCount, { color: activeThemeColor }]}>
                {filled} / {currentMax} Booked
              </Text>
            </View>

            {loadingSlots ? <ActivityIndicator color={activeThemeColor} /> : (
              <View style={styles.grid}>
                {Array.from({ length: MAX_STANDARD }).map((_, i) => (
                  <View key={i} style={[styles.dot, i < filled ? styles.dotFilled : { backgroundColor: PRIMARY_TEAL }]} />
                ))}
                {isEmergency && Array.from({ length: 5 }).map((_, i) => (
                  <View key={i+25} style={[styles.dot, { borderRadius: 2 }, (i+25) < filled ? { backgroundColor: EMERGENCY_RED } : { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: EMERGENCY_RED }]} />
                ))}
              </View>
            )}
          </View>
        )}

        <Text style={styles.label}>4. Patient Information</Text>
        <TextInput style={styles.input} placeholder="Contact Number" keyboardType="phone-pad" value={mobilenumber} onChangeText={setMobileNumber} />
        <TextInput style={[styles.input, styles.textArea]} placeholder="Reason..." multiline value={reason} onChangeText={setReason} />

        <TouchableOpacity 
          style={[styles.bookBtn, { backgroundColor: activeThemeColor }, (remaining <= 0 || isExpired) && !isEmergency && styles.disabledBtn]} 
          onPress={handleBooking}
          disabled={(remaining <= 0 || isExpired) && !isEmergency}
        >
          <Text style={styles.bookBtnText}>
            {isExpired ? "Consultation Over for Today" : (remaining <= 0 && !isEmergency) ? "No Slots Left" : `Confirm ${isEmergency ? 'Emergency' : 'Standard'} Booking`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ... (Styles remain the same as your provided code)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: LIGHT_BG },
    header: { padding: 20, paddingTop: 60, flexDirection: "row", alignItems: "center" },
    headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginLeft: 15 },
    content: { padding: 20, paddingBottom: 60 },
    label: { fontSize: 16, fontWeight: "700", color: PRIMARY_DARK, marginVertical: 12 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4, marginBottom: 10 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 5 },
    tabText: { fontWeight: '600', color: SLATE_GRAY, fontSize: 13 },
    row: { marginBottom: 10 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, backgroundColor: "#fff", marginRight: 10, borderWidth: 1, borderColor: BORDER_COLOR },
    chipText: { fontSize: 14, color: SLATE_GRAY, fontWeight: "600" },
    docCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: BORDER_COLOR },
    avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 15 },
    docName: { fontSize: 16, fontWeight: "bold", color: PRIMARY_DARK },
    docSub: { fontSize: 13, color: SLATE_GRAY },
    timeBanner: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, marginBottom: 10 },
    timeText: { marginLeft: 8, fontSize: 14, color: SLATE_GRAY },
    timeBold: { fontSize: 14, fontWeight: "bold" },
    calendarCard: { backgroundColor: "#fff", borderRadius: 15, padding: 10, marginBottom: 15, borderWidth: 1, borderColor: BORDER_COLOR },
    datePickerBtn: { flexDirection: "row", alignItems: "center", padding: 10 },
    dateBtnText: { flex: 1, marginLeft: 10, fontSize: 16, color: PRIMARY_DARK },
    changeLink: { fontWeight: "bold" },
    tokenContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 15, borderWidth: 1, borderColor: BORDER_COLOR, marginBottom: 20 },
    tokenHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    tokenTitle: { fontWeight: "bold", color: PRIMARY_DARK },
    tokenCount: { fontWeight: "bold" },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 12 },
    dot: { width: 14, height: 14, borderRadius: 7 },
    dotFilled: { backgroundColor: "#E2E8F0" },
    note: { fontSize: 11, color: SLATE_GRAY, fontStyle: "italic" },
    input: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: BORDER_COLOR, fontSize: 16 },
    textArea: { height: 80, textAlignVertical: "top" },
    bookBtn: { padding: 18, borderRadius: 15, alignItems: "center", marginTop: 10 },
    disabledBtn: { backgroundColor: "#CBD5E1" },
    bookBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  });

export default BookNewAppointmentAdmin;