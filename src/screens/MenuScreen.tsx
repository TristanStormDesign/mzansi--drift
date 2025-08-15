import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MenuScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Menu</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings' as never)}>
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Account' as never)}>
        <Text style={styles.buttonText}>Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Garage' as never)}>
        <Text style={styles.buttonText}>Garage</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Rankings' as never)}>
        <Text style={styles.buttonText}>Rankings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
  title: { color: '#fff', fontSize: 32, marginBottom: 40 },
  button: { backgroundColor: '#333', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8, marginVertical: 10, width: '80%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18 }
});
