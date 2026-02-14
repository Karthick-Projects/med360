import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SERVER_URL from "../../config"; // Your FastAPI backend URL

// --- THEME COLORS ---
const PRIMARY_TEAL = "#00A896";
const COMPLEMENT_YELLOW = "#96A800";
const PRIMARY_DARK = "#0F172A";
const LIGHT_BACKGROUND = "#F4F6F8";
const NEUTRAL_LIGHT = "#FFFFFF";
const HEADER_TEXT_LIGHT = "#CCF8FF";
const BORDER_LIGHT = "#E2E8F0";

// --- Types ---
type Doctor = {
  id: string;
  name: string;
  specialty: string;
  contact: string;
  status: string;
  timeSlots: string[];
};

type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

// --- Specialties ---
const specialties = ["All", "Cardiology", "Dermatology", "Neurology", "Pediatrics"];

// --- Helpers ---
const getCalendarDays = (monthIndex: number, year: number): (number | null)[] => {
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDayOfMonth).fill(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  while (days.length % 7 !== 0) days.push(null);
  return days;
};

const getDayLabel = (date: Date) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

const getRelativeDayLabel = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return getDayLabel(date);
};

// --- Components ---
const DoctorListItem: React.FC<{ doctor: Doctor; selected: boolean; onSelect: () => void }> = ({
  doctor,
  selected,
  onSelect,
}) => (
  <TouchableOpacity
    style={[styles.doctorListItem, selected && styles.doctorListItemSelected]}
    onPress={onSelect}
    activeOpacity={0.8}
  >
    <View style={styles.listItemTextContainer}>
      <Text style={[styles.listItemName, selected && { color: NEUTRAL_LIGHT }]}>{doctor.name}</Text>
      <Text style={[styles.listItemDetails, selected && { color: HEADER_TEXT_LIGHT }]}>{doctor.specialty}</Text>
    </View>
    <Ionicons
      name={selected ? "checkmark-circle" : "chevron-forward-outline"}
      size={20}
      color={selected ? NEUTRAL_LIGHT : PRIMARY_TEAL}
    />
  </TouchableOpacity>
);

const LegendItem: React.FC<{ colorStyle: object; text: string }> = ({ colorStyle, text }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendColorBox, colorStyle]} />
    <Text style={styles.legendText}>{text}</Text>
  </View>
);

// Horizontal Date Scroller
const DateScroller: React.FC<{
  selectedDate: number | null;
  selectedMonth: number;
  onDateSelect: (day: number, month: number) => void;
}> = ({ selectedDate, selectedMonth, onDateSelect }) => {
  const today = new Date();
  const dates = useMemo(() => {
    const list = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      list.push(date);
    }
    return list;
  }, []);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScrollerContent}>
      {dates.map((date) => {
        const day = date.getDate();
        const month = date.getMonth();
        const isSelected = selectedDate === day && selectedMonth === month;
        return (
          <TouchableOpacity
            key={date.toISOString()} // ✅ unique key
            style={[styles.scrollerDayButton, isSelected && styles.scrollerDayButtonSelected]}
            onPress={() => onDateSelect(day, month)}
          >
            <Text style={[styles.scrollerDayText, isSelected && styles.scrollerDayTextSelected]}>
              {getRelativeDayLabel(date)}
            </Text>
            <Text style={[styles.scrollerDateText, isSelected && styles.scrollerDayTextSelected]}>{day}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// Full Month Calendar
const MonthCalendar: React.FC<{
  selectedDate: number | null;
  selectedMonth: number;
  onDateSelect: (day: number, month: number) => void;
  onMonthChange: (month: number) => void;
}> = ({ selectedDate, selectedMonth, onDateSelect, onMonthChange }) => {
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDate = new Date();
  const calendarYear = currentDate.getFullYear();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const renderCalendar = (month: number) => (
    <View style={styles.calendarColumn}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => onMonthChange((month - 1 + 12) % 12)}>
          <Ionicons name="chevron-back" size={20} color={PRIMARY_TEAL} />
        </TouchableOpacity>
        <Text style={styles.calendarMonthTitle}>
          {monthNames[month]} {calendarYear}
        </Text>
        <TouchableOpacity onPress={() => onMonthChange((month + 1) % 12)}>
          <Ionicons name="chevron-forward" size={20} color={PRIMARY_TEAL} />
        </TouchableOpacity>
      </View>
      <View style={styles.weekRow}>
        {daysOfWeek.map((day, idx) => (
          <Text key={idx} style={styles.dayOfWeekText}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {getCalendarDays(month, calendarYear).map((day, idx) => {
          const isSelected = selectedDate === day && selectedMonth === month;
          const isPast = day !== null && new Date(calendarYear, month, day).getTime() < new Date().setHours(0, 0, 0, 0);
          return (
            <TouchableOpacity
              key={`${month}-${day ?? "empty"}-${idx}`} // ✅ unique key
              style={[
                styles.dateCell,
                day === null && styles.dateCellEmpty,
                isSelected && styles.dateCellSelected,
                isPast && styles.dateCellDisabled,
              ]}
              onPress={() => day && onDateSelect(day, month)}
              disabled={isPast || day === null}
            >
              <Text style={[styles.dateText, isSelected && styles.dateTextSelected, isPast && styles.dateTextDisabled]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.calendarWrapper}>
      {renderCalendar(selectedMonth)}
      <View style={styles.legendContainer}>
        <LegendItem colorStyle={{ backgroundColor: PRIMARY_TEAL + "10", borderColor: PRIMARY_TEAL }} text="Available" />
        <LegendItem colorStyle={{ backgroundColor: PRIMARY_TEAL }} text="Selected" />
        <LegendItem colorStyle={{ backgroundColor: COMPLEMENT_YELLOW + "10", borderColor: COMPLEMENT_YELLOW }} text="Today" />
        <LegendItem colorStyle={{ backgroundColor: LIGHT_BACKGROUND, borderColor: BORDER_LIGHT }} text="Past/Booked" />
      </View>
    </View>
  );
};

// --- Main Screen ---
const BookNewAppointmentScreen: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState("");
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);

  const availableDoctors = selectedSpecialty === "All"
    ? doctors
    : doctors.filter((d) => d.specialty === selectedSpecialty);

  // Fetch patient ID
  useEffect(() => {
    AsyncStorage.getItem("PATIENT_ID").then((id) => setPatientId(id));
  }, []);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/doctors/`);
        console.log("HTTP status:", response.status);

        const data = await response.json();
        console.log("Raw data:", data);

        if (!response.ok) {
          Alert.alert("Failed to fetch doctors", data.detail || "Something went wrong");
          return;
        }

        const doctors: Doctor[] = data.map((doc: any) => ({
          id: doc.id || "N/A",
          name: (doc.name && doc.name !== "None" ? doc.name : "Unknown").trim(),
          specialty: (doc.specialty && doc.specialty !== "None" ? doc.specialty : "General").trim(),
          contact: (doc.contact && doc.contact !== "None" ? doc.contact : "N/A").trim(),
          status: (doc.status && doc.status !== "None" ? doc.status : "Inactive").trim(),
          timeSlots: doc.timeSlots || [],
        }));

        console.log("Mapped doctors:", doctors);
        setDoctors(doctors);
      } catch (err) {
        console.error("Fetch error:", err);
        Alert.alert("Error", "Cannot connect to server");
      }
    };

    fetchDoctors();
  }, []);

  // Fetch time slots
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDoctor || !selectedDay) {
        setTimeSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        const dateStr = new Date(today.getFullYear(), selectedMonth, selectedDay)
          .toISOString()
          .split("T")[0];

        const response = await fetch(
          `${SERVER_URL}/appointments/timeslots?doctor_id=${selectedDoctor.id}&date=${dateStr}`
        );

        if (!response.ok) throw new Error("Failed to fetch time slots");

        const data = await response.json();
        setTimeSlots(data);
      } catch (error) {
        console.error(error);
        setTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDoctor, selectedDay, selectedMonth]);

  const handleBooking = () => {
    if (!selectedDoctor || !selectedSlot || !selectedDay || !reason.trim() || !patientId) {
      Alert.alert("Missing Details", "Please select all fields");
      return;
    }

    const appointmentData = {
      patient_id: patientId,
      doctor_id: selectedDoctor.id,
      date: new Date(today.getFullYear(), selectedMonth, selectedDay).toISOString().split("T")[0],
      time: selectedSlot.time,
      reason: reason.trim(),
    };

    fetch(`${SERVER_URL}/appointments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointmentData),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          Alert.alert("Success", "Appointment booked successfully");
          setSelectedSlot(null);
          setReason("");
        } else {
          Alert.alert("Error", data.detail || "Failed to book appointment");
        }
      })
      .catch(() => Alert.alert("Error", "Failed to book appointment"));
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book New Appointment</Text>
        <Text style={styles.headerSubtitle}>Find your doctor and secure your slot.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Specialty Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Choose Specialist</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specialtyScroll}>
            {specialties.map((spec) => (
              <TouchableOpacity
                key={spec}
                style={[styles.specialtyButton, selectedSpecialty === spec && styles.specialtyButtonSelected]}
                onPress={() => {
                  setSelectedSpecialty(spec);
                  setSelectedDoctor(null);
                  setSelectedSlot(null);
                }}
              >
                <Text style={[styles.specialtyText, selectedSpecialty === spec && styles.specialtyTextSelected]}>
                  {spec}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 2. Doctor List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Select Doctor ({availableDoctors.length})</Text>
          <FlatList
            data={availableDoctors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DoctorListItem
                doctor={item}
                selected={selectedDoctor?.id === item.id}
                onSelect={() => {
                  setSelectedDoctor(item);
                  setSelectedSlot(null);
                }}
              />
            )}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={styles.noDoctorsText}>No doctors available.</Text>}
          />
        </View>

        {/* 3. Date Scroller */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Select Date</Text>
          <DateScroller selectedDate={selectedDay} selectedMonth={selectedMonth} onDateSelect={(d, m) => { setSelectedDay(d); setSelectedMonth(m); setSelectedSlot(null); }} />
          <TouchableOpacity style={styles.calendarToggle} onPress={() => setShowFullCalendar(!showFullCalendar)}>
            <Text style={styles.calendarToggleText}>{showFullCalendar ? "Hide Full Calendar" : "View Full Calendar"}</Text>
            <Ionicons name={showFullCalendar ? "chevron-up" : "chevron-down"} size={16} color={PRIMARY_TEAL} />
          </TouchableOpacity>
          {showFullCalendar && (
            <MonthCalendar
              selectedDate={selectedDay}
              selectedMonth={selectedMonth}
              onDateSelect={(d, m) => { setSelectedDay(d); setSelectedMonth(m); setSelectedSlot(null); }}
              onMonthChange={(m) => { setSelectedMonth(m); setSelectedDay(null); setSelectedSlot(null); }}
            />
          )}
        </View>

        {/* 4. Time Slots */}
        {selectedDay !== null && selectedDoctor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Select Time Slot</Text>
            {loadingSlots ? (
              <Text style={{ textAlign: "center", marginVertical: 10 }}>Loading slots...</Text>
            ) : timeSlots.length === 0 ? (
              <Text style={{ textAlign: "center", marginVertical: 10 }}>No available slots for this date</Text>
            ) : (
              <View style={styles.timeSlotGrid}>
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeSlotButton,
                      !slot.available && styles.timeSlotButtonDisabled,
                      selectedSlot?.id === slot.id && styles.timeSlotButtonSelected,
                    ]}
                    onPress={() => slot.available && setSelectedSlot(slot)}
                    disabled={!slot.available}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        (selectedSlot?.id === slot.id || !slot.available) && styles.timeSlotTextSelectedOrDisabled,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 5. Reason */}
        {selectedDay !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Reason for Appointment</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Reason for your visit"
              multiline
              value={reason}
              onChangeText={setReason}
            />
          </View>
        )}

        {/* 6. Confirm Button */}
        <TouchableOpacity
          style={[styles.submitButton, (!selectedDoctor || !selectedSlot || !selectedDay || !reason.trim()) && styles.submitButtonDisabled]}
          onPress={handleBooking}
          disabled={!selectedDoctor || !selectedSlot || !selectedDay || !reason.trim()}
        >
          <Text style={styles.submitButtonText}>Confirm Appointment</Text>
          <Ionicons name="send" size={24} color={NEUTRAL_LIGHT} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default BookNewAppointmentScreen;

// --- Stylesheet (Updated) ---

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: LIGHT_BACKGROUND,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // --- Header (Unchanged) ---
  header: {
    padding: 20,
    backgroundColor: PRIMARY_TEAL,
    paddingTop: 50,
    marginBottom: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: NEUTRAL_LIGHT,
  },
  headerSubtitle: {
    fontSize: 14,
    color: HEADER_TEXT_LIGHT,
    marginTop: 5,
  },

  // --- Section (Unchanged) ---
  section: {
    marginBottom: 20,
    backgroundColor: NEUTRAL_LIGHT,
    padding: 15,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_DARK,
    marginBottom: 10,
    marginTop: 5,
  },
  specialtyScroll: {
    paddingBottom: 5,
  },
  specialtyButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: NEUTRAL_LIGHT,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  specialtyButtonSelected: {
    backgroundColor: PRIMARY_TEAL,
    borderColor: PRIMARY_TEAL,
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: '500',
    color: PRIMARY_DARK,
  },
  specialtyTextSelected: {
    color: NEUTRAL_LIGHT,
    fontWeight: '700',
  },
  doctorListContainer: {
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 12,
    backgroundColor: NEUTRAL_LIGHT,
    overflow: 'hidden',
  },
  doctorListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BACKGROUND,
  },
  doctorListItemSelected: {
    backgroundColor: PRIMARY_TEAL,
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_DARK,
  },
  listItemDetails: {
    fontSize: 12,
    color: PRIMARY_DARK,
    marginTop: 2,
  },
  noDoctorsText: {
    padding: 15,
    fontSize: 14,
    color: PRIMARY_DARK,
    textAlign: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: PRIMARY_TEAL + '10',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_TEAL,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_TEAL,
  },
  profileDesignation: {
    fontSize: 14,
    color: PRIMARY_DARK,
  },
  profileExperience: {
    fontSize: 12,
    color: PRIMARY_DARK,
  },

  // --- Date Scroller Styles (New) ---
  dateScrollerContent: {
    paddingVertical: 5,
  },
  scrollerDayButton: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: LIGHT_BACKGROUND,
  },
  scrollerDayButtonTodayTomorrow: {
    borderColor: COMPLEMENT_YELLOW, // Highlight Today/Tomorrow slightly
    backgroundColor: COMPLEMENT_YELLOW + '10',
  },
  scrollerDayButtonSelected: {
    backgroundColor: PRIMARY_TEAL,
    borderColor: PRIMARY_TEAL,
  },
  scrollerDayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollerDateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scrollerDayTextDefault: {
    color: PRIMARY_DARK,
  },
  scrollerDayTextSelected: {
    color: NEUTRAL_LIGHT,
  },

  // --- Calendar Toggle ---
  calendarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 5,
  },
  calendarToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_TEAL,
    marginRight: 5,
  },

  // --- Month Calendar (Updated styles) ---
  calendarWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
  },
  monthCalendarContainer: {
    backgroundColor: NEUTRAL_LIGHT,
    padding: 10,
  },
  calendarColumn: {
    // Main container
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  calendarMonthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY_DARK,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayOfWeekText: {
    width: '12%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: PRIMARY_DARK,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dateCell: {
    width: '12%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: NEUTRAL_LIGHT,
  },
  dateCellEmpty: {
    width: '12%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 6,
  },
  dateCellAvailable: {
    borderColor: PRIMARY_TEAL + '50',
    backgroundColor: PRIMARY_TEAL + '10',
  },
  dateCellToday: {
    borderColor: COMPLEMENT_YELLOW,
    backgroundColor: COMPLEMENT_YELLOW + '10',
  },
  dateCellDisabled: {
    borderColor: BORDER_LIGHT,
    backgroundColor: LIGHT_BACKGROUND,
    opacity: 0.5,
  },
  dateCellSelected: {
    backgroundColor: PRIMARY_TEAL,
    borderColor: PRIMARY_TEAL,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_DARK,
  },
  dateTextAvailable: {
    color: PRIMARY_TEAL,
  },
  dateTextToday: {
    color: PRIMARY_DARK,
  },
  dateTextDisabled: {
    color: '#A1A1AA', // Darker gray for disabled
  },
  dateTextSelected: {
    color: NEUTRAL_LIGHT,
  },

  // --- Legend Styles (Unchanged) ---
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: LIGHT_BACKGROUND,
    borderTopWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 12,
    color: PRIMARY_DARK,
  },

  // --- Time Slots (Unchanged) ---
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  timeSlotButton: {
    backgroundColor: NEUTRAL_LIGHT,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  timeSlotButtonSelected: {
    backgroundColor: PRIMARY_TEAL,
    borderColor: PRIMARY_TEAL,
  },
  timeSlotButtonDisabled: {
    backgroundColor: LIGHT_BACKGROUND,
    borderColor: BORDER_LIGHT,
    opacity: 0.6,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeSlotTextDefault: {
    color: PRIMARY_DARK,
  },
  timeSlotTextSelectedOrDisabled: {
    color: NEUTRAL_LIGHT,
  },

  // --- Reason Input and Submit Button (Unchanged) ---
  reasonInput: {
    backgroundColor: NEUTRAL_LIGHT,
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    fontSize: 15,
    minHeight: 100,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: PRIMARY_TEAL,
    elevation: 5,
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#A1A1AA',
  },
  submitButtonText: {
    color: NEUTRAL_LIGHT,
    fontSize: 18,
    fontWeight: '800',
  },
});