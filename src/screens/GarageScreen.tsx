import React from 'react';
import { View, Text } from 'react-native';
import BackButton from '../components/BackButton';
import { garageStyles as styles } from '../styles/GarageStyles';

export default function GarageScreen() {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.text}>Garage</Text>
    </View>
  );
}
