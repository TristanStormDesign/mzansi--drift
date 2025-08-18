import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut, deleteUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { settingsStyles } from '../styles/SettingsStyles';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { PixelTexture } from '../components/PixelTexture';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = settingsStyles(insets);
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });

  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [flagUri, setFlagUri] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setEmail(user.email || '');
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || '');
          setOriginalUsername(data.username || '');
          setCountry(data.country || '');
          setFlagUri(data.profilePhoto || null);
        }
      } else {
        setIsLoggedIn(false);
      }
    });
    return unsub;
  }, []);

  if (!fontsLoaded) return null;

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { username });
    setOriginalUsername(username);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.navigate('Menu' as never);
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid));
    await deleteDoc(doc(db, 'scores', user.uid));
    await deleteUser(user);
    navigation.navigate('Menu' as never);
  };

  const usernameChanged = username.trim() !== originalUsername.trim();

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.heading}>GAME SETTINGS</Text>
          <TouchableOpacity style={styles.primaryButton}>
            <PixelTexture baseColor="#a5d6a7" accentColor="#81c784" opacity={0.25} />
            <Text style={styles.primaryButtonText}>MUTE MUSIC</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton}>
            <PixelTexture baseColor="#a5d6a7" accentColor="#81c784" opacity={0.25} />
            <Text style={styles.primaryButtonText}>MUTE SFX</Text>
          </TouchableOpacity>
        </View>

        {isLoggedIn && (
          <View style={styles.card}>
            <Text style={styles.heading}>ACCOUNT SETTINGS</Text>

            <Text style={styles.label}>MAIL</Text>
            <Text style={styles.value}>{email}</Text>

            <Text style={styles.label}>USERNAME</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#555"
            />

            <Text style={styles.label}>COUNTRY</Text>
            <View style={styles.countryRow}>
              {flagUri && <Image source={{ uri: flagUri }} style={styles.flagSmall} />}
              <Text style={styles.value}>{country}</Text>
            </View>

            {usernameChanged && (
              <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                <PixelTexture baseColor="#a5d6a7" accentColor="#81c784" opacity={0.25} />
                <Text style={styles.primaryButtonText}>SAVE</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogout}>
              <PixelTexture baseColor="#a5d6a7" accentColor="#81c784" opacity={0.25} />
              <Text style={styles.primaryButtonText}>LOG OUT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.primaryButton, styles.deleteButton]} onPress={handleDeleteAccount}>
              <PixelTexture baseColor="#ef9a9a" accentColor="#e57373" opacity={0.25} />
              <Text style={styles.primaryButtonText}>DELETE ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.returnButtonContainer}>
        <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
          <PixelTexture baseColor="#9fa8da" accentColor="#7986cb" opacity={0.25} />
          <Text style={styles.returnText}>RETURN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
