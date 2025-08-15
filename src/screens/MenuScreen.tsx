import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Image, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { menuStyles as styles } from '../styles/MenuStyles';
import { useFonts, Silkscreen_400Regular, Silkscreen_700Bold } from '@expo-google-fonts/silkscreen';

export default function MenuScreen() {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Silkscreen_400Regular,
    Silkscreen_700Bold,
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('Game' as never)}>
          <Animated.Text
            style={[
              styles.playButtonText,
              { transform: [{ scale: scaleAnim }], fontFamily: 'Silkscreen_400Regular' }
            ]}
          >
            START
          </Animated.Text>
        </TouchableOpacity>
        <View style={styles.navRow}>
          <TouchableOpacity style={[styles.navButton, styles.settingsBorder]} onPress={() => navigation.navigate('Settings' as never)}>
            <Image source={require('../assets/menu/settings-icon.webp')} style={styles.navIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, styles.accountBorder]} onPress={() => navigation.navigate('Account' as never)}>
            <Image source={require('../assets/menu/account-icon.webp')} style={styles.navIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, styles.garageBorder]} onPress={() => navigation.navigate('Garage' as never)}>
            <Image source={require('../assets/menu/garage-icon.webp')} style={styles.navIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, styles.rankingsBorder]} onPress={() => navigation.navigate('Rankings' as never)}>
            <Image source={require('../assets/menu/rankings-icon.webp')} style={styles.navIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
