import React from 'react';
import { View, Text } from 'react-native';
import BackButton from '../components/BackButton';
import { settingsStyles as styles } from '../styles/SettingsStyles';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.text}>Settings</Text>
    </View>
  );
}
