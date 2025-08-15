import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gameStyles } from '../styles/GameStyles';

export default function GameScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = gameStyles(insets);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GAME</Text>

      <View style={styles.returnButtonContainer}>
        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.returnButtonText}>RETURN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
