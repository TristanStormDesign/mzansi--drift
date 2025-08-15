import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Image, Animated, Easing } from 'react-native';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { menuStyles } from '../styles/MenuStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const styles = menuStyles(insets);
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const scoreDoc = await getDoc(doc(db, 'scores', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || '');
          setProfilePhoto(data.profilePhoto || null);
        }
        if (scoreDoc.exists()) {
          setHighScore(scoreDoc.data().highScore || 0);
        }
      } else {
        setCurrentUser(null);
        setUsername('');
        setProfilePhoto(null);
        setHighScore(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [scaleAnim]);

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.flex, { backgroundColor: '#ccc' }]}>
      {currentUser && (
        <View style={styles.userBox}>
          <Text style={styles.username}>{username}</Text>
          {profilePhoto && <Image source={{ uri: profilePhoto }} style={styles.flag} resizeMode="contain" />}
          <Text style={styles.score}>High Score: {highScore ?? 0}</Text>
        </View>
      )}
      <View style={styles.rightMenu}>
        {!currentUser && (
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Account' as never)}>
            <Image source={require('../assets/menu/account-icon.webp')} style={styles.navIcon} resizeMode="contain" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings' as never)}>
          <Image source={require('../assets/menu/settings-icon.webp')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Garage' as never)}>
          <Image source={require('../assets/menu/garage-icon.webp')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Rankings' as never)}>
          <Image source={require('../assets/menu/rankings-icon.webp')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
      <View style={styles.playButtonContainer}>
        <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('Game' as never)}>
          <Animated.Text style={[styles.playButtonText, { transform: [{ scale: scaleAnim }] }]}>
            START
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
