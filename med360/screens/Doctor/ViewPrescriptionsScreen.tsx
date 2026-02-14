import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

// --- Type Definitions ---

type PrescriptionItem = {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string;
};

type Prescription = {
  id: string;
  dateIssued: string;
  doctorName: string;
  status: "Current" | "History" | "Expired";
  items: PrescriptionItem[];
};

type TabProps = {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
};

// --- Dummy Data ---

const PATIENT_NAME = "Jane Doe";

const DUMMY_PRESCRIPTIONS: Prescription[] = [
  {
    id: "P001",
    dateIssued: "20 Dec 2025",
    doctorName: "Dr. Alok Sharma",
    status: "Current",
    items: [
      { id: 'm1', medicationName: "Atorvastatin 10mg", dosage: "10mg", frequency: "OD (Night)", instructions: "Take once daily after dinner. Continue for 3 months." },
      { id: 'm2', medicationName: "Metformin 500mg", dosage: "500mg", frequency: "BD (Twice Daily)", instructions: "Take after breakfast and dinner." },
    ],
  },
  {
    id: "P002",
    dateIssued: "10 Nov 2025",
    doctorName: "Dr. Alok Sharma",
    status: "History",
    items: [
      { id: 'm3', medicationName: "Amoxicillin 500mg", dosage: "500mg", frequency: "TDS (Thrice Daily)", instructions: "Take for 7 days only, with food." },
    ],
  },
  {
    id: "P003",
    dateIssued: "01 Sep 2025",
    doctorName: "Dr. Priya Varma",
    status: "Expired",
    items: [
      { id: 'm4', medicationName: "Lisinopril 5mg", dosage: "5mg", frequency: "OD", instructions: "Discontinued as per follow-up on Nov 10." },
    ],
  },
];

// --- Reusable Components ---

const TabButton: React.FC<TabProps> = ({ label, count, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label} ({count})
    </Text>
  </TouchableOpacity>
);

/**
 * @description Detailed Card component for a single prescription.
 */
const PrescriptionCard: React.FC<{
  prescription: Prescription;
}> = ({ prescription }) => {
  const [expanded, setExpanded] = useState(false);
  const icon = expanded ? "chevron-up" : "chevron-down";
  
  let statusColor = '#64748B'; // Default Gray
  if (prescription.status === 'Current') statusColor = '#50C878'; // Green
  if (prescription.status === 'Expired') statusColor = '#E63946'; // Red

  return (
    <View style={[styles.card, { borderLeftColor: statusColor }]}>
      {/* Summary Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={styles.statusPill}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {prescription.status}
            </Text>
          </View>
          <Text style={styles.issueDate}>Issued: {prescription.dateIssued}</Text>
        </View>

        <Ionicons name={icon as any} size={20} color="#0F172A" />
      </TouchableOpacity>
      
      {/* Details (Collapsed/Expanded) */}
      {expanded && (
        <View style={styles.cardBody}>
            <View style={styles.doctorInfo}>
                <MaterialIcons name="person" size={16} color="#64748B" />
                <Text style={styles.doctorText}>Prescribed by: {prescription.doctorName}</Text>
            </View>
          
            <View style={styles.medicationListHeader}>
                <Text style={styles.medicationListTitle}>Medication Items ({prescription.items.length})</Text>
            </View>
            
            {/* List of Medications */}
            {prescription.items.map((item, index) => (
                <View key={item.id} style={styles.medicationItem}>
                    <Ionicons name="tablet-landscape-outline" size={16} color="#1E3A8A" style={{marginRight: 8}} />
                    <View style={styles.medicationDetails}>
                        <Text style={styles.medicationName}>{item.medicationName}</Text>
                        <View style={styles.dosageRow}>
                            <Text style={styles.dosageText}>Dose: **{item.dosage}** | </Text>
                            <Text style={styles.dosageText}>Freq: **{item.frequency}**</Text>
                        </View>
                        <Text style={styles.instructionsText}>
                            * {item.instructions}
                        </Text>
                    </View>
                </View>
            ))}

            <TouchableOpacity style={styles.printButton}>
                <Ionicons name="document-text-outline" size={16} color="#1E3A8A" />
                <Text style={styles.printButtonText}>View/Download PDF</Text>
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


// --- Main Screen Component ---

const ViewPrescriptionsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Prescription['status']>("Current");
  
  // Calculate counts for tabs
  const currentCount = DUMMY_PRESCRIPTIONS.filter(p => p.status === 'Current').length;
  const historyCount = DUMMY_PRESCRIPTIONS.filter(p => p.status === 'History').length + DUMMY_PRESCRIPTIONS.filter(p => p.status === 'Expired').length;

  const filteredPrescriptions = DUMMY_PRESCRIPTIONS
    .filter(p => {
      if (activeTab === 'History') return p.status !== 'Current';
      return p.status === activeTab;
    })
    .sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()); // Sort by newest first

  const renderItem = ({ item }: { item: Prescription }) => (
    <PrescriptionCard prescription={item} />
  );

  return (
    <View style={styles.screenContainer}>
        {/* Header */}
        <View style={styles.header}>
            <Text style={styles.headerTitle}>My Prescriptions</Text>
            <Text style={styles.headerSubtitle}>
                Review your current and past medication history.
            </Text>
        </View>

        {/* Tabs Container */}
        <View style={styles.tabsContainer}>
            <TabButton
                label="Current"
                count={currentCount}
                active={activeTab === "Current"}
                onPress={() => setActiveTab("Current")}
            />
            <TabButton
                label="History"
                count={historyCount}
                active={activeTab !== "Current"}
                onPress={() => setActiveTab("History")}
            />
        </View>

        {/* Prescription List */}
        <FlatList
            data={filteredPrescriptions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyBox}>
                    <FontAwesome5 name="pills" size={40} color="#A1A1AA" />
                    <Text style={styles.emptyText}>
                        {activeTab === 'Current' ? 'No current ongoing prescriptions.' : 'No prescription history available.'}
                    </Text>
                </View>
            }
            showsVerticalScrollIndicator={false}
        />
    </View>
  );
};

export default ViewPrescriptionsScreen;

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
  doctorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 10,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
  },
  doctorText: {
      fontSize: 14,
      color: '#475569',
      fontWeight: '600',
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

  medicationItem: {
      flexDirection: 'row',
      marginBottom: 15,
      padding: 10,
      backgroundColor: '#F9FAFB',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E2E8F0',
  },
  medicationDetails: {
      flex: 1,
  },
  medicationName: {
      fontSize: 15,
      fontWeight: '700',
      color: '#1E3A8A',
      marginBottom: 3,
  },
  dosageRow: {
      flexDirection: 'row',
      marginBottom: 5,
  },
  dosageText: {
      fontSize: 13,
      color: '#475569',
      fontWeight: '500',
  },
  instructionsText: {
      fontSize: 13,
      fontStyle: 'italic',
      color: '#64748B',
  },
  
  printButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      borderRadius: 8,
      backgroundColor: '#EBF4FF',
      marginTop: 10,
  },
  printButtonText: {
      color: '#1E3A8A',
      fontSize: 14,
      fontWeight: '700',
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