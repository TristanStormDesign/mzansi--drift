import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BackButton from '../components/BackButton';

export default function RankingsScreen() {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.text}>Rankings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  text: { color: '#fff', fontSize: 24 },
});
