import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BackButton from '../components/BackButton';

export default function GarageScreen() {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.text}>Garage</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  text: { color: '#fff', fontSize: 24 },
});
