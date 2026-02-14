import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import SERVER_URL from '../../config';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 25;

/* ---------------- TYPES ---------------- */

type DashboardCardProps = {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  color: string;
  shadowColor: string;
  variant?: "default" | "rectangle";
};

type QuickStatProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
};

type PatientInfo = {
  id: string;
  name: string;
  time: string;
  reason: string;
  avatar: string;
};

/* ---------------- MOCK DATA ---------------- */

const QUICK_STATS_DATA: QuickStatProps[] = [
  {
    label: "Today's Appts",
    value: 12,
    icon: <Ionicons name="calendar" size={18} color="#fff" />,
    color: "#4A90E2",
  },
  {
    label: "Pending Results",
    value: 4,
    icon: <FontAwesome5 name="flask" size={16} color="#fff" />,
    color: "#FF8C00",
  },
  {
    label: "New Patients",
    value: 2,
    icon: <Ionicons name="person-add" size={18} color="#fff" />,
    color: "#50C878",
  },
];

const UPCOMING_PATIENTS: PatientInfo[] = [
  {
    id: "1",
    name: "Aarav Sharma",
    time: "10:00 AM",
    reason: "Routine Checkup",
    avatar: "https://via.placeholder.com/150/4A90E2/ffffff?text=AS",
  },
  {
    id: "2",
    name: "Priya Patel",
    time: "11:30 AM",
    reason: "Follow-up",
    avatar: "https://via.placeholder.com/150/FF8C00/ffffff?text=PP",
  },
  {
    id: "3",
    name: "Mohan Lal",
    time: "02:00 PM",
    reason: "Stomach Pain",
    avatar: "https://via.placeholder.com/150/6A5ACD/ffffff?text=ML",
  },
];

/* ---------------- COMPONENTS ---------------- */

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  onPress,
  color,
  shadowColor,
  variant = "default",
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        variant === "rectangle" && styles.rectangleCard,
        { backgroundColor: color, shadowColor, elevation: 12, shadowRadius: 8 },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "90" }]}>
        {icon}
      </View>

      <Text
        style={[styles.cardText, variant === "rectangle" && { marginLeft: 12 }]}
      >
        {title || ""}
      </Text>

      {variant === "rectangle" && (
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      )}
    </TouchableOpacity>
  );
};

const QuickStatCard: React.FC<QuickStatProps> = ({
  label,
  value,
  icon,
  color,
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color }]}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={styles.statValue}>{value != null ? String(value) : "0"}</Text>
      <Text style={styles.statLabel}>{label || ""}</Text>
    </View>
  </View>
);

const PatientRow: React.FC<PatientInfo> = ({
  name,
  time,
  reason,
  avatar,
}) => (
  <TouchableOpacity style={styles.patientRow} activeOpacity={0.7}>
    <Image source={{ uri: avatar }} style={styles.patientAvatar} />
    <View style={{ flex: 1 }}>
      <Text style={styles.patientName}>{name || ""}</Text>
      <Text style={styles.patientReason}>{reason || ""}</Text>
    </View>
    <View style={styles.patientTimeContainer}>
      <Text style={styles.patientTime}>{time || ""}</Text>
    </View>
  </TouchableOpacity>
);

/* ---------------- MAIN SCREEN ---------------- */

const DoctorDashboard = ({ navigation, route }: any) => {
  const { doctorName } = route.params;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user_id = await AsyncStorage.getItem("PATIENT_ID");
      try {
        const response = await fetch(`${SERVER_URL}/doctors/${user_id}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

  if (!user) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 20 }}>Failed to load user</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>
                Welcome Back, {doctorName || ""}
              </Text>
              <Text style={styles.headerSubtitle}>
                You have{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {String(QUICK_STATS_DATA[0].value || 0)}
                </Text>{" "}
                appointments today
              </Text>
            </View>

            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                overflow: "hidden",
              }}
            >
              {user.profile_pic ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${user.profile_pic}` }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              ) : (
                <View style={{ flex: 1, backgroundColor: "#ccc" }} />
              )}
            </View>
          </View>
        </View>

        {/* QUICK STATS */}
        <View style={styles.statsWrapper}>
          <View style={styles.statsContainer}>
            {QUICK_STATS_DATA.map((stat, index) => (
              <QuickStatCard key={index} {...stat} />
            ))}
          </View>
        </View>

        {/* RECTANGLE CARD */}
        <View style={styles.section}>
          <DashboardCard
            title="View Appointments"
            color="#4A90E2"
            shadowColor="#003f7f"
            variant="rectangle"
            icon={<Ionicons name="calendar" size={30} color="#fff" />}
            onPress={() => navigation.navigate("ViewAppointmentsScreen")}
          />
        </View>

        {/* GRID CARDS */}
        <View style={styles.cardsContainer}>
          <DashboardCard
            title="Patient Medical History"
            color="#6A5ACD"
            shadowColor="#4b3e94"
            icon={<FontAwesome5 name="file-medical" size={24} color="#fff" />}
            onPress={() => navigation.navigate("PatientMedicalHistory")}
          />

          <DashboardCard
            title="Lab Test Results"
            color="#FF8C00"
            shadowColor="#cc7000"
            icon={<FontAwesome5 name="flask" size={24} color="#fff" />}
            onPress={() => navigation.navigate("PatientLabResults")}
          />

          <DashboardCard
            title="Create Prescription"
            color="#E63946"
            shadowColor="#b82d38"
            icon={<Ionicons name="document-text" size={26} color="#fff" />}
            onPress={() =>
              navigation.navigate("CreateDigitalPrescriptionScreen", {
                doctorName,
          doctorRole: user.role,
          doctorDepartment: user.roleOrSpec
        })
            }
          />

          <DashboardCard
            title="Vitals & Metrics"
            color="#2A9D8F"
            shadowColor="#1f7a6a"
            icon={<MaterialIcons name="monitor-heart" size={26} color="#fff" />}
            onPress={() => navigation.navigate("VitalsScreen")}
          />
        </View>

        {/* PATIENT LIST */}
        <Text style={styles.sectionTitle}>Upcoming Patients</Text>
        {UPCOMING_PATIENTS.map((p) => (
          <PatientRow key={p.id} {...p} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorDashboard;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  header: {
    backgroundColor: "#1B2C57",
    padding: 20,
    paddingTop: 50,
    paddingBottom: 60,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    marginBottom: 10,
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#BCCAEF",
    marginTop: 6,
    fontSize: 14,
  },

  statsWrapper: {
    marginTop: -40,
    paddingHorizontal: 15,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    width: width / 3 - 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  statValue: {
    fontWeight: "900",
    fontSize: 18,
    color: "#1B2C57",
  },

  statLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },

  section: {
    paddingHorizontal: 15,
    marginTop: 25,
  },

  sectionTitle: {
    marginLeft: 15,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: "800",
    color: "#1B2C57",
  },

  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginTop: 20,
  },

  card: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    justifyContent: "space-between",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
  },

  rectangleCard: {
    width: "100%",
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  iconContainer: {
    padding: 10,
    borderRadius: 12,
  },

  cardText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    flex: 1,
  },

  patientRow: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },

  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
  },

  patientName: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1B2C57",
  },

  patientReason: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  patientTimeContainer: {
    backgroundColor: "#F0F0F5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  patientTime: {
    fontWeight: "700",
    fontSize: 13,
    color: "#4A90E2",
  },

  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#F8E5A7",
  },
});
