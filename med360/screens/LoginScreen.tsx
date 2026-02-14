import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import SERVER_URL from "../config";

const AuthScreen = ({ navigation }: any) => {
  const [tab, setTab] = useState<"login" | "register">("login");

  // Register
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [patientId, setPatientId] = useState("");

  // Login
  const [storedPid, setStoredPid] = useState<string | null>(null);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("PATIENT_ID").then((pid) => {
      setStoredPid(pid);
      if (pid) setLoginPhone(pid); // auto-fill phone if stored
    });
  }, [tab]);

  /* ------------------ REGISTER ------------------ */
  const register = async () => {
    if (!name || !dob || !phone || !password || !confirmPassword) {
      Alert.alert("Error", "All fields required");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dob, phone, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Registration Failed", data.detail || "Something went wrong");
        return;
      }

      setPatientId(data.user_id);
      await AsyncStorage.setItem("PATIENT_ID", data.user_id);

      Alert.alert("Success", `Registered Successfully\nPatient ID: ${data.user_id}`);
      setTab("login");
    } catch (error) {
      Alert.alert("Error", "Cannot connect to server");
    }
  };

  /* ------------------ LOGIN ------------------ */
  const login = async () => {
    const identifier = loginPhone; // PID if exists, otherwise phone

    if (!identifier || !loginPassword) {
      Alert.alert("Error", "All fields required");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: identifier,       // must match FastAPI model
          password: loginPassword,
        }),
      });

      const data = await response.json();
      console.log("login data:",data);
      if (!response.ok) {
        Alert.alert("Login Failed", data.detail || "Something went wrong");
        return;
      }

      await AsyncStorage.setItem("PATIENT_ID", data.user_id);

      Alert.alert("Success", "Login successful");
      console.log(data.name)
      if (data.role === "patient") {
        navigation.navigate("PatientDashboard", {
          patientName: data.name,
        });
      }
      else if (data.role === "doctor") {
        navigation.navigate("DoctorDashboard", {
          doctorName: data.name,
        });
      }
      else {
        navigation.navigate("AdminDashboard");
      }
    } catch (error) {
      Alert.alert("Error", "Cannot connect to server");
    }
  };

  /* ------------------ RENDER ------------------ */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="heart" size={48} color="#fff" />
          <Text style={styles.appName}>MediCare+</Text>
          <Text style={styles.tagline}>Your health, our priority</Text>
        </View>

        {/* TABS */}
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[styles.tab, tab === "login" && styles.activeTab]}
            onPress={() => setTab("login")}
          >
            <Text style={tab === "login" ? styles.activeText : styles.tabText}>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === "register" && styles.activeTab]}
            onPress={() => setTab("register")}
          >
            <Text style={tab === "register" ? styles.activeText : styles.tabText}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          {/* REGISTER */}
          {tab === "register" && (
            <>
              <Text style={styles.title}>Create Patient Account</Text>

              <Input label="Full Name" value={name} onChange={setName} />
              <Input label="Date of Birth" value={dob} onChange={setDob} />
              <Input
                label="Mobile Number"
                value={phone}
                onChange={setPhone}
                keyboard="phone-pad"
              />
              <Input label="Password" value={password} onChange={setPassword} secure />
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                secure
              />


              {patientId !== "" && (
                <View style={styles.pidBox}>
                  <Text style={styles.pidText}>Patient ID: {patientId}</Text>
                </View>
              )}

              <PrimaryButton title="Sign Up" onPress={register} />
            </>
          )}

          {/* LOGIN */}
          {tab === "login" && (
            <>
              <Text style={styles.title}>Patient Login</Text>

              {/* {storedPid && (
                <View style={styles.pidBox}>
                  <Text style={styles.pidText}>Patient ID: {storedPid}</Text>
                </View>
              )} */}

              {/* Only show phone input if no stored PID */}
              {!storedPid && (
                <Input
                  label="Mobile Number"
                  value={loginPhone}
                  onChange={setLoginPhone}
                  keyboard="phone-pad"
                />
              )}

              <Input
                label="User ID"
                value={loginPhone}
                onChange={setLoginPhone}

              />
              <Input
                label="Password"
                value={loginPassword}
                onChange={setLoginPassword}
                secure
              />

              <PrimaryButton title="Login" onPress={login} />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

/* ---------------- SMALL COMPONENTS ---------------- */
const Input = ({ label, value, onChange, secure, keyboard }: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputField}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure && !showPassword}
          keyboardType={keyboard}
        />

        {secure && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#64748B"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};


const PrimaryButton = ({ title, onPress }: any) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2FF" },
  header: {
    backgroundColor: "#4F46E5",
    paddingVertical: 70,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  appName: { fontSize: 28, fontWeight: "900", color: "#fff", marginTop: 10 },
  tagline: { color: "#E0E7FF", marginTop: 6 },
  tabWrapper: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
  },
  tab: { flex: 1, padding: 14, alignItems: "center" },
  activeTab: { backgroundColor: "#4F46E5", borderRadius: 16 },
  tabText: { fontWeight: "700", color: "#64748B" },
  activeText: { fontWeight: "800", color: "#fff" },
  card: { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 24, padding: 22, elevation: 6 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 16, color: "#1E293B" },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 14, padding: 7, fontSize: 16, backgroundColor: "#F8FAFC" },
  pidBox: { backgroundColor: "#EEF2FF", padding: 12, borderRadius: 12, marginBottom: 14, alignItems: "center" },
  pidText: { fontWeight: "800", color: "#4F46E5" },
  button: { backgroundColor: "#4F46E5", padding: 16, borderRadius: 16, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },

  inputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },

});
