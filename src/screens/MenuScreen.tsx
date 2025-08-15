import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { menuStyles as styles } from '../styles/MenuStyles';

export default function MenuScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('Game' as never)}>
          <Text style={styles.playButtonText}>Play Game</Text>
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
