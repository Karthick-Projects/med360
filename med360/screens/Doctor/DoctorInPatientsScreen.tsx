import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SERVER_URL from "../../config";

interface InPatient {
  id: string;
  patient_name: string;
  age: number;
  gender: string;
  ward_no: string;
  bed_no: string;
  admission_date: string;
  reason: string;
}

const DoctorInPatientsScreen = ({ navigation }: any) => {
  const [patients, setPatients] = useState<InPatient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Discharge Logic States
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [dischargeDate, setDischargeDate] = useState(new Date());

  useEffect(() => {
    fetchInPatients();
  }, []);

  const fetchInPatients = async () => {
    try {
      setLoading(true);
      const doctorId = await AsyncStorage.getItem("PATIENT_ID");
      // Fetch only patients assigned to THIS doctor who are currently admitted
      const res = await fetch(`${SERVER_URL}/appointments/doctor/${doctorId}/ipd`);
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load In-Patient list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDischargePress = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowPicker(true);
  };

  const confirmDischarge = async (event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios'); // Keep open on iOS until "Done"
    
    if (date && selectedPatientId) {
      const formattedDate = date.toISOString().split('T')[0];
      
      Alert.alert(
        "Confirm Discharge",
        `Set discharge date to ${formattedDate}?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Discharge", 
            onPress: async () => {
              try {
                const res = await fetch(`${SERVER_URL}/appointments/${selectedPatientId}/discharge`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ discharge_date: formattedDate }),
                });

                if (res.ok) {
                  Alert.alert("Success", "Patient marked for discharge.");
                  fetchInPatients(); // Refresh list
                }
              } catch (err) {
                Alert.alert("Error", "Update failed.");
              }
            }
          }
        ]
      );
    }
    setSelectedPatientId(null);
  };

  const renderPatientCard = ({ item }: { item: InPatient }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.profileBadge}>
          <FontAwesome5 name="user-injured" size={20} color="#00A896" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.patientName}>{item.patient_name}</Text>
          <Text style={styles.patientSub}>{item.age} yrs • {item.gender}</Text>
        </View>
        <View style={styles.locationBadge}>
          <Text style={styles.locationText}>Ward {item.ward_no} / Bed {item.bed_no}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color="#64748B" />
        <Text style={styles.infoText}>Admitted: {item.admission_date}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="medical-outline" size={16} color="#64748B" />
        <Text style={styles.infoText} numberOfLines={1}>Condition: {item.reason}</Text>
      </View>

      <TouchableOpacity 
        style={styles.dischargeBtn}
        onPress={() => handleDischargePress(item.id)}
      >
        <Ionicons name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.dischargeBtnText}>Set Discharge Date</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>In-Patient Dept (IPD)</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00A896" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          renderItem={renderPatientCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No patients currently admitted under your care.</Text>
          }
        />
      )}

      {showPicker && (
        <DateTimePicker
          value={dischargeDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={confirmDischarge}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { 
    backgroundColor: "#1B2C57", 
    padding: 20, 
    paddingTop: 50, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between" 
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  listContent: { padding: 15 },
  card: { 
    backgroundColor: "#fff", 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  profileBadge: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: "#E6F6F4", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  patientName: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  patientSub: { fontSize: 13, color: "#64748B" },
  locationBadge: { backgroundColor: "#F1F5F9", padding: 6, borderRadius: 8 },
  locationText: { fontSize: 11, fontWeight: "600", color: "#475569" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  infoText: { fontSize: 13, color: "#475569" },
  dischargeBtn: { 
    backgroundColor: "#00A896", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 12, 
    borderRadius: 10, 
    marginTop: 10,
    gap: 8 
  },
  dischargeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#94A3B8" }
});

export default DoctorInPatientsScreen;