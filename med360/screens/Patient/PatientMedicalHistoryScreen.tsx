import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SERVER_URL from "../../config";

const PRIMARY_TEAL = "#0D9488";
const PRIMARY_DARK = "#004912";
const BORDER_COLOR = "#E2E8F0";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.88; // Large enough to see, small enough to hint at next card

const PatientMedicalHistoryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Records" | "Vitals" | "Prescriptions">("Vitals");
  const [patientData, setPatientData] = useState<any>(null);
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [prescriptionData, setPrescriptionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const patientId = await AsyncStorage.getItem("PATIENT_ID");
        if (!patientId) return;

        const [profRes, presRes, vitRes] = await Promise.all([
          fetch(`${SERVER_URL}/patient/${patientId}`),
          fetch(`${SERVER_URL}/patient/prescriptions/${patientId}`),
          fetch(`${SERVER_URL}/patient/vitals/all/${patientId}`),
        ]);

        if (profRes.ok) setPatientData(await profRes.json());
        if (presRes.ok) setPrescriptionData(await presRes.json());
        
        if (vitRes.ok) {
          const vData = await vitRes.json();
          // Ensure vitalsData is always an array even if backend returns a single object
          setVitalsData(Array.isArray(vData) ? vData : [vData]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
           + "  •  " + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={PRIMARY_TEAL} /></View>;

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" />
      <ScrollView stickyHeaderIndices={[1]}>
        
        {/* PROFILE HEADER */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{patientData?.name?.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{patientData?.name}</Text>
              <Text style={styles.headerId}>Patient ID: {patientData?.user_id}</Text>
            </View>
          </View>
        </View>

        {/* STICKY TABS */}
        <View style={styles.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
            {["Vitals", "Prescriptions", "Records"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as any)}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              >
                <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* HORIZONTAL CAROUSEL CONTENT */}
        <View style={styles.contentArea}>
          {activeTab === "Vitals" && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH + 20} decelerationRate="fast">
              {vitalsData.map((item, index) => (
                <View key={index} style={styles.vitalCard}>
                  <View style={styles.cardTimestamp}>
                    <Ionicons name="calendar" size={14} color={PRIMARY_TEAL} />
                    <Text style={styles.dateText}>{formatDateTime(item.created_at)}</Text>
                  </View>
                  
                  <View style={styles.vitalGrid}>
                    <VitalBox label="Heart Rate" value={item.heart_rate} unit="bpm" color="#FEE2E2" iconColor="#EF4444" icon="heart" />
                    <VitalBox label="Blood Pressure" value={item.blood_pressure} unit="mmHg" color="#E0F2FE" iconColor="#0EA5E9" icon="water" />
                    <VitalBox label="Temperature" value={item.temperature} unit="°C" color="#FEF3C7" iconColor="#D97706" icon="thermometer" />
                    <VitalBox label="SpO2" value={item.spo2} unit="%" color="#DCFCE7" iconColor="#22C55E" icon="speedometer" />
                    <VitalBox label="Blood Sugar" value={item.blood_sugar} unit="mg/dL" color="#F3E8FF" iconColor="#A855F7" icon="flask" />
                    <VitalBox label="Resp. Rate" value={item.respiration_rate} unit="/min" color="#F1F5F9" iconColor="#64748B" icon="body" />
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {activeTab === "Prescriptions" && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH + 20} decelerationRate="fast">
              {prescriptionData.map((item) => (
                <View key={item.id} style={styles.prescriptionCard}>
                  <View style={styles.prescHeader}>
                    <Text style={styles.diseaseText}>{item.disease || "Routine Checkup"}</Text>
                    <View style={styles.statusBadge}><Text style={styles.statusText}>{item.status}</Text></View>
                  </View>
                  
                  <Text style={styles.doctorName}>Dr. {item.doctorName}</Text>
                  
                  <View style={styles.medsContainer}>
                    {item.medications.map((med: any, i: number) => (
                      <View key={i} style={styles.medItem}>
                        <MaterialCommunityIcons name="pill" size={16} color={PRIMARY_TEAL} />
                        <Text style={styles.medNameText}>{med.name} - <Text style={styles.medDoseText}>{med.dosage}</Text></Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardFooter}>
                    <Ionicons name="time-outline" size={14} color="#94A3B8" />
                    <Text style={styles.footerTime}>{formatDateTime(item.dateIssued)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

/* Reusable Component for the Bordered Box */
const VitalBox = ({ label, value, unit, color, iconColor, icon }: any) => (
  <View style={[styles.vBox, { borderColor: iconColor + "40" }]}>
    <View style={[styles.vIconCircle, { backgroundColor: color }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={styles.vValue}>{value || '--'} <Text style={styles.vUnit}>{unit}</Text></Text>
    <Text style={styles.vLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  profileHeader: { backgroundColor: PRIMARY_DARK, padding: 25, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 15 },
  avatar: { width: 60, height: 60, borderRadius: 20, backgroundColor: PRIMARY_TEAL, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  headerName: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  headerId: { color: "#94A3B8", fontSize: 13, marginTop: 4 },

  tabBar: { backgroundColor: "#F8FAFC", paddingVertical: 15 },
  tabContainer: { paddingHorizontal: 20, gap: 10 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: "#FFF", borderWidth: 1, borderColor: BORDER_COLOR },
  tabBtnActive: { backgroundColor: PRIMARY_TEAL, borderColor: PRIMARY_TEAL },
  tabBtnText: { color: "#64748B", fontWeight: "600" },
  tabBtnTextActive: { color: "#FFF" },

  contentArea: { paddingLeft: 20 },

  /* Vitals Card Styles */
  vitalCard: {margin:5, backgroundColor: "#FFF", width: CARD_WIDTH, borderRadius: 24, padding: 20, marginRight: 15, elevation: 7, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  cardTimestamp: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20, backgroundColor: "#F0FDFA", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  dateText: { color: PRIMARY_TEAL, fontSize: 12, fontWeight: "700" },
  vitalGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  
  /* Vital Box Styles */
  vBox: { width: "47%", borderWidth: 1.5, borderRadius: 18, padding: 12, alignItems: "flex-start" },
  vIconCircle: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  vValue: { fontSize: 16, fontWeight: "800", color: PRIMARY_DARK },
  vUnit: { fontSize: 10, color: "#64748B", fontWeight: "400" },
  vLabel: { fontSize: 11, color: "#94A3B8", marginTop: 2, fontWeight: "600" },

  /* Prescription Card Styles */
  prescriptionCard: { backgroundColor: "#FFF", width: CARD_WIDTH, borderRadius: 24, padding: 20, marginRight: 15, elevation: 4 },
  prescHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  diseaseText: { fontSize: 18, fontWeight: "700", color: PRIMARY_DARK, flex: 1 },
  statusBadge: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "700", color: "#475569" },
  doctorName: { fontSize: 14, color: PRIMARY_TEAL, fontWeight: "600", marginTop: 4 },
  medsContainer: { marginTop: 15, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  medItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  medNameText: { fontSize: 14, color: "#334155", fontWeight: "600" },
  medDoseText: { color: "#64748B", fontWeight: "400" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 15 },
  footerTime: { fontSize: 11, color: "#94A3B8", fontWeight: "500" }
});

export default PatientMedicalHistoryScreen;