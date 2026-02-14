import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SERVER_URL  from '../../config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

type VitalsStatus = 'Good' | 'Warning' | 'Critical';

type VitalMetric = {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: VitalsStatus;
  trendIcon: keyof typeof Ionicons.glyphMap;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

/* ------------------ Status Logic ------------------ */

const getStatus = (type: string, value?: number | string): VitalsStatus => {
  if (value === null || value === undefined) return 'Warning';

  switch (type) {
    case 'heart_rate':
      return value >= 60 && value <= 100 ? 'Good' : 'Warning';
    case 'spo2':
      return value >= 95 ? 'Good' : 'Critical';
    case 'respiration_rate':
      return value >= 12 && value <= 20 ? 'Good' : 'Warning';
    case 'blood_sugar':
      return value <= 120 ? 'Good' : 'Critical';
    default:
      return 'Good';
  }
};

const getColor = (status: VitalsStatus) =>
  status === 'Good' ? '#10B981' : status === 'Warning' ? '#F59E0B' : '#EF4444';

/* ------------------ Card Component ------------------ */

const VitalMetricCard = ({ vital }: { vital: VitalMetric }) => {
  const statusBg =
    vital.status === 'Critical'
      ? '#FEF2F2'
      : vital.status === 'Warning'
      ? '#FFFBEB'
      : '#ECFDF5';

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

      <View style={styles.trendContainer}>
        <Text style={styles.trendPlaceholder}>[Mini Trend]</Text>
        <Ionicons name="arrow-up-circle-outline" size={18} color={vital.color} />
      </View>
    </View>
  );
};

/* ------------------ Main Screen ------------------ */

const VitalsCheckScreen = () => {
  const [vitals, setVitals] = useState<VitalMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const patientId = await AsyncStorage.getItem('PATIENT_ID');
        if (!patientId) return;

        const res = await fetch(`${SERVER_URL}/patient/vitals/${patientId}`);
        const data = await res.json();

        const mappedVitals: VitalMetric[] = [
          {
            id: 'hr',
            label: 'Heart Rate',
            value: data.heart_rate?.toString() || '--',
            unit: 'BPM',
            status: getStatus('heart_rate', data.heart_rate),
            color: getColor(getStatus('heart_rate', data.heart_rate)),
            icon: 'heart-pulse',
            trendIcon: 'arrow-up-circle-outline',
          },
          {
            id: 'bp',
            label: 'Blood Pressure',
            value: data.blood_pressure || '--',
            unit: 'mmHg',
            status: 'Warning',
            color: '#F59E0B',
            icon: 'blood-bag',
            trendIcon: 'remove-circle-outline',
          },
          {
            id: 'temp',
            label: 'Temperature',
            value: data.temperature?.toString() || '--',
            unit: '°F',
            status: 'Good',
            color: '#10B981',
            icon: 'thermometer',
            trendIcon: 'remove-circle-outline',
          },
          {
            id: 'spo2',
            label: 'SpO2',
            value: data.spo2?.toString() || '--',
            unit: '%',
            status: getStatus('spo2', data.spo2),
            color: getColor(getStatus('spo2', data.spo2)),
            icon: 'chart-bell-curve-cumulative',
            trendIcon: 'arrow-up-circle-outline',
          },
          {
            id: 'rr',
            label: 'Respiration Rate',
            value: data.respiration_rate?.toString() || '--', // ✅ ADDED
            unit: 'Breaths/Min',
            status: getStatus('respiration_rate', data.respiration_rate),
            color: getColor(getStatus('respiration_rate', data.respiration_rate)),
            icon: 'lungs',
            trendIcon: 'remove-circle-outline',
          },
          {
            id: 'bs',
            label: 'Blood Sugar',
            value: data.blood_sugar?.toString() || '--',
            unit: 'mg/dL',
            status: getStatus('blood_sugar', data.blood_sugar),
            color: getColor(getStatus('blood_sugar', data.blood_sugar)),
            icon: 'diabetes',
            trendIcon: 'arrow-up-circle-outline',
          },
        ];

        setVitals(mappedVitals);
        setLastUpdated(new Date(data.created_at).toLocaleString());
      } catch (err) {
        console.error('Vitals fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Current Vitals Dashboard</Text>
        <Text style={styles.lastUpdateText}>Last Update: {lastUpdated}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.vitalsGrid}>
          {vitals.map(v => (
            <VitalMetricCard key={v.id} vital={v} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default VitalsCheckScreen;

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
  lastUpdateText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // --- Grid and Card Styles ---
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
    opacity: 0.8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  vitalLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: '500',
    marginBottom: 5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  vitalValue: {
    fontSize: 32,
    fontWeight: '900',
    color: "#0F172A",
    lineHeight: 32,
  },
  vitalUnit: {
    fontSize: 14,
    color: "#475569",
    fontWeight: '600',
    marginLeft: 5,
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  trendPlaceholder: {
    fontSize: 10,
    color: "#94A3B8",
  },

  // --- Additional Metrics Section ---
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  additionalMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  additionalMetricText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    marginLeft: 10,
    fontWeight: '500',
  },
  detailLink: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
});