import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const AdminDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      // 🔁 Call your API / reload dashboard data here
      // await fetchDashboardData();
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false); // stop spinner ONLY after work is done
    }
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hospital Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage hospital operations</Text>
      </View>

      {/* Modules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Modules</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("PatientRegistration")}
        >
          <Text style={styles.cardTitle}>👤 Patient Registration</Text>
          <Text style={styles.cardDesc}>Register & manage patients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("AdmissionDetails")}
        >
          <Text style={styles.cardTitle}>🏥 Admission Details</Text>
          <Text style={styles.cardDesc}>Ward & bed management</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("DoctorDepartment")}
        >
          <Text style={styles.cardTitle}>👨‍⚕️ Doctor & Department</Text>
          <Text style={styles.cardDesc}>Assign doctors</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("StaffManagement")}
        >
          <Text style={styles.cardTitle}>🧑‍💼 Staff Management</Text>
          <Text style={styles.cardDesc}>HRM module</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("PharmacyInventory")}
        >
          <Text style={styles.cardTitle}>💊 Pharmacy</Text>
          <Text style={styles.cardDesc}>Medicine inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("MasterRegistration")}
        >
          <Text style={styles.cardTitle}>Master Registration</Text>
          <Text style={styles.cardDesc}>All Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("LabManagement")}
        >
          <Text style={styles.cardTitle}>🧪 Lab Management</Text>
          <Text style={styles.cardDesc}>Lab tests & reports</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
  },
  header: {
    backgroundColor: "#2563eb",
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#e0e7ff",
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardDesc: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
});

export default AdminDashboardScreen;
