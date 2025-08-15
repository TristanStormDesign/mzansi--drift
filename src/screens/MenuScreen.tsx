import React, { useEffect, useState } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { menuStyles as styles } from '../styles/MenuStyles';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function MenuScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [highScore, setHighScore] = useState<number | null>(null);
  const [country, setCountry] = useState('');
  const [flagUri, setFlagUri] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const scoreDoc = await getDoc(doc(db, 'scores', currentUser.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUsername(data.username || '');
        setCountry(data.country || '');
        setFlagUri(data.profilePhoto || null);
      }

      if (scoreDoc.exists()) {
        setHighScore(scoreDoc.data().highScore ?? 0);
        setRank(scoreDoc.data().rank ?? null);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Image source={require('../assets/menu/car.webp')} style={styles.car} resizeMode="contain" />
        <View style={styles.statsBlock}>
          <Text style={styles.statsText}>User: {username || '---'}</Text>
          <Text style={styles.statsText}>High Score: {highScore ?? 0}</Text>
          <View style={styles.flagRow}>
            {flagUri && <Image source={{ uri: flagUri }} style={styles.flag} />}
            <Text style={styles.statsText}>{country || '---'}</Text>
          </View>
          <Text style={styles.statsText}>Rank: {rank ?? '---'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('Game' as never)}>
        <Text style={styles.playButtonText}>Play Game</Text>
      </TouchableOpacity>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings' as never)}>
          <Image source={require('../assets/menu/settings-icon.webp')} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navButtonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Account' as never)}>
          <Image source={require('../assets/menu/account-icon.webp')} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navButtonText}>Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Garage' as never)}>
          <Image source={require('../assets/menu/garage-icon.webp')} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navButtonText}>Garage</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Rankings' as never)}>
          <Image source={require('../assets/menu/rankings-icon.webp')} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navButtonText}>Rankings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

