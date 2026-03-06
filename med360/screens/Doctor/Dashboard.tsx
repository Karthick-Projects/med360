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
import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome } from "@expo/vector-icons"; // Added FontAwesomeimport SERVER_URL from '../../config';
import AsyncStorage from "@react-native-async-storage/async-storage";
import SERVER_URL from '../../config';
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
              <Text style={styles.headerTitle}>Welcome Back,</Text>
              <Text style={styles.headerTitle}>{doctorName || ""}</Text>
            </View>

            <View style={styles.profilePicWrapper}>
              {user.profile_pic ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${user.profile_pic}` }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person-circle-outline" size={120} color="#9ca3af" />
              )}
            </View>
          </View>
        </View>

        {/* RECTANGLE CARD - MAIN ACTION */}
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
          
          {/* NEW: IN-PATIENTS CARD */}
          <DashboardCard
            title="In-Patients (IPD)"
            color="#00A896"
            shadowColor="#006d61"
            icon={<FontAwesome5 name="procedures" size={24} color="#fff" />}
            onPress={() => navigation.navigate("DoctorInPatientsScreen")}
          />

          <DashboardCard
            title="Patient Medical History"
            color="#6A5ACD"
            shadowColor="#4b3e94"
            icon={<FontAwesome5 name="file-medical" size={24} color="#fff" />}
            onPress={() => navigation.navigate("DoctorPatientLookupScreen")}
          />

          <DashboardCard
            title="Lab Test Results"
            color="#FF8C00"
            shadowColor="#cc7000"
            icon={<FontAwesome5 name="flask" size={24} color="#fff" />}
            onPress={() => navigation.navigate("DoctorLabLookupScreen")}
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
            onPress={() => navigation.navigate("DoctorVitalsLookup")}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* ---------------- UPDATED STYLES ---------------- */

const styles = StyleSheet.create({
  /* ... previous styles remain same ... */
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  header: {
    backgroundColor: "#1B2C57",
    padding: 20,
    paddingTop: 50,
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
  profilePicWrapper: {
    width: 100, // Adjusted slightly for better fit
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff"
  },
  section: {
    paddingHorizontal: 15,
    marginTop: 25,
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
    alignSelf: 'flex-start'
  },
  cardText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15, // Reduced slightly to accommodate longer text like "In-Patients"
    flexShrink: 1,
  },
});

export default DoctorDashboard;