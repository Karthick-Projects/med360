import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// --- Type Definitions ---

type Appointment = {
  id: string;
  patientName: string;
  patientId: string;
  phone: string;
  reason: string;
  date: string;
  time: string;
  status: "Pending" | "Completed";
};

type TabProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

// --- Data Placeholders ---

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    patientName: "Ramesh Kumar",
    patientId: "PID1023",
    phone: "9876543210", // Mobile number is here
    reason: "Fever and body pain",
    date: "10 Jan 2026",
    time: "10:30 AM",
    status: "Pending",
  },
  {
    id: "2",
    patientName: "Suresh B",
    patientId: "PID1045",
    phone: "9123456780", // Mobile number is here
    reason: "Chest pain follow-up",
    date: "10 Jan 2026",
    time: "11:15 AM",
    status: "Pending",
  },
  {
    id: "3",
    patientName: "Lakshmi Devi",
    patientId: "PID1088",
    phone: "9012345678", // Mobile number is here
    reason: "Diabetes checkup",
    date: "10 Jan 2026",
    time: "12:00 PM",
    status: "Completed",
  },
  {
    id: "4",
    patientName: "Ganesh M",
    patientId: "PID1101",
    phone: "9988776655", // Mobile number is here
    reason: "Migraine consultation",
    date: "09 Jan 2026",
    time: "03:00 PM",
    status: "Completed",
  },
];

// --- Reusable Components ---

const TabButton: React.FC<TabProps> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/**
 * @description Detailed Card component for a single appointment.
 */
const AppointmentCard: React.FC<{
  item: Appointment;
  onApprove: (id: string) => void;
}> = ({ item, onApprove }) => {
  // Function to initiate a call
  const handleCall = () => {
    Linking.openURL(`tel:${item.phone}`);
  };

  const isPending = item.status === "Pending";
  const statusColor = isPending ? "#FF8C00" : "#50C878"; // Orange for pending, Green for completed
  const cardBorderColor = isPending ? '#FF8C00' : '#50C878';

  return (
    <View style={[styles.card, { borderLeftColor: cardBorderColor }]}>
      {/* Top Row: Name, ID, and Status Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.patientId}>Patient ID: {item.patientId}</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      {/* Separator */}
      <View style={styles.separator} />

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        {/* Date and Time */}
        <View style={styles.dateTimeContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#475569" style={styles.iconMargin} />
            <Text style={styles.detailValue}>{item.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#475569" style={styles.iconMargin} />
            <Text style={styles.detailValue}>{item.time}</Text>
          </View>
        </View>
        
        {/* === Mobile Number (Made More Prominent) === */}
        <View style={styles.mobileRow}>
          <Ionicons name="call-outline" size={18} color="#1E3A8A" style={styles.iconMargin} />
          <Text style={styles.mobileLabel}>Mobile:</Text>
          <Text style={styles.mobileValue}>{item.phone}</Text>
        </View>
        {/* =========================================== */}
        
        {/* Reason */}
        <View style={styles.detailRow}>
          <MaterialIcons name="local-hospital" size={16} color="#475569" style={styles.iconMargin} />
          <Text style={styles.detailLabel}>Reason:</Text>
          <Text style={styles.detailValueFlex}>{item.reason}</Text>
        </View>

      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {/* Call Button (Only for Pending) */}
        {isPending && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.callButton]} 
            onPress={handleCall} 
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>
        )}
        
        {/* Approve Button (Only for Pending) */}
        {isPending && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]} 
            onPress={() => onApprove(item.id)} 
            activeOpacity={0.8}
          >
            <MaterialIcons name="check-circle" size={18} color="#fff" />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
        )}
        
        {/* View Details Button (For Completed) */}
        {!isPending && (
            <TouchableOpacity 
                style={[styles.actionButton, styles.viewButton]} 
                onPress={() => console.log(`View record for ${item.id}`)} 
                activeOpacity={0.8}
            >
                <Ionicons name="document-text-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>View Record</Text>
            </TouchableOpacity>
        )}
      </View>
    </View>
  );
};


// --- Main Screen Component (Unchanged logic) ---

const ViewAppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] =
    useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"Pending" | "Completed">("Pending");

  const filteredAppointments = appointments.filter(
    (app) => app.status === activeTab
  );

  const handleApprove = useCallback((id: string) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === id ? { ...app, status: 'Completed' } : app
      )
    );
  }, []);
  
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setAppointments(INITIAL_APPOINTMENTS.map(app => ({...app}))); 
      setRefreshing(false);
    }, 1500);
  };

  const renderItem = ({ item }: { item: Appointment }) => (
    <AppointmentCard item={item} onApprove={handleApprove} />
  );

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <Text style={styles.title}>Patient Appointments</Text>
      <Text style={styles.subtitle}>
        Scheduled patient visit details
      </Text>

      {/* Tabs Container */}
      <View style={styles.tabsContainer}>
        <TabButton
          label={`Pending (${pendingCount})`}
          active={activeTab === "Pending"}
          onPress={() => setActiveTab("Pending")}
        />
        <TabButton
          label={`Completed (${completedCount})`}
          active={activeTab === "Completed"}
          onPress={() => setActiveTab("Completed")}
        />
      </View>

      {/* Appointment List */}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-circle-outline" size={40} color="#A1A1AA" />
            <Text style={styles.emptyText}>
              {activeTab === 'Pending' ? 'No pending appointments.' : 'No completed appointments yet.'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ViewAppointmentsScreen;

// --- Stylesheet ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    paddingHorizontal: 16,
    paddingTop: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E3A8A", // Deep Blue
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 15,
  },

  // --- Tabs Styles ---

  tabsContainer: {
    flexDirection: "row",
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    padding: 3,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },

  tabButtonActive: {
    backgroundColor: "#FFFFFF", // White background for active tab
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },

  tabTextActive: {
    color: "#1E3A8A",
    fontWeight: "600",
  },

  // --- Card Styles ---

  listContent: {
    paddingBottom: 20,
  },
  
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 6,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  cardHeaderLeft: {
    flexShrink: 1,
  },

  patientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },

  patientId: {
    fontSize: 12,
    color: "#64748B",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },

  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },

  detailsContainer: {
    marginBottom: 10,
  },
  
  // New Style for Mobile Number visibility
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#EBF4FF', // Light blue background for emphasis
    borderRadius: 8,
  },
  
  mobileLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: "#1E3A8A",
    marginRight: 10,
  },
  
  mobileValue: {
    fontSize: 16,
    fontWeight: '700',
    color: "#1E3A8A",
  },
  // End New Style
  
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  detailRow: {
    flexDirection: "row",
    alignItems: 'center',
    marginBottom: 6,
  },

  iconMargin: {
    marginRight: 8,
  },

  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: "#475569",
    width: 65,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  
  detailValueFlex: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
  },

  // --- Action Buttons Styles ---
  
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-start',
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
    elevation: 2,
  },

  callButton: {
    backgroundColor: '#4A90E2', // Primary Blue for Call
  },
  
  approveButton: {
    backgroundColor: '#50C878', // Green for Approve
  },
  
  viewButton: {
      backgroundColor: '#64748B', // Gray/Blue for View Record
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // --- Empty State Styles ---

  emptyBox: {
    marginTop: 80,
    alignItems: "center",
    padding: 20,
  },

  emptyText: {
    color: "#64748B",
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
});