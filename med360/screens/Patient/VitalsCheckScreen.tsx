import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    Dimensions,
    TouchableOpacity 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Dimensions for responsive card layout (Optional, can use Flexbox only)
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // Two cards per row with margin

// --- Type Definitions ---
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

// --- Dummy Data (Simulated Real-time Data) ---

const DUMMY_VITALS: VitalMetric[] = [
    {
        id: 'hr',
        label: 'Heart Rate',
        value: '72',
        unit: 'BPM',
        status: 'Good',
        trendIcon: 'arrow-up-circle-outline',
        color: '#10B981', // Emerald Green
        icon: 'heart-pulse',
    },
    {
        id: 'bp',
        label: 'Blood Pressure',
        value: '128/85',
        unit: 'mmHg',
        status: 'Warning',
        trendIcon: 'arrow-down-circle-outline',
        color: '#F59E0B', // Amber Yellow
        icon: 'blood-bag',
    },
    {
        id: 'temp',
        label: 'Temperature',
        value: '98.6',
        unit: '°F',
        status: 'Good',
        trendIcon: 'remove-circle-outline',
        color: '#10B981',
        icon: 'thermometer',
    },
    {
        id: 'spo2',
        label: 'SpO2',
        value: '97',
        unit: '%',
        status: 'Good',
        trendIcon: 'arrow-up-circle-outline',
        color: '#10B981',
        icon: 'chart-bell-curve-cumulative',
    },
    {
        id: 'rr',
        label: 'Respiration Rate',
        value: '16',
        unit: 'Breaths/Min',
        status: 'Good',
        trendIcon: 'remove-circle-outline',
        color: '#10B981',
        icon: 'lungs',
    },
    {
        id: 'bs',
        label: 'Blood Sugar (Fasting)',
        value: '135',
        unit: 'mg/dL',
        status: 'Critical',
        trendIcon: 'arrow-up-circle-outline',
        color: '#EF4444', // Red
        icon: 'diabetes',
    },
];

// --- Sub-Components ---

/**
 * @description Card component to display a single vital metric.
 */
const VitalMetricCard: React.FC<{ vital: VitalMetric }> = ({ vital }) => {
    
    // Style adjustments based on status
    const statusColor = vital.color;
    const statusBg = vital.status === 'Critical' ? '#FEF2F2' : vital.status === 'Warning' ? '#FFFBEB' : '#ECFDF5';

    return (
        <View style={[styles.cardContainer, { borderColor: statusColor, backgroundColor: statusBg }]}>
            
            {/* Vital Icon and Status Pill */}
            <View style={styles.cardHeader}>
                <MaterialCommunityIcons 
                    name={vital.icon} 
                    size={28} 
                    color={statusColor} 
                />
                <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{vital.status}</Text>
                </View>
            </View>

            {/* Vital Name */}
            <Text style={styles.vitalLabel}>{vital.label}</Text>

            {/* Vital Value */}
            <View style={styles.valueRow}>
                <Text style={styles.vitalValue}>{vital.value}</Text>
                <Text style={styles.vitalUnit}>{vital.unit}</Text>
            </View>

            {/* Placeholder for Mini-Trend Chart */}
            <View style={styles.trendContainer}>
                <Text style={styles.trendPlaceholder}>[Mini Trend Chart]</Text>
                <Ionicons 
                    name={vital.trendIcon} 
                    size={18} 
                    color={statusColor} 
                />
            </View>
        </View>
    );
};

// --- Main Screen Component ---

const VitalsCheckScreen: React.FC = () => {

    const lastUpdated = "Dec 30, 2025 at 9:50 PM";

    const handleViewDetails = (label: string) => {
        alert(`Navigating to detailed view for ${label}...`);
    }

    return (
        <View style={styles.screenContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Current Vitals Dashboard</Text>
                <Text style={styles.headerSubtitle}>
                    Real-time metrics for <Text style={{fontWeight: 'bold'}}>John Smith</Text>
                </Text>
                <Text style={styles.lastUpdateText}>
                    Last Update: {lastUpdated} 
                    <Ionicons name="refresh-circle" size={14} color="#64748B" style={{marginLeft: 5}}/>
                </Text>
            </View>

            <ScrollView 
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.vitalsGrid}>
                    {DUMMY_VITALS.map((vital) => (
                        <VitalMetricCard key={vital.id} vital={vital} />
                    ))}
                </View>

                {/* Additional Metrics Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Activity & Lifestyle Metrics</Text>
                    <View style={styles.additionalMetricRow}>
                        <Ionicons name="walk" size={24} color="#1E3A8A" />
                        <Text style={styles.additionalMetricText}>Steps Today: <Text style={{fontWeight: 'bold', color: '#1E3A8A'}}>8,500</Text></Text>
                        <TouchableOpacity onPress={() => handleViewDetails('Steps')}>
                            <Text style={styles.detailLink}>View Goal</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.additionalMetricRow}>
                        <Ionicons name="water" size={24} color="#1E3A8A" />
                        <Text style={styles.additionalMetricText}>Hydration: <Text style={{fontWeight: 'bold', color: '#1E3A8A'}}>6 / 8 glasses</Text></Text>
                        <TouchableOpacity onPress={() => handleViewDetails('Hydration')}>
                            <Text style={styles.detailLink}>Log Water</Text>
                        </TouchableOpacity>
                    </View>
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