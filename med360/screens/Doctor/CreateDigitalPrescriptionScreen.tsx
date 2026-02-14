import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import SERVER_URL from "../../config";

// --- Type Definitions ---
type PatientDetails = {
  id: string;
  name: string;
  age: number;
  disease: string;
};

type PrescriptionItem = {
  id: string;
  medicationName: string;
  dosageMorning: string;
  dosageAfternoon: string;
  dosageNight: string;
  instructions: string;
};

type SearchResult = {
  name: string;
  defaultDosage: string;
};

// --- Dummy Drug Database ---
const DUMMY_DRUG_DATABASE: SearchResult[] = [
  { name: "Amoxicillin 500mg", defaultDosage: "500mg" },
  { name: "Paracetamol 650mg", defaultDosage: "650mg" },
  { name: "Atorvastatin 10mg", defaultDosage: "10mg" },
  { name: "Metformin 500mg", defaultDosage: "500mg" },
  { name: "Lisinopril 5mg", defaultDosage: "5mg" },
];

// --- Medication Card Component ---
const MedicationCard: React.FC<{
  item: PrescriptionItem;
  onRemove: (id: string) => void;
  onEdit: (id: string, field: keyof PrescriptionItem, value: string) => void;
}> = ({ item, onRemove, onEdit }) => {
  const handleEdit = useCallback(
    (field: keyof PrescriptionItem, value: string) => {
      onEdit(item.id, field, value);
    },
    [item.id, onEdit]
  );

  return (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <MaterialIcons name="local-pharmacy" size={24} color="#1E3A8A" />
        <Text style={styles.medicationNameText}>{item.medicationName}</Text>
        <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeButton}>
          <Ionicons name="close-circle" size={24} color="#E63946" />
        </TouchableOpacity>
      </View>

      {/* Dosage Schedule Inputs */}
      <View style={styles.inputGrid}>
        <View style={styles.inputGroupThird}>
          <Text style={styles.inputLabel}>Morning</Text>
          <TextInput
            style={styles.textInput}
            value={item.dosageMorning}
            onChangeText={(text) => handleEdit("dosageMorning", text)}
            placeholder="e.g., 1 tab"
          />
        </View>
        <View style={styles.inputGroupThird}>
          <Text style={styles.inputLabel}>Afternoon</Text>
          <TextInput
            style={styles.textInput}
            value={item.dosageAfternoon}
            onChangeText={(text) => handleEdit("dosageAfternoon", text)}
            placeholder="e.g., 0"
          />
        </View>
        <View style={styles.inputGroupThird}>
          <Text style={styles.inputLabel}>Night</Text>
          <TextInput
            style={styles.textInput}
            value={item.dosageNight}
            onChangeText={(text) => handleEdit("dosageNight", text)}
            placeholder="e.g., 1 tab"
          />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.inputGroupFull}>
        <Text style={styles.inputLabel}>Instructions</Text>
        <TextInput
          style={styles.textInput}
          value={item.instructions}
          onChangeText={(text) => handleEdit("instructions", text)}
          placeholder="e.g., Take after food"
        />
      </View>
    </View>
  );
};

// --- Main Screen ---
const CreateDigitalPrescriptionScreen: React.FC<{ route: any }> = ({ route }) => {
  const { doctorName, doctorRole, doctorDepartment } = route.params;

  const [patientId, setPatientId] = useState("");
  const [patientData, setPatientData] = useState<PatientDetails | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientError, setPatientError] = useState("");

  const [prescriptionList, setPrescriptionList] = useState<PrescriptionItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // --- Fetch Patient Details ---
  const fetchPatientDetails = async () => {
    if (!patientId.trim()) {
      Alert.alert("Error", "Please enter a Patient ID");
      return;
    }

    setLoadingPatient(true);
    setPatientError("");
    setPatientData(null);

    try {
      const response = await fetch(`${SERVER_URL}/patient/${patientId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Patient not found");
        else throw new Error("Failed to fetch patient details");
      }
      const data = await response.json();
      setPatientData({
        id: data.user_id,
        name: data.name,
        age: data.age,
        disease: data.disease
      });
    } catch (error: any) {
      setPatientError(error.message || "Something went wrong");
    } finally {
      setLoadingPatient(false);
    }
  };

  // --- Medication Search ---
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 2) {
      const results = DUMMY_DRUG_DATABASE.filter((drug) =>
        drug.name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMedication = (result: SearchResult) => {
    const newItem: PrescriptionItem = {
      id: Date.now().toString(),
      medicationName: result.name,
      dosageMorning: "0",
      dosageAfternoon: "0",
      dosageNight: "0",
      instructions: "Take as directed.",
    };
    setPrescriptionList((prev) => [...prev, newItem]);
    setSearchText("");
    setSearchResults([]);
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptionList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditMedication = (id: string, field: keyof PrescriptionItem, value: string) => {
    setPrescriptionList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // --- Finalize Prescription ---
  const handleFinalizePrescription = async () => {
    if (!patientData) {
      Alert.alert("Error", "Please select a patient first");
      return;
    }
    if (prescriptionList.length === 0) {
      Alert.alert("Error", "Please add at least one medication.");
      return;
    }

    const payload = {
      doctorName,
      doctorRole,
      doctorDepartment,
      patientId: patientData.id,
      patientName: patientData.name,
      disease: patientData.disease,
      medications: prescriptionList.map((item) => ({
        name: item.medicationName,
        dosageMorning: item.dosageMorning,
        dosageAfternoon: item.dosageAfternoon,
        dosageNight: item.dosageNight,
        instructions: item.instructions,
      })),
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${SERVER_URL}/doctors/save-prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to save prescription");

      Alert.alert("Success", `Prescription for ${patientData.name} saved successfully.`);
      setPrescriptionList([]);
      setPatientId("");
      setPatientData(null);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Patient Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Digital Prescription</Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
            <TextInput
              style={[styles.searchInput, { flex: 1, backgroundColor: "#fff", borderRadius: 8 }]}
              placeholder="Enter Patient ID"
              value={patientId}
              onChangeText={setPatientId}
            />
            <TouchableOpacity
              style={{ marginLeft: 10, backgroundColor: "#4A90E2", padding: 10, borderRadius: 8 }}
              onPress={fetchPatientDetails}
            >
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {loadingPatient && <ActivityIndicator size="small" color="#fff" style={{ marginTop: 5 }} />}
          {patientError ? <Text style={{ color: "#E63946", marginTop: 5 }}>{patientError}</Text> : null}

          {patientData && (
            <>
              <Text style={styles.headerName}>{patientData.name}</Text>
              <Text style={styles.headerSubtitle}>
                Age: {patientData.age} | ID: {patientData.id}
              </Text>
            </>
          )}
        </View>

        {/* Medication Search */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>1. Search & Add Medication</Text>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medication name"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>

          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleAddMedication(result)}
                >
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={styles.resultDosage}>Default: {result.defaultDosage}</Text>
                  <MaterialIcons name="add-circle" size={22} color="#50C878" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Prescription List */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            2. Finalize Prescription ({prescriptionList.length} items)
          </Text>

          {prescriptionList.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="list-alt" size={40} color="#A1A1AA" />
              <Text style={styles.emptyText}>No medications added yet.</Text>
            </View>
          ) : (
            prescriptionList.map((item) => (
              <MedicationCard
                key={item.id}
                item={item}
                onRemove={handleRemoveMedication}
                onEdit={handleEditMedication}
              />
            ))
          )}
        </View>

        {/* Save Button */}
        <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#50C878" }]}
            onPress={handleFinalizePrescription}
            disabled={prescriptionList.length === 0}
          >
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Save Prescription</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateDigitalPrescriptionScreen;

// --- Styles ---
const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#F4F6F8" },
  header: {
    padding: 20,
    backgroundColor: "#1E3A8A",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 50,
    marginBottom: 10,
  },
  headerTitle: { fontSize: 16, color: "#DCE3F0", fontWeight: "500" },
  headerName: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF", marginTop: 4 },
  headerSubtitle: { fontSize: 14, color: "#DCE3F0" },
  sectionContainer: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1E3A8A", marginBottom: 15 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: { flex: 1, fontSize: 16 },
  searchResultsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginTop: 5,
    elevation: 4,
  },
  searchResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  resultName: { fontSize: 16, fontWeight: "600", color: "#0F172A", flex: 1 },
  resultDosage: { fontSize: 12, color: "#64748B", marginRight: 10 },
  medicationCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#6A5ACD",
  },
  medicationHeader: { flexDirection: "row", alignItems: "center", paddingBottom: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  medicationNameText: { fontSize: 17, fontWeight: "700", color: "#0F172A", flex: 1, marginLeft: 10 },
  removeButton: { padding: 5 },
  inputGrid: { flexDirection: "row", justifyContent: "space-between" },
  inputGroupHalf: { width: "48%", marginBottom: 10 },
  inputGroupFull: { marginBottom: 10 },
  inputGroupThird: { width: "30%", marginBottom: 10 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 5 },
  textInput: { backgroundColor: "#F9FAFB", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#E2E8F0", fontSize: 14 },
  actionButton: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderRadius: 10, justifyContent: "center", flex: 1, elevation: 3 },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", marginLeft: 10 },
  emptyBox: { marginTop: 30, alignItems: "center", padding: 20, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  emptyText: { color: "#64748B", fontSize: 15, marginTop: 10, fontWeight: "500" },
});
