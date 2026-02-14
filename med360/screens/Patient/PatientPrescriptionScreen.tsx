import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import SERVER_URL from '../../config';
// --- Type Definitions ---
type DosageSchedule = { morning: string; afternoon: string; night: string };
type PrescriptionItem = {
  id: string;
  medicationName: string;
  dosageSchedule: DosageSchedule;
  durationDays: number;
  instructions: string;
};
type Prescription = {
  id: string;
  dateIssued: string;
  doctorName: string;
  doctorDesignation: string;
  department: string;
  disease: string;
  status: "Current" | "History" | "Expired";
  items: PrescriptionItem[];
};
type TabProps = { label: string; count: number; active: boolean; onPress: () => void };

// --- Components ---
const TabButton: React.FC<TabProps> = ({ label, count, active, onPress }) => (
  <TouchableOpacity style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress} activeOpacity={0.8}>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{`${label} (${count})`}</Text>
  </TouchableOpacity>
);

const DosageCell: React.FC<{ dose: string }> = ({ dose }) => (
  <View style={styles.dosageCell}>
    <Text style={styles.dosageCellValue}>{dose === "0" ? "-" : dose}</Text>
  </View>
);

const PrescriptionCard: React.FC<{ prescription: Prescription }> = ({ prescription }) => {
  const [expanded, setExpanded] = useState(false);
  const icon = expanded ? "chevron-up" : "chevron-down";

  let statusColor = "#64748B";
  if (prescription.status === "Current") statusColor = "#00A896";
  if (prescription.status === "Expired") statusColor = "#E63946";

  return (
    <View style={[styles.card, { borderLeftColor: statusColor }]}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={styles.headerLeft}>
          <View style={styles.statusPill}>
            <Text style={[styles.statusText, { color: statusColor }]}>{prescription.status}</Text>
          </View>
          <Text style={styles.issueDate}>
            Issued: <Text style={{ fontWeight: "bold" }}>{prescription.dateIssued}</Text>
          </Text>
        </View>
        <Ionicons name={icon as any} size={20} color="#0F172A" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          <View style={styles.doctorInfoContainer}>
            <View style={styles.doctorTextColumn}>
              <Text style={styles.doctorTitle}>Prescribing Doctor</Text>
              <Text style={styles.doctorNameText}>{prescription.doctorName}</Text>
              <Text style={styles.doctorDetailText}>{prescription.doctorDesignation}</Text>
              <Text style={styles.doctorDetailText}>
                <Text style={{ fontWeight: "bold" }}>Dept:</Text> {prescription.department}
              </Text>
            </View>
            <View style={styles.logoSignatureContainer}>
              <View style={styles.hospitalLogoPlaceholder}>
                <FontAwesome5 name="hospital" size={20} color="#64748B" />
                <Text style={styles.placeholderText}>Hospital Logo</Text>
              </View>
            </View>
          </View>

          <View style={styles.diagnosisBox}>
            <MaterialIcons name="local-hospital" size={16} color="#475569" />
            <Text style={styles.diagnosisText}>
              Diagnosis / Notes: <Text style={{ fontWeight: "bold" }}>{prescription.disease}</Text>
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScrollViewContent}>
            <View>
              <View style={styles.tableRowHeader}>
                <Text style={[styles.tableCell, styles.medNameHeader]}>MEDICATION & INSTRUCTIONS</Text>
                <Text style={[styles.tableCell, styles.dosageHeader]}>M</Text>
                <Text style={[styles.tableCell, styles.dosageHeader]}>A</Text>
                <Text style={[styles.tableCell, styles.dosageHeader]}>N</Text>
                <Text style={[styles.tableCell, styles.durationHeader]}>DURATION</Text>
              </View>
              {prescription.items.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.medNameCell]}>
                    <Text style={styles.medicationRowName}>{item.medicationName}</Text>
                    <Text style={styles.medicationRowInstructions}>* {item.instructions}</Text>
                  </View>
                  <DosageCell dose={item.dosageSchedule.morning} />
                  <DosageCell dose={item.dosageSchedule.afternoon} />
                  <DosageCell dose={item.dosageSchedule.night} />
                  <View style={[styles.tableCell, styles.durationCell]}>
                    <Text style={styles.durationTextValue}>{item.durationDays}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const PatientPrescriptionScreen: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [activeTab, setActiveTab] = useState<Prescription["status"]>("Current");
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);

  // Get patientId from AsyncStorage
  const loadPatientId = async () => {
    try {
      const id = await AsyncStorage.getItem("PATIENT_ID");
      if (!id) throw new Error("Patient ID not found in storage");
      setPatientId(id);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Fetch prescriptions from backend
  const fetchPrescriptions = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/patient/prescriptions/${id}`);
      if (!response.ok) throw new Error("Failed to fetch prescriptions");
      const data = await response.json();
      console.log(data)
      // Map backend response to front-end format
      const formatted: Prescription[] = data.map((p: any) => ({
        id: p.id,
        dateIssued: new Date(p.dateIssued).toLocaleDateString(),
        doctorName: p.doctorName,
        doctorDesignation: p.doctorRole,
        department: p.doctorDepartment,
        disease: p.disease,
        status: p.status === "Current" ? "Current" : "History",
        items: p.medications.map((m: any, idx: number) => ({
          id: `m${idx}`,
          medicationName: m.name,
          dosageSchedule: {
            morning: m.dosageMorning,
            afternoon: m.dosageAfternoon,
            night: m.dosageNight,
          },
          durationDays: m.durationDays || 0,
          instructions: m.instructions || "",
        })),
      }));
      setPrescriptions(formatted);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientId();
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchPrescriptions(patientId);
    }
  }, [patientId]);

  const filteredPrescriptions = prescriptions.filter((p) =>
    activeTab === "Current" ? p.status === "Current" : p.status !== "Current"
  );

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Prescriptions</Text>
        <Text style={styles.headerSubtitle}>Review your medication history.</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TabButton
          label="Current"
          count={prescriptions.filter((p) => p.status === "Current").length}
          active={activeTab === "Current"}
          onPress={() => setActiveTab("Current")}
        />
        <TabButton
          label="History"
          count={prescriptions.filter((p) => p.status !== "Current").length}
          active={activeTab !== "Current"}
          onPress={() => setActiveTab("History")}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredPrescriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PrescriptionCard prescription={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <FontAwesome5 name="pills" size={40} color="#A1A1AA" />
              <Text style={styles.emptyText}>
                {activeTab === "Current" ? "No current prescriptions." : "No history available."}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default PatientPrescriptionScreen;


// --- Stylesheet ---

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: "#F4F6F8",
    },

    // --- Header Styles ---
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1E3A8A",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 5,
    },

    // --- Tabs Styles ---
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: '#E2E8F0',
        borderRadius: 10,
        marginHorizontal: 16,
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
        backgroundColor: "#FFFFFF",
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
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginBottom: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderLeftWidth: 5,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        backgroundColor: '#E2E8F0',
        marginRight: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    issueDate: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },

    // --- Card Body Styles (Expanded) ---
    cardBody: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        marginTop: 5,
        paddingTop: 10,
    },

    // Doctor & Hospital Info
    doctorInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    doctorTextColumn: {
        flex: 1,
    },
    doctorTitle: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: 2,
    },
    doctorNameText: {
        fontSize: 16,
        color: '#1E3A8A',
        fontWeight: '700',
    },
    doctorDetailText: {
        fontSize: 13,
        color: '#475569',
        marginTop: 2,
    },
    logoSignatureContainer: {
        width: 100,
        alignItems: 'flex-end',
    },
    hospitalLogoPlaceholder: {
        width: 80,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E2E8F0',
        borderRadius: 5,
        marginBottom: 10,
    },

    // Diagnosis Box
    diagnosisBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 10,
        backgroundColor: '#F0F9FF',
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    diagnosisText: {
        flex: 1,
        fontSize: 14,
        color: '#1E3A8A',
        fontWeight: '500',
        marginLeft: 8,
    },

    medicationListHeader: {
        marginBottom: 10,
    },
    medicationListTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },

    // --- Medication Table Styles ---
    tableScrollViewContent: {
        paddingBottom: 10,
    },
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        paddingVertical: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingVertical: 10,
        alignItems: 'center',
    },
    tableCell: {
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    medNameHeader: {
        width: 170,
        fontWeight: 'bold',
        fontSize: 11,
        color: '#475569',
        textAlign: 'left',
        paddingLeft: 10,
    },
    dosageHeader: {
        width: 50,
        fontWeight: 'bold',
        fontSize: 11,
        color: '#475569',
        textAlign: 'center',
    },
    durationHeader: {
        width: 80,
        fontWeight: 'bold',
        fontSize: 11,
        color: '#475569',
        textAlign: 'center',
        paddingRight: 5,
    },
    medNameCell: {
        width: 170,
        paddingLeft: 10,
        alignItems: 'flex-start',
    },
    medicationRowName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E3A8A',
    },
    medicationRowInstructions: {
        fontSize: 11,
        color: '#64748B',
        fontStyle: 'italic',
        marginTop: 3,
    },
    dosageCell: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dosageCellValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0F172A',
    },
    durationCell: {
        width: 80,
    },
    durationTextValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },

    // Signature Placeholder
    signatureContainer: {
        alignItems: 'flex-end',
        marginTop: 20,
        marginBottom: 20,
    },
    signaturePlaceholder: {
        width: 150,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E2E8F0',
        borderRadius: 5,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#94A3B8',
    },
    placeholderText: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 5,
    },

    // --- Utility Bar (Download/Share) ---
    utilityBarContainer: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    utilityBarTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 10,
    },
    utilityBarActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#EBF4FF',
        marginBottom: 8,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 5,
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