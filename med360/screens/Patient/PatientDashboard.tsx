import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation,RouteProp  } from "@react-navigation/native";
import { COLORS, SHADOW } from "../theme";


type PatientDashboardRouteProp = RouteProp<
  RootStackParamList,
  'PatientDashboard'
>;

type Props = {
  route: PatientDashboardRouteProp;
};

type RootStackParamList = {
  PatientDashboard: { patientName: string };
};

/* ---------------- UTILITIES ---------------- */

const getGreeting = () => {
  const hour = new Date().getHours();
  let greeting = "";
  let iconName: "sunny" | "cloudy-night" | "cloudy" = "sunny";

  if (hour < 12) {
    greeting = "Good Morning";
    iconName = "sunny";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
    iconName = "cloudy";
  } else {
    greeting = "Good Evening";
    iconName = "cloudy-night";
  }

  return { greeting, iconName };
};

const getCurrentDate = () => {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
};

/* ---------------- FEATURE CARD ---------------- */

type FeatureCardProps = {
  iconName: string;
  iconSet: "Ionicons" | "MaterialIcons" | "FontAwesome5";
  title: string;
  subtitle: string;
  onPress: () => void;
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  iconName,
  iconSet,
  title,
  subtitle,
  onPress,
}) => {
  const IconComponent =
    iconSet === "Ionicons"
      ? Ionicons
      : iconSet === "MaterialIcons"
      ? MaterialIcons
      : FontAwesome5;

  return (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrapper}>
        <IconComponent
          name={iconName as any}
          size={26}
          color={COLORS.TEXT_ON_BRAND}
        />
      </View>

      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
};


/* ---------------- MAIN SCREEN ---------------- */

const PatientDashboard: React.FC<Props> = ({ route }) => {
  const { patientName } = route.params;
  const navigation = useNavigation<any>();
  const { greeting, iconName } = getGreeting();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
            <Ionicons
              name={iconName}
              size={22}
              color={COLORS.TEXT_ON_BRAND}
            />
          </View>

          <View style={styles.greetingBlock}>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.userName}>{patientName}</Text>
          </View>
        </View>

        {/* QUICK ACTION */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionHeader}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.primaryActionCard}
            onPress={() => navigation.navigate("BookAppointment")}
            activeOpacity={0.85}
          >
            <Ionicons
              name="calendar-outline"
              size={28}
              color={COLORS.TEXT_ON_BRAND}
            />

            <View style={styles.primaryActionRight}>
              <Text style={styles.primaryActionCardTitle}>
                Book New Appointment
              </Text>
              <Text style={styles.primaryActionCardSubtitle}>
                Schedule your next visit easily
              </Text>
            </View>

            <Ionicons
              name="arrow-forward-circle"
              size={28}
              color={COLORS.TEXT_ON_BRAND}
            />
          </TouchableOpacity>
        </View>

        {/* HEALTH RECORDS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>My Health Records</Text>

          <View style={styles.actionGrid}>
            <FeatureCard
              iconName="file-tray-full"
              iconSet="Ionicons"
              title="Medical History"
              subtitle="Past diagnoses & visits"
              onPress={() => navigation.navigate("PatientMedicalHistory")}
            />

            <FeatureCard
              iconName="flask"
              iconSet="Ionicons"
              title="Lab Reports"
              subtitle="View test results"
              onPress={() => navigation.navigate("PatientLabResults")}
            />

            <FeatureCard
              iconName="receipt-long"
              iconSet="MaterialIcons"
              title="Prescriptions"
              subtitle="Current medicines"
              onPress={() => navigation.navigate("PatientPrescriptions")}
            />

            <FeatureCard
              iconName="heartbeat"
              iconSet="FontAwesome5"
              title="Vitals & Metrics"
              subtitle="BP, Sugar trends"
              onPress={() => navigation.navigate("VitalsScreen")}
            />
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientDashboard;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BG_PRIMARY,
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  /* HEADER */
  header: {
    backgroundColor: COLORS.BRAND_PRIMARY,
    padding: 25,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: COLORS.BRAND_PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },

  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  dateText: {
    fontSize: 14,
    color: COLORS.TEXT_SUBTLE,
    fontWeight: "500",
  },

  greetingBlock: {
    alignItems: "flex-start",
  },

  greetingText: {
    fontSize: 18,
    color: COLORS.TEXT_SUBTLE,
    fontWeight: "700",
  },

  userName: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.TEXT_ON_BRAND,
  },

  /* SECTIONS */
  actionSection: {
    marginBottom: 25,
  },

  section: {
    marginBottom: 25,
  },

  sectionHeader: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  /* PRIMARY ACTION */
  primaryActionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.BRAND_PRIMARY,
    padding: 20,
    borderRadius: 16,
    ...SHADOW.card,
  },

  primaryActionRight: {
    flex: 1,
    marginHorizontal: 15,
  },

  primaryActionCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.TEXT_ON_BRAND,
  },

  primaryActionCardSubtitle: {
    fontSize: 13,
    color: COLORS.TEXT_SUBTLE,
    marginTop: 3,
  },

  /* FEATURE CARDS */
  featureCard: {
    width: "48%",
    backgroundColor: COLORS.BG_CARD,
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    ...SHADOW.card,
  },

  iconWrapper: {
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: COLORS.BRAND_PRIMARY,
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    marginTop: 5,
  },

  featureSubtitle: {
    fontSize: 12,
    color: COLORS.TEXT_MUTED,
    marginTop: 2,
  },
});
