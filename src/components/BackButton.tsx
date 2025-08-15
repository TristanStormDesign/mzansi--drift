import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BackButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
      <Text style={styles.text}>Back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { position: 'absolute', top: 40, left: 20, backgroundColor: '#333', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  text: { color: '#fff', fontSize: 16 }
});
