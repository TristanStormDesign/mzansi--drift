import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { multiplayerStyles } from '../styles/MultiplayerStyles';

export default function MultiplayerScreen() {
  const insets = useSafeAreaInsets();
  const styles = multiplayerStyles(insets);
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return unsub;
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.heading}>MULTIPLAYER</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {}}
            disabled={!currentUser}
          >
            <Text style={styles.primaryButtonText}>
              {currentUser ? 'JOIN GAME' : 'SIGN IN TO JOIN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {}}
            disabled={!currentUser}
          >
            <Text style={styles.primaryButtonText}>
              {currentUser ? 'CREATE GAME' : 'SIGN IN TO CREATE'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.returnButtonContainer}>
        <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
          <Text style={styles.returnText}>RETURN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
