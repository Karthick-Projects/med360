import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SERVER_URL from "../../config";

const PRIMARY_TEAL = "#0D9488";
const PRIMARY_DARK = "#004912";
const BORDER_COLOR = "#E2E8F0";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.88;

const DoctorPatientLookupScreen: React.FC = () => {
  const [searchId, setSearchId] = useState("");
  const [activeTab, setActiveTab] = useState<"Vitals" | "Prescriptions" | "Records">("Vitals");
  const [patientData, setPatientData] = useState<any>(null);
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [prescriptionData, setPrescriptionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      Alert.alert("Required", "Please enter a Patient ID");
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      const [profRes, presRes, vitRes] = await Promise.all([
        fetch(`${SERVER_URL}/patient/${searchId}`),
        fetch(`${SERVER_URL}/patient/prescriptions/${searchId}`),
        fetch(`${SERVER_URL}/patient/vitals/all/${searchId}`),
      ]);
      if (profRes.ok) {
        setPatientData(await profRes.json());
      } else {
        setPatientData(null);
        Alert.alert("Not Found", "No patient found with this ID.");
      }

      if (presRes.ok) setPrescriptionData(await presRes.json());
      if (vitRes.ok) {
        const vData = await vitRes.json();
        setVitalsData(Array.isArray(vData) ? vData : [vData]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      Alert.alert("Error", "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
           + "  •  " + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />
      
      {/* SEARCH HEADER */}
      <View style={styles.searchHeader}>
        <Text style={styles.dashboardTitle}>Doctor Dashboard</Text>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Patient ID (e.g. PID123)"
            value={searchId}
            onChangeText={setSearchId}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Lookup</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView stickyHeaderIndices={[1]}>
        {/* PATIENT PROFILE SUMMARY */}
        {patientData && (
          <View style={styles.profileSummary}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{patientData?.name?.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.patientName}>{patientData?.name}</Text>
              <Text style={styles.patientSub}>DOB: {patientData?.dob}</Text>
            </View>
          </View>
        )}

        {/* TABS */}
        {patientData && (
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
        )}

        {/* CONTENT AREA */}
        <View style={styles.contentArea}>
          {loading ? (
            <ActivityIndicator size="large" color={PRIMARY_TEAL} style={{ marginTop: 50 }} />
          ) : !hasSearched ? (
            <View style={styles.emptyState}>
              <Ionicons name="person-add-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>Enter a Patient ID above to view history</Text>
            </View>
          ) : patientData ? (
            <>
              {activeTab === "Vitals" && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH + 20} decelerationRate="fast">
                  {vitalsData.length > 0 ? vitalsData.map((item, index) => (
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
                      </View>
                    </View>
                  )) : <Text style={styles.noDataText}>No vital records found.</Text>}
                </ScrollView>
              )}

              {activeTab === "Prescriptions" && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH + 20} decelerationRate="fast">
                   {prescriptionData.length > 0 ? prescriptionData.map((item) => (
                    <View key={item.id} style={styles.prescriptionCard}>
                      <View style={styles.prescHeader}>
                        <Text style={styles.diseaseText}>{item.disease || "Routine Checkup"}</Text>
                        <View style={styles.statusBadge}><Text style={styles.statusText}>{item.status}</Text></View>
                      </View>
                      <Text style={styles.doctorName}>Dr. {item.doctorName}</Text>
                      <View style={styles.medsContainer}>
                        {item.medications?.map((med: any, i: number) => (
                          <View key={i} style={styles.medItem}>
                            <MaterialCommunityIcons name="pill" size={16} color={PRIMARY_TEAL} />
                            <Text style={styles.medNameText}>{med.name} - {med.dosage}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.cardFooter}>
                        <Ionicons name="time-outline" size={14} color="#94A3B8" />
                        <Text style={styles.footerTime}>{formatDateTime(item.dateIssued)}</Text>
                      </View>
                    </View>
                  )) : <Text style={styles.noDataText}>No prescription records found.</Text>}
                </ScrollView>
              )}
            </>
          ) : null}
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
  searchHeader: { backgroundColor: "#FFF", padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  dashboardTitle: { fontSize: 24, fontWeight: "800", color: PRIMARY_DARK, marginBottom: 15 },
  searchBarContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 15, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: "#1E293B" },
  searchBtn: { backgroundColor: PRIMARY_TEAL, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  searchBtnText: { color: "#FFF", fontWeight: "700" },

  profileSummary: { flexDirection: "row", alignItems: "center", padding: 20, gap: 15, backgroundColor: "#FFF" },
  avatar: { width: 55, height: 55, borderRadius: 15, backgroundColor: PRIMARY_TEAL, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  patientName: { fontSize: 18, fontWeight: "700", color: PRIMARY_DARK },
  patientSub: { color: "#64748B", fontSize: 13, marginTop: 2 },

  tabBar: { backgroundColor: "#FFF", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  tabContainer: { paddingHorizontal: 20, gap: 10 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, backgroundColor: "#F1F5F9" },
  tabBtnActive: { backgroundColor: PRIMARY_TEAL },
  tabBtnText: { color: "#64748B", fontWeight: "600" },
  tabBtnTextActive: { color: "#FFF" },

  contentArea: { paddingVertical: 20, paddingLeft: 20 },
  vitalCard: { backgroundColor: "#FFF", width: CARD_WIDTH, borderRadius: 24, padding: 20, marginRight: 15, elevation: 4 },
  cardTimestamp: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 15, backgroundColor: "#F0FDFA", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  dateText: { color: PRIMARY_TEAL, fontSize: 12, fontWeight: "700" },
  vitalGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  vBox: { width: "48%", borderWidth: 1.5, borderRadius: 15, padding: 10 },
  vIconCircle: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 5 },
  vValue: { fontSize: 15, fontWeight: "800", color: PRIMARY_DARK },
  vUnit: { fontSize: 10, color: "#64748B" },
  vLabel: { fontSize: 11, color: "#94A3B8" },

  prescriptionCard: { backgroundColor: "#FFF", width: CARD_WIDTH, borderRadius: 24, padding: 20, marginRight: 15, elevation: 7,margin:5 },
  prescHeader: { flexDirection: "row", justifyContent: "space-between" },
  diseaseText: { fontSize: 16, fontWeight: "700", color: PRIMARY_DARK },
  statusBadge: { backgroundColor: "#F1F5F9", padding: 5, borderRadius: 5 },
  statusText: { fontSize: 10, color: "#475569" },
  doctorName: { fontSize: 13, color: PRIMARY_TEAL, marginTop: 2 },
  medsContainer: { marginVertical: 10, paddingVertical: 5, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  medItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  medNameText: { fontSize: 13, color: "#334155" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerTime: { fontSize: 10, color: "#94A3B8" },

  emptyState: { alignItems: "center", marginTop: 100, marginRight: 20 },
  emptyText: { color: "#94A3B8", marginTop: 10, fontSize: 14 },
  noDataText: { color: "#64748B", fontStyle: "italic", marginLeft: 10 }
});

export default DoctorPatientLookupScreen;