import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import SERVER_URL from '../../config';

const COLORS = {
  primary: "#2563eb",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  danger: "#dc2626",
  warning: "#f59e0b",
};

const PharmacyInventoryScreen = () => {
  const [medicineId, setMedicineId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [composition, setComposition] = useState("");
  const [category, setCategory] = useState("Tablet");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [supplier, setSupplier] = useState("");

  const isLowStock = stockQty !== "" && Number(stockQty) < 10;

  const handleSaveMedicine = async () => {
    if (!medicineName || !batchNumber || !expiryDate || !price || !stockQty) {
      Alert.alert("Validation Error", "Please fill all required fields marked with *");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/admin/medicine-add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId,
          medicineName,
          composition,
          category,
          batchNumber,
          expiryDate,
          price: Number(price),
          stockQty: Number(stockQty),
          supplier,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to save medicine");

      Alert.alert("Success", "Inventory updated successfully");
      resetForm();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const resetForm = () => {
    setMedicineId(""); setMedicineName(""); setComposition("");
    setBatchNumber(""); setExpiryDate(""); setPrice("");
    setStockQty(""); setSupplier("");
  };

  const CategoryChip = ({ label }: { label: string }) => (
    <TouchableOpacity 
      style={[styles.chip, category === label && styles.chipActive]} 
      onPress={() => setCategory(label)}
    >
      <Text style={[styles.chipText, category === label && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stock Management</Text>
        <Text style={styles.headerSub}>Pharmacy Inventory Control</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        {/* CARD 1: PRODUCT INFO */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="pill" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Medicine Details</Text>
          </View>

          <Text style={styles.label}>Medicine Name *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Amoxicillin" 
            value={medicineName} 
            onChangeText={setMedicineName} 
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Composition</Text>
              <TextInput 
                style={styles.input} 
                placeholder="500mg" 
                value={composition} 
                onChangeText={setComposition} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Batch No *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="B-9902" 
                value={batchNumber} 
                onChangeText={setBatchNumber} 
              />
            </View>
          </View>

          <Text style={styles.label}>Form Factor</Text>
          <View style={styles.chipRow}>
            {["Tablet", "Syrup", "Injection", "Cream"].map(c => (
              <CategoryChip key={c} label={c} />
            ))}
          </View>
        </View>

        {/* CARD 2: INVENTORY & EXPIRY */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="store-24-hour" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Inventory & Dates</Text>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Stock Quantity *</Text>
              <View style={[styles.inputWrapper, isLowStock && styles.inputWarning]}>
                <TextInput 
                  style={styles.inputNoBorder} 
                  placeholder="0" 
                  keyboardType="numeric" 
                  value={stockQty} 
                  onChangeText={setStockQty} 
                />
                {isLowStock && <Ionicons name="warning" size={18} color={COLORS.warning} style={{ marginRight: 10 }} />}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Expiry Date *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="MM/YYYY" 
                value={expiryDate} 
                onChangeText={setExpiryDate} 
              />
            </View>
          </View>
          {isLowStock && <Text style={styles.warningText}>Stock below threshold (10 units)</Text>}
        </View>

        {/* CARD 3: PRICING & SUPPLIER */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="hand-holding-usd" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Commercial Info</Text>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Unit Price (₹) *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="0.00" 
                keyboardType="numeric" 
                value={price} 
                onChangeText={setPrice} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Medicine ID</Text>
              <TextInput 
                style={styles.input} 
                placeholder="MED-ID" 
                value={medicineId} 
                onChangeText={setMedicineId} 
              />
            </View>
          </View>

          <Text style={styles.label}>Supplier Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Pharma Logistics Ltd." 
            value={supplier} 
            onChangeText={setSupplier} 
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveMedicine}>
          <Text style={styles.submitText}>Update Inventory</Text>
          <Ionicons name="save-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 60, paddingHorizontal: 25, paddingBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: COLORS.textMain },
  headerSub: { fontSize: 14, color: COLORS.textSub, marginTop: 4 },
  
  scrollBody: { paddingHorizontal: 20, paddingBottom: 40 },
  
  card: { 
    backgroundColor: COLORS.white, 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#64748B",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textMain },

  label: { fontSize: 11, fontWeight: "800", color: COLORS.textSub, marginTop: 12, marginBottom: 6, textTransform: 'uppercase' },
  input: { 
    height: 50, 
    backgroundColor: COLORS.bg, 
    borderRadius: 14, 
    paddingHorizontal: 15, 
    fontWeight: "600", 
    color: COLORS.textMain, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.bg, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  inputNoBorder: { flex: 1, height: 50, paddingHorizontal: 15, fontWeight: "600", color: COLORS.textMain },
  inputWarning: { borderColor: COLORS.warning, backgroundColor: '#FFFBEB' },
  
  row: { flexDirection: "row" },
  
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 5 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.textSub },
  chipTextActive: { color: "#fff" },

  warningText: { color: COLORS.warning, fontSize: 11, fontWeight: "700", marginTop: 6, marginLeft: 2 },

  submitBtn: { 
    backgroundColor: COLORS.primary, 
    height: 60, 
    borderRadius: 20, 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 10,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default PharmacyInventoryScreen;