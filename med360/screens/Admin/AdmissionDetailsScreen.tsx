import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SERVER_URL from "../../config";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#2563eb",
  success: "#10B981",
  bg: "#F1F5F9",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  cardShadow: "rgba(100, 116, 139, 0.12)",
};

const AdmissionDetailsScreen = () => {

  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [ward, setWard] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [admissionType, setAdmissionType] = useState("Routine");

  const [bedStatus, setBedStatus] = useState<any>(null);

  const [admissionDateTime, setAdmissionDateTime] = useState("");

  useEffect(() => {
    setAdmissionDateTime(
      new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  // --------------------------------
  // PATIENT LOOKUP
  // --------------------------------
  const handlePatientLookup = async () => {
    if (!patientId.trim()) {
      Alert.alert("Required", "Enter Patient ID");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${SERVER_URL}/admin/${patientId}`);
      const data = await res.json();

      if (!res.ok) {
        setPatient(null);
        Alert.alert("Error", "Patient not found");
      } else {
        setPatient(data);
      }
    } catch (error) {
      Alert.alert("Error", "Server unreachable");
    }

    setLoading(false);
  };

  // --------------------------------
  // CHECK WARD BED STATUS
  // --------------------------------
  const checkWardAvailability = async (wardValue: string) => {

    if (!wardValue) {
      setBedStatus(null);
      return;
    }

    try {
      const res = await fetch(
        `${SERVER_URL}/admin/ward-bed-status/${wardValue}`
      );

      const data = await res.json();

      if (res.ok) {
        setBedStatus(data);

        if (data.availableBeds <= 0) {
          Alert.alert(
            "Ward Full",
            `All ${data.totalBeds} beds are occupied in ${wardValue}`
          );
          setWard("");
          setBedNumber("");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Unable to check bed availability");
    }
  };

  // --------------------------------
  // CREATE ADMISSION
  // --------------------------------
  const handleCreateAdmission = async () => {

    if (!patient) {
      Alert.alert("Step Required", "Verify patient first");
      return;
    }

    if (!ward || !bedNumber) {
      Alert.alert("Missing Info", "Enter Ward and Bed Number");
      return;
    }

    if (bedStatus && bedStatus.availableBeds <= 0) {
      Alert.alert("Ward Full", "No beds available in this ward");
      return;
    }

    setSubmitting(true);

    const payload = {
      patientId: patientId,
      ward: ward,
      bedNumber: bedNumber,
    };

    try {
      const response = await fetch(
        `${SERVER_URL}/admin/admission-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          "Admission Success",
          `Admission ID: ${result.admissionId}`,
          [{ text: "OK", onPress: resetForm }]
        );
      } else {
        Alert.alert("Failed", result.detail);
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to connect to server");
    }

    setSubmitting(false);
  };

  // --------------------------------
  // RESET FORM
  // --------------------------------
  const resetForm = () => {
    setPatient(null);
    setPatientId("");
    setWard("");
    setBedNumber("");
    setBedStatus(null);
    setAdmissionType("Routine");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inpatient Admission</Text>
        <Text style={styles.headerSub}>Allocate facilities for new admission</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >

        {/* PATIENT SEARCH */}
        <View style={styles.card}>

          <View style={styles.cardHeader}>
            <Ionicons name="search-circle" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Identify Patient</Text>
          </View>

          <View style={styles.searchBox}>
            <TextInput
              style={styles.inputSearch}
              placeholder="Enter Patient ID"
              value={patientId}
              onChangeText={setPatientId}
            />

            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handlePatientLookup}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {patient && (
            <View style={styles.verifiedProfile}>
              <Text style={styles.pName}>{patient.name}</Text>
              <Text style={styles.pDetails}>
                {patient.age}Y • {patient.gender} • {patient.mobile}
              </Text>
            </View>
          )}
        </View>

        {/* FACILITY ALLOCATION */}
        <View style={[styles.card, !patient && styles.disabledCard]}>

          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="hospital-building"
              size={24}
              color={COLORS.primary}
            />
            <Text style={styles.cardTitle}>Facility Allocation</Text>
          </View>


          <Text style={styles.label}>Ward</Text>

          <TextInput
            style={styles.gridInput}
            placeholder="e.g. ICU-1"
            value={ward}
            onChangeText={(text) => {
              setWard(text);
              checkWardAvailability(text);
            }}
            editable={!!patient}
          />

          {bedStatus && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: COLORS.textSub }}>
                Occupied Beds: {bedStatus.occupiedBeds}/{bedStatus.totalBeds}
              </Text>

              <Text style={{ fontSize: 12, color: COLORS.success }}>
                Available Beds: {bedStatus.availableBeds}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Bed Number</Text>

          <TextInput
            style={styles.gridInput}
            placeholder="Bed 1"
            value={bedNumber}
            onChangeText={setBedNumber}
            editable={!!patient}
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!patient || submitting) && { backgroundColor: COLORS.textSub },
          ]}
          disabled={!patient || submitting}
          onPress={handleCreateAdmission}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Confirm Inpatient Entry</Text>
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 20,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textMain,
  },

  headerSub: {
    fontSize: 14,
    color: COLORS.textSub,
    marginTop: 4,
  },

  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  disabledCard: {
    opacity: 0.5,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: 5,
  },

  inputSearch: {
    flex: 1,
    paddingHorizontal: 15,
  },

  searchBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 10,
  },

  verifiedProfile: {
    marginTop: 15,
  },

  pName: {
    fontSize: 18,
    fontWeight: "bold",
  },

  pDetails: {
    color: COLORS.textSub,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 5,
  },

  typeRow: {
    flexDirection: "row",
    gap: 10,
  },

  typeBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },

  typeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  typeBtnText: {
    color: COLORS.textSub,
  },

  typeBtnTextActive: {
    color: "#fff",
  },

  gridInput: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  submitBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

});

export default AdmissionDetailsScreen;