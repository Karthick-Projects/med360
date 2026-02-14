import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

// --- Type Definitions ---

type PatientDetails = {
  id: string;
  name: string;
};

type LabResult = {
  id: string;
  testName: string;
  result: number | string;
  unit: string;
  rangeMin: number | null;
  rangeMax: number | null;
  status: "Normal" | "High" | "Low";
  panel: "Hematology" | "Biochemistry" | "Urine";
};

type ReportSummary = {
  date: string;
  reportId: string;
  status: "Normal" | "Abnormal";
};

// --- Dummy Data ---

const PATIENT_DATA: PatientDetails = {
  id: "PID1023",
  name: "Ramesh Kumar",
};

const REPORT_HISTORY: ReportSummary[] = [
  { date: "10 Jan 2026", reportId: "RPT20260110", status: "Abnormal" },
  { date: "15 Oct 2025", reportId: "RPT20251015", status: "Normal" },
];

const FULL_LAB_RESULTS: LabResult[] = [
  // Hematology Panel (Abnormal example)
  { id: "h1", testName: "Hemoglobin (Hb)", result: 11.2, unit: "g/dL", rangeMin: 13.5, rangeMax: 17.5, status: "Low", panel: "Hematology" },
  { id: "h2", testName: "White Blood Cell (WBC)", result: 7.5, unit: "x10^9/L", rangeMin: 4.0, rangeMax: 11.0, status: "Normal", panel: "Hematology" },
  { id: "h3", testName: "Platelets", result: 250, unit: "x10^9/L", rangeMin: 150, rangeMax: 450, status: "Normal", panel: "Hematology" },
  
  // Biochemistry Panel (High example)
  { id: "b1", testName: "Glucose (Fasting)", result: 145, unit: "mg/dL", rangeMin: 70, rangeMax: 100, status: "High", panel: "Biochemistry" },
  { id: "b2", testName: "Creatinine", result: 0.9, unit: "mg/dL", rangeMin: 0.6, rangeMax: 1.2, status: "Normal", panel: "Biochemistry" },
  { id: "b3", testName: "Liver Enzymes (ALT)", result: 48, unit: "U/L", rangeMin: 7, rangeMax: 56, status: "Normal", panel: "Biochemistry" },
  
  // Urine Panel
  { id: "u1", testName: "Color", result: "Pale Yellow", unit: "", rangeMin: null, rangeMax: null, status: "Normal", panel: "Urine" },
  { id: "u2", testName: "pH", result: 6.0, unit: "", rangeMin: 4.5, rangeMax: 8.0, status: "Normal", panel: "Urine" },
];

// --- Reusable Components ---

/**
 * @description Card to display a single lab test result with status highlighting.
 */
const LabResultCard: React.FC<{ result: LabResult }> = ({ result }) => {
  let statusColor;
  let statusIcon;
  let statusText = result.status;
  
  // Determine color and icon based on status
  switch (result.status) {
    case "High":
      statusColor = "#E63946"; // Red
      statusIcon = "arrow-up-circle-outline";
      break;
    case "Low":
      statusColor = "#FF8C00"; // Orange
      statusIcon = "arrow-down-circle-outline";
      break;
    case "Normal":
    default:
      statusColor = "#50C878"; // Green
      statusIcon = "checkmark-circle-outline";
      statusText = result.rangeMin !== null ? "Normal" : "Observed"; // For non-numerical/descriptive tests
  }
  
  const isAbnormal = result.status !== "Normal";

  return (
    <View style={[styles.resultCard, isAbnormal && styles.resultCardAbnormal]}>
      {/* Test Name and Status Icon */}
      <View style={styles.resultHeader}>
        <Text style={styles.testName}>{result.testName}</Text>
        <View style={styles.statusIndicator}>
            <Ionicons name={statusIcon} size={18} color={statusColor} />
            <Text style={[styles.statusLabel, { color: statusColor }]}>
                {statusText}
            </Text>
        </View>
      </View>
      
      {/* Details Row */}
      <View style={styles.resultDetails}>
        {/* Result Value */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Result:</Text>
          <Text style={[styles.resultValue, isAbnormal && { color: statusColor }]}>
            {result.result} <Text style={styles.resultUnit}>{result.unit}</Text>
          </Text>
        </View>
        
        {/* Reference Range */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Reference Range:</Text>
          <Text style={styles.rangeValue}>
            {result.rangeMin !== null ? `${result.rangeMin} - ${result.rangeMax}` : 'N/A'} {result.unit}
          </Text>
        </View>
      </View>
      
    </View>
  );
};

// --- Main Screen Component ---

const ReviewLabTestResultsScreen: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportSummary>(REPORT_HISTORY[0]);
  const [activePanel, setActivePanel] = useState<string>("Hematology");

  // Get unique panels from the data
  const availablePanels = Array.from(new Set(FULL_LAB_RESULTS.map(r => r.panel)));
  
  // Filter results for the currently active panel (simulating fetching data for selected report)
  const filteredResults = FULL_LAB_RESULTS.filter(r => r.panel === activePanel);

  return (
    <View style={styles.screenContainer}>
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        {/* 1. Patient & Report Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lab Test Results</Text>
          <Text style={styles.headerName}>{PATIENT_DATA.name}</Text>
          <Text style={styles.headerSubtitle}>
            Patient ID: {PATIENT_DATA.id}
          </Text>

          {/* Report Date Selector (Simplified Dropdown simulation) */}
          <View style={styles.dateSelectorContainer}>
            <MaterialIcons name="event-note" size={18} color="#fff" />
            <Text style={styles.dateSelectorText}>
                Viewing Report: {selectedReport.date} ({selectedReport.status})
            </Text>
            <Ionicons name="caret-down" size={14} color="#fff" style={{ marginLeft: 5 }}/>
            {/* In a real app, this would open a modal/dropdown */}
          </View>
        </View>

        {/* 2. Panel Tabs Navigation */}
        <View style={styles.tabsContainerWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {availablePanels.map((panel) => (
              <TouchableOpacity
                key={panel}
                style={[
                  styles.tabButton,
                  activePanel === panel && styles.tabButtonActive,
                ]}
                onPress={() => setActivePanel(panel)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activePanel === panel && styles.tabTextActive,
                  ]}
                >
                  {panel}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 3. Results Content Section */}
        <View style={styles.contentContainer}>
            <Text style={styles.panelTitle}>{activePanel} Panel</Text>
            
            {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                    <LabResultCard key={result.id} result={result} />
                ))
            ) : (
                <View style={styles.emptyContainer}>
                    <FontAwesome5 name="vial" size={40} color="#A1A1AA" />
                    <Text style={styles.emptyText}>No results found for this panel.</Text>
                </View>
            )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ReviewLabTestResultsScreen;

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
    marginBottom: 10,
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
    marginBottom: 15,
  },
  
  dateSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6', // Lighter blue accent
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  dateSelectorText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  // --- Tabs Styles ---
  tabsContainerWrapper: {
    backgroundColor: "#F4F6F8",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
  },
  tabsScroll: {
      // Allows horizontal scrolling
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tabButtonActive: {
    backgroundColor: "#1E3A8A",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  // --- Results Content Styles ---
  contentContainer: {
    padding: 15,
  },
  panelTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1E3A8A',
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: '#FF8C00',
      paddingLeft: 10,
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#50C878', // Default Green (Normal)
  },
  resultCardAbnormal: {
    borderLeftColor: '#E63946', // Red (Abnormal)
    backgroundColor: '#FFF8F8', // Slightly tinted background for warning
  },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  statusLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 5,
      textTransform: 'uppercase',
  },

  resultDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  detailItem: {
      flex: 1,
      marginRight: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  resultUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
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