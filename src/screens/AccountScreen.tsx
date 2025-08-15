import React from 'react';
import { View, Text } from 'react-native';
import BackButton from '../components/BackButton';
import { accountStyles as styles } from '../styles/AccountStyles';

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.text}>Account</Text>
    </View>
  );
}
