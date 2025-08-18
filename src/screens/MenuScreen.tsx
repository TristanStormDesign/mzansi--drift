import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Image, ImageBackground } from 'react-native';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { menuStyles } from '../styles/MenuStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import coinIcon from '../assets/coin/coin.webp';
import accountIcon from '../assets/menu/account-icon.webp';

import bg from '../assets/bgs/bg.webp';
import wingBg from '../assets/bgs/wing-bg.webp';
import stripesBg from '../assets/bgs/stripes-bg.webp';
import plateBg from '../assets/bgs/plate-bg.webp';
import wingStripesBg from '../assets/bgs/stripes-wing-bg.webp';
import wingPlateBg from '../assets/bgs/wing-plate-bg.webp';
import stripesPlateBg from '../assets/bgs/stripes-plate-bg.webp';
import wingStripesPlateBg from '../assets/bgs/stripes-plate-wing-bg.webp';

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const styles = menuStyles(insets);
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [wingEquipped, setWingEquipped] = useState(false);
  const [stripesEquipped, setStripesEquipped] = useState(false);
  const [plateEquipped, setPlateEquipped] = useState(false);

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
        setWingEquipped(false);
        setStripesEquipped(false);
        setPlateEquipped(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  const bgImage = () => {
    if (wingEquipped && stripesEquipped && plateEquipped) return wingStripesPlateBg;
    if (wingEquipped && stripesEquipped) return wingStripesBg;
    if (wingEquipped && plateEquipped) return wingPlateBg;
    if (stripesEquipped && plateEquipped) return stripesPlateBg;
    if (wingEquipped) return wingBg;
    if (stripesEquipped) return stripesBg;
    if (plateEquipped) return plateBg;
    return bg;
  };

  if (!fontsLoaded) return null;

  const isLoggedIn = !!currentUser;

  return (
    <ImageBackground source={bgImage()} style={styles.flex} resizeMode="cover">
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.infoCard} onPress={() => !isLoggedIn && navigation.navigate('Account' as never)}>
          {profilePhoto ? <Image source={{ uri: profilePhoto }} style={styles.flagIcon} /> : null}
          <Text style={styles.infoText}>{isLoggedIn ? username : 'LOGIN'}</Text>
        </TouchableOpacity>
        <View style={styles.infoCard}>
          <Image source={coinIcon} style={styles.coinIcon} />
          <Text style={styles.infoText}>{coinBalance}</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.startButtons}>
          <TouchableOpacity style={styles.pixelButtonOuter} onPress={() => navigation.navigate('Game' as never)}>
            <View style={styles.pixelButtonInner}>
              <Text style={styles.startButtonText}>PLAY</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pixelButtonOuterGrey, !isLoggedIn && styles.startButtonDisabled]}
            disabled={!isLoggedIn}
            onPress={() => {
              if (isLoggedIn) {
                navigation.navigate('Multiplayer' as never);
              }
            }}
          >
            <View style={styles.pixelButtonInnerGrey}>
              <Text style={styles.startButtonTextSmall}>MULTIPLAYER</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.menuRow}>
          {!currentUser && (
            <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Account' as never)}>
              <View style={styles.navButtonInner}>
                <Image source={accountIcon} style={styles.navIcon} />
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Settings' as never)}>
            <View style={styles.navButtonInner}>
              <Image source={require('../assets/menu/settings-icon.webp')} style={styles.navIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Garage' as never)}>
            <View style={styles.navButtonInner}>
              <Image source={require('../assets/menu/garage-icon.webp')} style={styles.navIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Rankings' as never)}>
            <View style={styles.navButtonInner}>
              <Image source={require('../assets/menu/rankings-icon.webp')} style={styles.navIcon} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
