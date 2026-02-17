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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
  const color = isPending ? "#F59E0B" : "#10B981";

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.patientId}>ID: {item.patientId}</Text>
        <Text style={[styles.statusText, { color }]}>{item.status}</Text>
      </View>

      <View style={styles.separator} />

      <Text style={styles.info}>📅 {item.date} | ⏰ {item.time}</Text>
      <Text style={styles.info}>📞 {item.phone}</Text>
      <Text style={styles.reason}>🩺 {item.reason}</Text>

      {isPending && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.callBtn]}
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
          >
            <Text style={styles.btnText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.approveBtn]}
            onPress={() => onApprove(item.id)}
          >
            <Text style={styles.btnText}>Approve</Text>
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
  const [activeTab, setActiveTab] =
    useState<"Pending" | "Completed">("Pending");

  /* ---------- FETCH ALL TODAY APPOINTMENTS ---------- */

  const fetchAppointments = async () => {
    try {
      const doctorId = await AsyncStorage.getItem("PATIENT_ID");
      if (!doctorId) return;

      const res = await fetch(
        `${SERVER_URL}/appointments/doctor/${doctorId}/today`
      );
      const data = await res.json();

      if (res.ok) {
        setAppointments(data);
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

  /* ---------- APPROVE ---------- */

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
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
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
  title: { fontSize: 26, fontWeight: "800", marginBottom: 20 },
  tabs: { flexDirection: "row", marginBottom: 15 },
  tabButton: { flex: 1, padding: 10, alignItems: "center" },
  tabButtonActive: { backgroundColor: "#E2E8F0", borderRadius: 8 },
  tabText: { fontWeight: "600" },
  tabTextActive: { color: "#1E3A8A" },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 5,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  patientId: { fontWeight: "700" },
  statusText: { fontWeight: "700" },
  separator: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  info: { fontSize: 13, color: "#475569" },
  reason: { fontWeight: "600", marginTop: 6 },

  actions: { flexDirection: "row", marginTop: 10 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center" },
  callBtn: { backgroundColor: "#3B82F6", marginRight: 6 },
  approveBtn: { backgroundColor: "#10B981" },
  btnText: { color: "#FFF", fontWeight: "700" },

  empty: { textAlign: "center", marginTop: 40, color: "#94A3B8" },
});
