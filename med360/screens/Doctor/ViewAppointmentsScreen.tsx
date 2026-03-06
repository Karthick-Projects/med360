import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SERVER_URL from "../../config";

/* ================= TYPES ================= */

type Appointment = {
  id: string;
  patientId: string;
  phone: string;
  reason: string;
  date: string;
  time: string;
  status: "Pending" | "Completed";
  is_emergency?: boolean; // New Field
};

/* ================= TAB BUTTON ================= */

const TabButton = ({ label, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ================= CARD ================= */

const AppointmentCard = ({ item, onApprove }: any) => {
  const isPending = item.status === "Pending";
  const isEmergency = item.is_emergency;
  
  // Logic: Emergency gets Red, Completed gets Green, Pending gets Orange
  const color = isEmergency && isPending ? "#DC2626" : (isPending ? "#F59E0B" : "#10B981");

  return (
    <View style={[styles.card, { borderLeftColor: color }, isEmergency && isPending && styles.emergencyCardShadow]}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
            <Text style={styles.patientId}>ID: {item.patientId}</Text>
            {isEmergency && isPending && (
                <View style={styles.emergencyBadge}>
                    <MaterialCommunityIcons name="flash" size={12} color="#FFF" />
                    <Text style={styles.emergencyText}>EMERGENCY</Text>
                </View>
            )}
        </View>
        <Text style={[styles.statusText, { color }]}>{item.status}</Text>
      </View>

      <View style={styles.separator} />

      <Text style={styles.info}>📅 {item.date} | ⏰ {item.time}</Text>
      <Text style={styles.info}>📞 {item.phone}</Text>
      <Text style={[styles.reason, isEmergency && isPending && { color: "#DC2626" }]}>🩺 {item.reason}</Text>

      {isPending && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.callBtn]}
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
          >
            <Text style={styles.btnText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: color }]}
            onPress={() => onApprove(item.id)}
          >
            <Text style={styles.btnText}>Complete Visit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/* ================= MAIN ================= */

const ViewAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"Pending" | "Completed">("Pending");

  const fetchAppointments = async () => {
    try {
      const doctorId = await AsyncStorage.getItem("PATIENT_ID");
      if (!doctorId) return;

      const res = await fetch(`${SERVER_URL}/appointments/doctor/${doctorId}/today`);
      const data = await res.json();

      if (res.ok) {
        // SORTING LOGIC: Move emergency=true to the top
        const sortedData = data.sort((a: Appointment, b: Appointment) => {
            if (a.is_emergency === b.is_emergency) return 0;
            return a.is_emergency ? -1 : 1;
        });
        setAppointments(sortedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleApprove = useCallback(async (id: string) => {
    try {
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status: "Completed" } : a))
      );

      await fetch(`${SERVER_URL}/appointments/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Completed" }),
      });
    } catch {
      Alert.alert("Error", "Update failed");
      fetchAppointments();
    }
  }, []);

  const filtered = appointments.filter(a => a.status === activeTab);

  if (loading) {
    return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Today’s Visits</Text>

      <View style={styles.tabs}>
        <TabButton
          label={`Pending (${appointments.filter(a => a.status === "Pending").length})`}
          active={activeTab === "Pending"}
          onPress={() => setActiveTab("Pending")}
        />
        <TabButton
          label={`Completed (${appointments.filter(a => a.status === "Completed").length})`}
          active={activeTab === "Completed"}
          onPress={() => setActiveTab("Completed")}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <AppointmentCard item={item} onApprove={handleApprove} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAppointments();
            }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No {activeTab} appointments</Text>
        }
      />
    </View>
  );
};

export default ViewAppointmentsScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 20, color: "#0F172A" },
  tabs: { flexDirection: "row", marginBottom: 15, backgroundColor: "#F1F5F9", borderRadius: 10, padding: 4 },
  tabButton: { flex: 1, padding: 10, alignItems: "center" },
  tabButtonActive: { backgroundColor: "#FFF", borderRadius: 8, elevation: 2, shadowOpacity: 0.1 },
  tabText: { fontWeight: "600", color: "#64748B" },
  tabTextActive: { color: "#2563eb" },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  emergencyCardShadow: {
    shadowColor: "#DC2626",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    backgroundColor: "#FFF5F5",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  patientId: { fontWeight: "700", fontSize: 15 },
  
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 10,
  },
  emergencyText: { color: "#FFF", fontSize: 10, fontWeight: "900", marginLeft: 3 },

  statusText: { fontWeight: "700", textTransform: 'uppercase', fontSize: 12 },
  separator: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 10 },
  info: { fontSize: 14, color: "#475569", marginBottom: 4 },
  reason: { fontWeight: "600", marginTop: 6, fontSize: 15, color: "#1E293B" },

  actions: { flexDirection: "row", marginTop: 15 },
  btn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
  callBtn: { backgroundColor: "#E2E8F0", marginRight: 8 },
  btnText: { color: "#FFF", fontWeight: "700" },

  empty: { textAlign: "center", marginTop: 40, color: "#94A3B8", fontSize: 16 },
});