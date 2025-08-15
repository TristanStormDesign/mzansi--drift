import React from 'react';
import { View, Text } from 'react-native';
import BackButton from '../components/BackButton';
import { rankingsStyles as styles } from '../styles/RankingsStyles';

export default function RankingsScreen() {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.text}>Rankings</Text>
    </View>
  );
}
