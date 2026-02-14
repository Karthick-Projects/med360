import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// --- Type Definitions ---

type PatientDetails = {
  id: string;
  name: string;
  dob: string;
};

type ConsultationRecord = {
  id: string;
  date: string;
  type: "In-Person" | "Teleconsultation" | "Follow-up";
  diagnosis: string;
  notes: string;
  prescriptionGiven: boolean;
};

// --- Dummy Data ---

const PATIENT_DATA: PatientDetails = {
  id: "PID1023",
  name: "Ramesh Kumar",
  dob: "05/04/1980",
};

const CONSULTATION_HISTORY: ConsultationRecord[] = [
  {
    id: "c1",
    date: "20 Dec 2025",
    type: "Teleconsultation",
    diagnosis: "Common Cold (Viral)",
    notes:
      "Patient called in with mild congestion and sore throat. No fever reported. Advised supportive care, fluids, and OTC decongestants. Schedule a follow-up if symptoms persist beyond 5 days.",
    prescriptionGiven: false,
  },
  {
    id: "c2",
    date: "10 Nov 2025",
    type: "In-Person",
    diagnosis: "Essential Hypertension",
    notes:
      "Annual review for BP control. BP measured at 135/85 mmHg. Patient reports compliance with Lisinopril. Increased Lisinopril dosage from 5mg to 10mg daily. Discussed dietary modifications (low sodium).",
    prescriptionGiven: true,
  },
  {
    id: "c3",
    date: "05 Oct 2025",
    type: "Follow-up",
    diagnosis: "Type 2 Diabetes Mellitus",
    notes:
      "Follow-up for A1C results (A1C: 7.2%). Results are acceptable but not optimal. Re-emphasized diet and exercise. Maintained Metformin 500mg twice daily. Advised blood glucose monitoring post-meals.",
    prescriptionGiven: true,
  },
];

// --- Reusable Components ---

/**
 * @description Accordion component for a single consultation record.
 */
const ConsultationAccordion: React.FC<{ record: ConsultationRecord }> = ({ record }) => {
  const [expanded, setExpanded] = useState(false);
  const icon = expanded ? "chevron-up" : "chevron-down";
  
  const typeIcon = record.type === "Teleconsultation" ? "videocam-outline" : "person-outline";
  const typeColor = record.type === "In-Person" ? "#1E3A8A" : record.type === "Teleconsultation" ? "#50C878" : "#FF8C00";
  
  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={[styles.accordionHeader, { borderLeftColor: typeColor }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.accordionTitle}>{record.diagnosis}</Text>
          <View style={styles.headerSubtitleRow}>
             <Ionicons name="calendar-outline" size={14} color="#64748B" style={{marginRight: 4}} />
             <Text style={styles.accordionSubtitle}>{record.date} | </Text>
             <Ionicons name={typeIcon as any} size={14} color={typeColor} style={{marginRight: 4}} />
             <Text style={[styles.accordionSubtitle, { color: typeColor }]}>{record.type}</Text>
          </View>
        </View>
        <Ionicons name={icon} size={20} color="#1E3A8A" />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.accordionBody}>
          <Text style={styles.bodyTextTitle}>Doctor's Notes</Text>
          <Text style={styles.bodyText}>{record.notes}</Text>
          
          <View style={styles.footerRow}>
              <View style={styles.footerBadge}>
                <MaterialIcons name="local-pharmacy" size={16} color="#475569" />
                <Text style={styles.footerBadgeText}>
                    Rx: {record.prescriptionGiven ? 'Prescribed' : 'None'}
                </Text>
              </View>
              <TouchableOpacity style={styles.reviewButton}>
                  <Ionicons name="document-text-outline" size={16} color="#fff" />
                  <Text style={styles.reviewButtonText}>View Full Record</Text>
              </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// --- Main Screen Component ---

const ConsultationRecordsScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  
  // Filter records based on search text
  const filteredRecords = CONSULTATION_HISTORY.filter(record => 
    record.diagnosis.toLowerCase().includes(searchText.toLowerCase()) ||
    record.notes.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        {/* 1. Patient Header Section */}
        <Text style={styles.headerTitle}>Consultation Records</Text>
        <Text style={styles.headerName}>{PATIENT_DATA.name}</Text>
        <Text style={styles.headerSubtitle}>
          DOB: {PATIENT_DATA.dob} | ID: {PATIENT_DATA.id}
        </Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.contentScroll}>
        {/* 2. Search/Filter Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="filter-outline" size={20} color="#64748B" style={{marginRight: 10}} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filter by diagnosis, notes, or date..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* 3. Consultation List */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Consultations ({filteredRecords.length})</Text>
          
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <ConsultationAccordion key={record.id} record={record} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="history" size={40} color="#A1A1AA" />
              <Text style={styles.emptyText}>No matching records found.</Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ConsultationRecordsScreen;

// --- Stylesheet ---

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  
  // --- Header Styles ---
  header: {
    padding: 20,
    backgroundColor: "#1E3A8A", // Deep Blue
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 16,
    color: "#DCE3F0",
    fontWeight: "500",
  },
  headerName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#DCE3F0",
    marginBottom: 5,
  },
  
  // --- Search Bar Styles ---
  contentScroll: {
      flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 20,
    marginTop: -20, // Pull up into the header curve visually
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },

  // --- List & Accordion Styles ---
  listContainer: {
    paddingHorizontal: 20,
  },
  listTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1E3A8A',
      marginBottom: 15,
  },
  accordionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderLeftWidth: 4,
  },
  headerLeft: {
    flexShrink: 1,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  headerSubtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
  },
  accordionSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  
  // --- Accordion Body Styles ---
  accordionBody: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  bodyTextTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#475569',
      marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 15,
  },
  
  // --- Footer Actions ---
  footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 5,
  },
  footerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E2E8F0',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
  },
  footerBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#475569',
      marginLeft: 5,
  },
  reviewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4A90E2',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
  },
  reviewButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 5,
  },

  // --- Empty State Styles ---
  emptyContainer: {
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