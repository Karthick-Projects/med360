import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import SERVER_URL from "../../config";

interface DischargePatient {
  id: string;
  patient_name: string;
  doctor_name: string;
  ward_no: string;
  bed_no: string;
  discharge_date: string;
  admission_date: string;
}

const AdminDischargeScreen = ({ navigation }: any) => {
  const [patients, setPatients] = useState<DischargePatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDischarges();
  }, []);

  const fetchPendingDischarges = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/admin/pending-discharges`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Sort by discharge date (Soonest first)
        const sortedData = data.sort((a, b) => 
          new Date(a.discharge_date).getTime() - new Date(b.discharge_date).getTime()
        );
        setPatients(sortedData);
      } else {
        setPatients([]);
      }
    } catch (err) {
      Alert.alert("Error", "Could not fetch discharge list.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalDischarge = async (patientId: string) => {
    Alert.alert(
      "Confirm Clearance",
      "Confirm physical discharge and finalize billing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Discharged",
          onPress: async () => {
            try {
              const res = await fetch(`${SERVER_URL}/appointments/${patientId}/finalize-discharge`, {
                method: "PUT",
              });
              if (res.ok) {
                Alert.alert("Success", "Patient discharged and bed released.");
                fetchPendingDischarges();
              }
            } catch (err) {
              Alert.alert("Error", "Update failed.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: DischargePatient }) => (
    <View style={styles.card}>
      {/* Top Row: Patient and Date Side-by-Side */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientName}>{item.patient_name}</Text>
          <Text style={styles.doctorSub}>Dr. {item.doctor_name}</Text>
        </View>
        
        {/* Discharge Date Displayed Prominently Next to Name */}
        <View style={styles.dateBadge}>
          <Ionicons name="calendar" size={12} color="#E11D48" style={{marginRight: 4}} />
          <Text style={styles.dateBadgeText}>{item.discharge_date}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>Ward {item.ward_no} / Bed {item.bed_no}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Admitted</Text>
          <Text style={styles.infoValue}>{item.admission_date}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => handleFinalDischarge(item.id)}
      >
        <MaterialIcons name="check-circle" size={20} color="#fff" />
        <Text style={styles.btnText}>Complete Discharge</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {loading ? (
        <ActivityIndicator size="large" color="#0F172A" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <FontAwesome5 name="clipboard-check" size={50} color="#CBD5E1" />
               <Text style={styles.emptyText}>No patients scheduled for discharge today.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  mainHeader: { 
    backgroundColor: "#0F172A", 
    padding: 20, 
    paddingTop: 50, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  headerSubtitle: { color: "#94A3B8", fontSize: 12 },
  card: { 
    backgroundColor: "#fff", 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  patientName: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  doctorSub: { fontSize: 13, color: "#64748B", marginTop: 2 },
  
  // New Date Badge UI
  dateBadge: { 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F2", 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECDD3"
  },
  dateBadgeText: { fontSize: 13, fontWeight: "800", color: "#E11D48" },
  
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  infoBlock: { flex: 1 },
  infoLabel: { fontSize: 10, color: "#94A3B8", fontWeight: "700", textTransform: "uppercase" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#475569", marginTop: 2 },
  
  actionBtn: { 
    backgroundColor: "#10B981", 
    flexDirection: "row", 
    padding: 14, 
    borderRadius: 12, 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8 
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  emptyContainer: { justifyContent: 'center',alignItems: "center", marginTop: 100 },
  emptyText: { textAlign: "center", marginTop: 15, color: "#94A3B8", fontSize: 14, paddingHorizontal: 40 }
});

export default AdminDischargeScreen;