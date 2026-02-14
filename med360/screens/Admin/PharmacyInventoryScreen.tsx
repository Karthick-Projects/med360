import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import SERVER_URL from '../../config';
const PharmacyInventoryScreen = () => {
  const [medicineId, setMedicineId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [composition, setComposition] = useState("");
  const [category, setCategory] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [supplier, setSupplier] = useState("");

  /* Low stock logic */
  const isLowStock = stockQty !== "" && Number(stockQty) < 10;

  /* Validation & Save */
const handleSaveMedicine = async () => {
  if (
    !medicineName ||
    !batchNumber ||
    !expiryDate ||
    !price ||
    !stockQty
  ) {
    Alert.alert("Validation Error", "Please fill all required fields");
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

    if (!response.ok) {
      Alert.alert("Error", data.detail || "Failed to save medicine");
      return;
    }

    Alert.alert(
      "Success",
      `Medicine saved successfully${Number(stockQty) < 10 ? "\n⚠ Low stock alert!" : ""}`
    );

    // Reset form
    setMedicineId("");
    setMedicineName("");
    setComposition("");
    setCategory("");
    setBatchNumber("");
    setExpiryDate("");
    setPrice("");
    setStockQty("");
    setSupplier("");

  } catch (error) {
    console.error(error);
    Alert.alert("Network Error", "Unable to save medicine");
  }
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pharmacy Inventory</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Medicine ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Auto / Manual ID"
          value={medicineId}
          onChangeText={setMedicineId}
        />

        <Text style={styles.label}>Medicine Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Paracetamol"
          value={medicineName}
          onChangeText={setMedicineName}
        />

        <Text style={styles.label}>Composition</Text>
        <TextInput
          style={styles.input}
          placeholder="500 mg"
          value={composition}
          onChangeText={setComposition}
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          placeholder="Tablet / Syrup / Injection"
          value={category}
          onChangeText={setCategory}
        />

        <Text style={styles.label}>Batch Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Batch No"
          value={batchNumber}
          onChangeText={setBatchNumber}
        />

        <Text style={styles.label}>Expiry Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="MM / YYYY"
          value={expiryDate}
          onChangeText={setExpiryDate}
        />

        <Text style={styles.label}>Price (₹) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Stock Quantity *</Text>
        <TextInput
          style={[
            styles.input,
            isLowStock && styles.lowStockInput,
          ]}
          placeholder="Available stock"
          keyboardType="numeric"
          value={stockQty}
          onChangeText={setStockQty}
        />

        {isLowStock && (
          <Text style={styles.lowStockText}>
            ⚠ Low stock – reorder soon
          </Text>
        )}

        <Text style={styles.label}>Supplier</Text>
        <TextInput
          style={styles.input}
          placeholder="Supplier name"
          value={supplier}
          onChangeText={setSupplier}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSaveMedicine}
        >
          <Text style={styles.submitText}>Save Medicine</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#ffffff",
  },
  lowStockInput: {
    borderColor: "#dc2626",
  },
  lowStockText: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});

export default PharmacyInventoryScreen;
