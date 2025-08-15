import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { menuStyles as styles } from '../styles/MenuStyles';

export default function MenuScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Menu</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Game' as never)}>
        <Text style={styles.buttonText}>Play Game</Text>
      </TouchableOpacity>
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
