import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Image, ImageBackground, Animated } from 'react-native';
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
  const [loginToastAnim] = useState(new Animated.Value(0));
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [highScoreToastAnim] = useState(new Animated.Value(0));
  const [showHighScoreToast, setShowHighScoreToast] = useState(false);
  const [highScore, setHighScore] = useState(0);

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
            setHighScore(data.highScore || 0);
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
        setHighScore(0);
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

  const triggerLoginToast = () => {
    setShowLoginToast(true);
    Animated.sequence([
      Animated.timing(loginToastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(loginToastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowLoginToast(false));
  };

  const triggerHighScoreToast = () => {
    setShowHighScoreToast(true);
    Animated.sequence([
      Animated.timing(highScoreToastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(highScoreToastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowHighScoreToast(false));
  };

  if (!fontsLoaded) return null;

  const isLoggedIn = !!currentUser;

  return (
    <ImageBackground source={bgImage()} style={styles.flex} resizeMode="cover">
      <View style={styles.topRow}>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={styles.infoCard}
            disabled={!isLoggedIn} // disable when logged out
            onPress={() => {
              if (isLoggedIn) {
                triggerHighScoreToast();
              }
            }}
          >
            {profilePhoto ? <Image source={{ uri: profilePhoto }} style={styles.flagIcon} /> : null}
            <Text style={styles.infoText}>{isLoggedIn ? username : 'GUEST'}</Text>
          </TouchableOpacity>
          {isLoggedIn && showHighScoreToast && (
            <Animated.View
              style={[
                styles.highScoreToast,
                {
                  opacity: highScoreToastAnim,
                  transform: [
                    {
                      translateY: highScoreToastAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-5, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.toastText}>Best: {highScore}</Text>
            </Animated.View>
          )}
        </View>
        <View style={styles.infoCard}>
          <Image source={coinIcon} style={styles.coinIcon} />
          <Text style={styles.infoText}>{coinBalance}</Text>
        </View>
      </View>

      {showLoginToast && (
        <Animated.View
          style={[
            styles.loginToast,
            {
              opacity: loginToastAnim,
              transform: [
                {
                  translateY: loginToastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Image source={accountIcon} style={styles.toastIcon} />
          <Text style={styles.loginToastText}>Login to play Multiplayer</Text>
        </Animated.View>
      )}

      <View style={styles.bottomSection}>
        <View style={styles.startButtons}>
          <TouchableOpacity style={styles.pixelButtonOuter} onPress={() => navigation.navigate('Game' as never)}>
            <View style={styles.pixelButtonInner}>
              <Text style={styles.startButtonText}>PLAY</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pixelButtonOuterGrey, !isLoggedIn && styles.startButtonDisabled]}
            onPress={() => {
              if (isLoggedIn) {
                navigation.navigate('Multiplayer' as never);
              } else {
                triggerLoginToast();
              }
            }}
          >
            <View style={styles.pixelButtonInnerGrey}>
              <Text style={styles.startButtonTextSmall}>MULTIPLAYER</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.menuRow}>
          {!isLoggedIn && (
            <View style={styles.navItem}>
              <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Account' as never)}>
                <View style={styles.navButtonInner}>
                  <Image source={accountIcon} style={styles.navIcon} />
                </View>
              </TouchableOpacity>
              <Text style={styles.navLabel}>LOGIN</Text>
            </View>
          )}
          <View style={styles.navItem}>
            <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Settings' as never)}>
              <View style={styles.navButtonInner}>
                <Image source={require('../assets/menu/settings-icon.webp')} style={styles.navIcon} />
              </View>
            </TouchableOpacity>
            <Text style={styles.navLabel}>SETTINGS</Text>
          </View>
          <View style={styles.navItem}>
            <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Garage' as never)}>
              <View style={styles.navButtonInner}>
                <Image source={require('../assets/menu/garage-icon.webp')} style={styles.navIcon} />
              </View>
            </TouchableOpacity>
            <Text style={styles.navLabel}>GARAGE</Text>
          </View>
          <View style={styles.navItem}>
            <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Rankings' as never)}>
              <View style={styles.navButtonInner}>
                <Image source={require('../assets/menu/rankings-icon.webp')} style={styles.navIcon} />
              </View>
            </TouchableOpacity>
            <Text style={styles.navLabel}>RANKINGS</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
