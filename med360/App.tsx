// App.tsx (or App.js) - Consolidated Navigation Stack

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// ==========================================================
// 1. IMPORT ALL SCREEN COMPONENTS FROM THE './screens' FOLDER
// ==========================================================
import PatientDashboard from './screens/Patient/PatientDashboard';
import BookNewAppointmentScreen from './screens/Patient/BookNewAppointmentScreen';
import PatientMedicalHistoryScreen from './screens/Patient/PatientMedicalHistoryScreen';
import PatientLabReportsScreen from './screens/Patient/PatientLabReportsScreen';
import PatientPrescriptionScreen from './screens/Patient/PatientPrescriptionScreen';
// Optional/Placeholder Screens (Ensure these files exist or remove the imports/Stack.Screens)
import ViewAppointmentsScreen from './screens/Doctor/ViewAppointmentsScreen';
import ViewVitalsScreen from './screens/Doctor/ViewVitalsScreen';
import AccessAppointmentsScreen from './screens/Doctor/AccessAppointmentsScreen';
import VitalsCheckScreen from './screens/Patient/VitalsCheckScreen';
import ConsultationRecordsScreen from './screens/Doctor/ConsultationRecordsScreen';
import CreateDigitalPrescriptionScreen from './screens/Doctor/CreateDigitalPrescriptionScreen';
import DoctorDashboard from './screens/Doctor/Dashboard';
import ReviewLabTestResultsScreen from './screens/Doctor/ReviewLabTestResultsScreen';
import ViewPrescriptionsScreen from './screens/Doctor/ViewPrescriptionsScreen';
import LoginScreen from './screens/LoginScreen';
import AdminDashboard from './screens/Admin/AdminDashboard';
import PatientRegistrationScreen from "./screens/Admin/PatientRegistrationScreen";
import AdmissionDetailsScreen from "./screens/Admin/AdmissionDetailsScreen";
import DoctorDepartmentAssignmentScreen from "./screens/Admin/DoctorDepartmentAssignmentScreen";
import DoctorExperienceScreen from "./screens/Admin/DoctorExperienceScreen";
import StaffManagementScreen from "./screens/Admin/StaffManagementScreen";
import PharmacyInventoryScreen from "./screens/Admin/PharmacyInventoryScreen";
import LabManagementScreen from "./screens/Admin/LabManagementScreen";
import UserMasterRegistrationScreen from './screens/Admin/UserMasterRegistrationScreen';
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#00A896' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShadowVisible: false, // Removes shadow line under header
        }}
      >

        {/* ==========================================================
            2. CORE SCREENS (Dashboard)
            ========================================================== */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PatientDashboard"
          component={PatientDashboard}
          options={{ headerShown: false }}
        />

        {/* ==========================================================
            3. ACTION SCREENS (Linked from Dashboard Quick Actions)
            ========================================================== */}
        <Stack.Screen
          name="BookAppointment"
          component={BookNewAppointmentScreen}
          options={{ title: 'Book Appointment' }}
        />
        <Stack.Screen
          name="ViewAppointmentsScreen"
          component={ViewAppointmentsScreen}
          options={{ title: 'My Appointments' }}
        />

        {/* ==========================================================
            4. HEALTH RECORDS SCREENS (Linked from Dashboard Records)
            ========================================================== */}
        <Stack.Screen
          name="PatientMedicalHistory"
          component={PatientMedicalHistoryScreen}
          options={{ title: 'Medical History' }}
        />
        <Stack.Screen
          name="PatientLabResults"
          component={PatientLabReportsScreen}
          options={{ title: 'Lab Test Results' }}
        />
        <Stack.Screen
          name="PatientPrescriptions" // <-- Link for the new screen
          component={PatientPrescriptionScreen}
          options={{ title: 'My Prescriptions' }}
        />
        <Stack.Screen
          name="VitalsScreen"
          component={VitalsCheckScreen}
          options={{ title: 'Vitals & Metrics' }}
        />
        <Stack.Screen
          name="ViewVitalsScreen"
          component={ViewVitalsScreen}
          options={{ title: 'Vitals & Metrics' }}
        />
        <Stack.Screen
          name="AccessAppointmentsScreen"
          component={AccessAppointmentsScreen}
          options={{ title: 'AccessAppointments' }}
        />
        <Stack.Screen
          name="ConsultationRecordsScreen"
          component={ConsultationRecordsScreen}
          options={{ title: 'ConsultationRecords' }}
        />
        <Stack.Screen
          name="CreateDigitalPrescriptionScreen"
          component={CreateDigitalPrescriptionScreen}
          options={{ title: 'CreateDigitalPrescription' }}
        />
        <Stack.Screen
          name="DoctorDashboard"
          component={DoctorDashboard}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ReviewLabTestResultsScreen"
          component={ReviewLabTestResultsScreen}
          options={{ title: 'ReviewLabTestResults' }}
        />
        <Stack.Screen
          name="ViewPrescriptionsScreen"
          component={ViewPrescriptionsScreen}
          options={{ title: 'ViewPrescriptions' }}
        />
 <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{headerShown:false}}
        />
 <Stack.Screen
          name="MasterRegistration"
          component={UserMasterRegistrationScreen}
          options={{ title: "Master Registeration" }}
        />

        <Stack.Screen
          name="PatientRegistration"
          component={PatientRegistrationScreen}
          options={{ title: "Patient Registration" }}
        />

        <Stack.Screen
          name="AdmissionDetails"
          component={AdmissionDetailsScreen}
          options={{ title: "Admission Details" }}
        />

        <Stack.Screen
          name="DoctorDepartment"
          component={DoctorDepartmentAssignmentScreen}
          options={{ title: "Doctor & Department" }}
        />

        {/* <Stack.Screen
          name="DoctorExperience"
          component={DoctorExperienceScreen}
          options={{ title: "Doctor Experience" }}
        /> */}

        <Stack.Screen
          name="StaffManagement"
          component={StaffManagementScreen}
          options={{ title: "Staff Management" }}
        />

        <Stack.Screen
          name="PharmacyInventory"
          component={PharmacyInventoryScreen}
          options={{ title: "Pharmacy Inventory" }}
        />

        <Stack.Screen
          name="LabManagement"
          component={LabManagementScreen}
          options={{ title: "Lab Management" }}
        />


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;