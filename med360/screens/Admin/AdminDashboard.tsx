import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#2563eb",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  accent: "#00A896", // Teal for Appointment booking
};

const AdminDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const ModuleCard = ({ title, desc, icon, family, screen, iconBg, iconColor }: any) => {
    const IconFamily = family || Ionicons;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.gridCard}
        onPress={() => navigation.navigate(screen)}
      >
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <IconFamily name={icon} size={24} color={iconColor || COLORS.primary} />
        </View>
        <Text style={styles.gridTitle}>{title}</Text>
        <Text style={styles.gridDesc}>{desc}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Hospital Admin</Text>
          <Text style={styles.headerSubtitle}>Med360 Management Portal</Text>
        </View>
        <View style={styles.statusBadge}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>System Live</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        <Text style={styles.sectionTitle}>Main Operations</Text>

        {/* MANAGEMENT GRID */}
        <View style={styles.gridContainer}>
          
          {/* NEW: BOOK APPOINTMENT CARD */}
          <ModuleCard 
            title="Book Appt" 
            desc="New Registration" 
            icon="calendar-plus" 
            family={MaterialCommunityIcons}
            screen="BookNewAppointmentAdmin" 
            iconBg="#E6F6F4" 
            iconColor={COLORS.accent}
          />

          <ModuleCard 
            title="Registration" desc="Patient Entry" 
            icon="person-add" screen="PatientRegistration" iconBg="#DBEAFE" 
          />
          
          <ModuleCard 
            title="Admissions" desc="Ward Management" 
            icon="bed-outline" screen="AdmissionDetails" iconBg="#DCFCE7" 
          />
<ModuleCard 
            title="Discharges" 
            desc="Final Clearance" 
            icon="exit-to-app" 
            family={MaterialIcons} // You can also use Ionicons "log-out-outline"
            screen="AdminDischargeScreen" 
            iconBg="#FFF1F2" 
            iconColor="#E11D48" 
          />
          <ModuleCard 
            title="Doctors" desc="Dept & Rosters" 
            icon="user-md" family={FontAwesome5} screen="DoctorDepartment" iconBg="#FEF3C7" 
          />

          <ModuleCard 
            title="Staffing" desc="HR & Payroll" 
            icon="people-outline" screen="StaffManagement" iconBg="#F3E8FF" 
          />

          <ModuleCard 
            title="Pharmacy" desc="Inventory" 
            icon="pill" family={MaterialCommunityIcons} screen="PharmacyInventory" iconBg="#FEE2E2" 
          />

          <ModuleCard 
            title="Lab Center" desc="Test Reports" 
            icon="flask-outline" screen="LabManagement" iconBg="#E0E7FF" 
          />

          <ModuleCard 
            title="Vital Screen" desc="Vitals Monitor" 
            icon="heart-pulse" family={MaterialCommunityIcons} screen="UpdateVitalScreen" iconBg="#CCFBF1" 
          />

          <ModuleCard 
            title="Master Data" desc="Control Panel" 
            icon="settings-outline" screen="MasterRegistration" iconBg="#F1F5F9" 
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  headerSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 6 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  scrollContent: { padding: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textMain, marginBottom: 20 },
  
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
  },
  gridCard: {
    backgroundColor: COLORS.white,
    width: (width - 48 - 15) / 2, 
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Soft Shadow
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  gridTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textMain },
  gridDesc: { fontSize: 11, color: COLORS.textSub, marginTop: 4, lineHeight: 15 },
});

export default AdminDashboardScreen;