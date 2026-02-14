// screens/ViewVitalsScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ViewVitalsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vitals & Metrics</Text>
      <Text style={styles.subtitle}>
        This screen is currently under construction. 
      </Text>
    </View>
  );
};

export default ViewVitalsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
});