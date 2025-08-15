import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Image, Animated, Easing } from 'react-native';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { menuStyles } from '../styles/MenuStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import coinIcon from '../assets/coin/coin.webp';
import stock from '../assets/garage/stock.webp';
import stockWing from '../assets/garage/stock-wing.webp';
import stockStripes from '../assets/garage/stock-stripes.webp';
import stockPlate from '../assets/garage/stock-plate.webp';
import stockWingStripes from '../assets/garage/stock-wing-stripes.webp';
import stockWingPlate from '../assets/garage/stock-wing-plate.webp';
import stockStripesPlate from '../assets/garage/stock-stripes-plate.webp';
import stockWingStripesPlate from '../assets/garage/stock-wing-stripes-plate.webp';

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const styles = menuStyles(insets);
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [hasWing, setHasWing] = useState(false);
  const [hasStripes, setHasStripes] = useState(false);
  const [hasPlate, setHasPlate] = useState(false);
  const [wingEquipped, setWingEquipped] = useState(false);
  const [stripesEquipped, setStripesEquipped] = useState(false);
  const [plateEquipped, setPlateEquipped] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const ref = doc(db, 'users', user.uid);
        const unsubscribeDoc = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUsername(data.username || '');
            setProfilePhoto(data.profilePhoto || null);
            setCoinBalance(data.coins || 0);
            setHasWing(data.hasWing || false);
            setHasStripes(data.hasStripes || false);
            setHasPlate(data.hasPlate || false);
            setWingEquipped(data.wingEquipped || false);
            setStripesEquipped(data.stripesEquipped || false);
            setPlateEquipped(data.plateEquipped || false);
          }
        });
        return unsubscribeDoc;
      } else {
        setCurrentUser(null);
        setUsername('');
        setProfilePhoto(null);
        setCoinBalance(0);
        setHasWing(false);
        setHasStripes(false);
        setHasPlate(false);
        setWingEquipped(false);
        setStripesEquipped(false);
        setPlateEquipped(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [scaleAnim]);

  const carImage = () => {
    if (wingEquipped && stripesEquipped && plateEquipped) return stockWingStripesPlate;
    if (wingEquipped && stripesEquipped) return stockWingStripes;
    if (wingEquipped && plateEquipped) return stockWingPlate;
    if (stripesEquipped && plateEquipped) return stockStripesPlate;
    if (wingEquipped) return stockWing;
    if (stripesEquipped) return stockStripes;
    if (plateEquipped) return stockPlate;
    return stock;
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.flex}>
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          {profilePhoto ? <Image source={{ uri: profilePhoto }} style={styles.flagIcon} /> : null}
          <Text style={styles.username}>{currentUser ? username : 'LOGIN'}</Text>
        </View>
        <View style={styles.coinBar}>
          <Image source={coinIcon} style={styles.coinIcon} />
          <Text style={styles.coinText}>{coinBalance}</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.carContainer}>
          <Image source={carImage()} style={styles.carImage} resizeMode="contain" />
        </View>
        <View style={styles.menuColumn}>
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
      </View>

      <View style={styles.startButtonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('Game' as never)}>
          <Animated.Text style={[styles.startButtonText, { transform: [{ scale: scaleAnim }] }]}>START</Animated.Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
