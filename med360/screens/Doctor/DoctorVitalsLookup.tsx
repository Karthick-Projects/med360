import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SERVER_URL from '../../config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

type VitalsStatus = 'Good' | 'Warning' | 'Critical';

type VitalMetric = {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: VitalsStatus;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

/* ------------------ Status Logic ------------------ */

const getStatus = (type: string, value?: number | string): VitalsStatus => {
  if (value === null || value === undefined || value === '--') return 'Warning';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  switch (type) {
    case 'heart_rate':
      return numValue >= 60 && numValue <= 100 ? 'Good' : 'Warning';
    case 'spo2':
      return numValue >= 95 ? 'Good' : 'Critical';
    case 'respiration_rate':
      return numValue >= 12 && numValue <= 20 ? 'Good' : 'Warning';
    case 'blood_sugar':
      return numValue <= 140 ? 'Good' : 'Critical';
    case 'temperature':
      return numValue >= 97 && numValue <= 99 ? 'Good' : 'Warning';
    default:
      return 'Good';
  }
};

const getColor = (status: VitalsStatus) =>
  status === 'Good' ? '#10B981' : status === 'Warning' ? '#F59E0B' : '#EF4444';

/* ------------------ Card Component ------------------ */

const VitalMetricCard = ({ vital }: { vital: VitalMetric }) => {
  const statusBg =
    vital.status === 'Critical' ? '#FEF2F2' : vital.status === 'Warning' ? '#FFFBEB' : '#ECFDF5';

  return (
    <View style={[styles.cardContainer, { borderColor: vital.color, backgroundColor: statusBg }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name={vital.icon} size={28} color={vital.color} />
        <View style={[styles.statusPill, { backgroundColor: vital.color }]}>
          <Text style={styles.statusText}>{vital.status}</Text>
        </View>
      </View>
      <Text style={styles.vitalLabel}>{vital.label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.vitalValue}>{vital.value}</Text>
        <Text style={styles.vitalUnit}>{vital.unit}</Text>
      </View>
    </View>
  );
};

/* ------------------ Main Screen ------------------ */

const DoctorVitalsLookup = () => {
  const [searchId, setSearchId] = useState('');
  const [vitals, setVitals] = useState<VitalMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchPatientVitals = async () => {
    if (!searchId.trim()) {
      Alert.alert('Error', 'Please enter a Patient ID');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/patient/vitals/${searchId}`);
      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Not Found', 'No vitals found for this Patient ID');
        setVitals([]);
        return;
      }

      // If your backend doesn't return name in this specific route, 
      // you might need a separate fetch or use a generic title.
      setPatientName(data.patientName || `Patient: ${searchId}`);
      
      const mappedVitals: VitalMetric[] = [
        {
          id: 'hr',
          label: 'Heart Rate',
          value: data.heart_rate?.toString() || '--',
          unit: 'BPM',
          status: getStatus('heart_rate', data.heart_rate),
          color: getColor(getStatus('heart_rate', data.heart_rate)),
          icon: 'heart-pulse',
        },
        {
          id: 'bp',
          label: 'Blood Pressure',
          value: data.blood_pressure || '--',
          unit: 'mmHg',
          status: 'Warning', 
          color: '#F59E0B',
          icon: 'blood-bag',
        },
        {
          id: 'temp',
          label: 'Temperature',
          value: data.temperature?.toString() || '--',
          unit: '°F',
          status: getStatus('temperature', data.temperature),
          color: getColor(getStatus('temperature', data.temperature)),
          icon: 'thermometer',
        },
        {
          id: 'spo2',
          label: 'SpO2',
          value: data.spo2?.toString() || '--',
          unit: '%',
          status: getStatus('spo2', data.spo2),
          color: getColor(getStatus('spo2', data.spo2)),
          icon: 'chart-bell-curve-cumulative',
        },
        {
          id: 'rr',
          label: 'Respiration Rate',
          value: data.respiration_rate?.toString() || '--',
          unit: 'Breaths/Min',
          status: getStatus('respiration_rate', data.respiration_rate),
          color: getColor(getStatus('respiration_rate', data.respiration_rate)),
          icon: 'lungs',
        },
        {
          id: 'bs',
          label: 'Blood Sugar',
          value: data.blood_sugar?.toString() || '--',
          unit: 'mg/dL',
          status: getStatus('blood_sugar', data.blood_sugar),
          color: getColor(getStatus('blood_sugar', data.blood_sugar)),
          icon: 'diabetes',
        },
      ];

      setVitals(mappedVitals);
      setLastUpdated(data.created_at ? new Date(data.created_at).toLocaleString() : 'Recent');
    } catch (err) {
      Alert.alert('Server Error', 'Could not connect to the database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* --- Search Section --- */}
      <View style={styles.searchHeader}>
        <Text style={styles.headerTitle}>Vitals Monitoring</Text>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Patient ID"
            value={searchId}
            onChangeText={setSearchId}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.searchButton} onPress={fetchPatientVitals}>
            <Text style={styles.searchButtonText}>Check</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 50 }} />
        ) : vitals.length > 0 ? (
          <>
            <View style={styles.patientBadge}>
              <View>
                <Text style={styles.patientNameText}>{patientName}</Text>
                <Text style={styles.lastUpdateText}>Data Recorded: {lastUpdated}</Text>
              </View>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            </View>

            <View style={styles.vitalsGrid}>
              {vitals.map(v => (
                <VitalMetricCard key={v.id} vital={v} />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="stethoscope" size={80} color="#CBD5E1" />
            <Text style={styles.emptyText}>Enter a Patient ID to view live vital signs</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DoctorVitalsLookup;

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#F4F6F8" },
  searchHeader: {
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 15 },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B' },
  searchButton: { backgroundColor: '#1E3A8A', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  searchButtonText: { color: '#FFF', fontWeight: 'bold' },

  listContent: { padding: 16 },
  patientBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#1E3A8A',
  },
  patientNameText: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  lastUpdateText: { fontSize: 12, color: '#64748B', marginTop: 4 },

  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardContainer: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statusPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 9, fontWeight: 'bold', color: '#FFF' },
  vitalLabel: { fontSize: 13, color: "#64748B", fontWeight: '600' },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 5 },
  vitalValue: { fontSize: 28, fontWeight: '900', color: "#0F172A" },
  vitalUnit: { fontSize: 12, color: "#475569", marginLeft: 4, marginBottom: 5 },

  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94A3B8', marginTop: 15, fontSize: 16, textAlign: 'center', paddingHorizontal: 40 },
});