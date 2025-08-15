import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { rankingsStyles } from '../styles/RankingsStyles';

import goldMedal from '../assets/rankings/gold.webp';
import silverMedal from '../assets/rankings/silver.webp';
import bronzeMedal from '../assets/rankings/bronze.webp';

type Player = {
  id: string;
  username: string;
  countryFlag: string | null;
  highScore: number;
};

export default function RankingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = rankingsStyles(insets);

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'scores'), orderBy('highScore', 'desc'));
        const snapshot = await getDocs(q);

        const fetchedPlayers: Player[] = [];
        for (const docSnap of snapshot.docs) {
          const scoreData = docSnap.data();
          const userDoc = await getDoc(doc(db, 'users', docSnap.id));
          const userData = userDoc.exists() ? userDoc.data() : {};

          fetchedPlayers.push({
            id: docSnap.id,
            username: (userData.username as string) || 'Unknown',
            countryFlag: (userData.profilePhoto as string) || null,
            highScore: (scoreData.highScore as number) || 0,
          });
        }
        setPlayers(fetchedPlayers);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };

    fetchLeaderboard();
  }, []);

  const renderItem = ({ item, index }: { item: Player; index: number }) => {
    let medalIcon = null;
    let bgColor = 'rgba(255,255,255,0.85)';
    let borderColor = '#2F5D50';
    let textColor = '#000';

    if (index === 0) {
      medalIcon = goldMedal;
      bgColor = 'rgba(255, 215, 0, 0.2)';
      borderColor = '#B8860B';
      textColor = '#000';
    } else if (index === 1) {
      medalIcon = silverMedal;
      bgColor = 'rgba(192, 192, 192, 0.2)';
      borderColor = '#808080';
      textColor = '#000';
    } else if (index === 2) {
      medalIcon = bronzeMedal;
      bgColor = 'rgba(205, 127, 50, 0.2)';
      borderColor = '#8B4513';
      textColor = '#000';
    }

    return (
      <View style={[styles.playerRow, { backgroundColor: bgColor, borderColor }]}>
        {medalIcon ? (
          <Image source={medalIcon} style={styles.medalIcon} resizeMode="contain" />
        ) : (
          <Text style={[styles.rankText, { color: textColor }]}>{index + 1}</Text>
        )}
        {item.countryFlag && (
          <Image
            source={{ uri: item.countryFlag }}
            style={styles.flagIcon}
            resizeMode="contain"
          />
        )}
        <Text style={[styles.usernameText, { color: textColor }]}>{item.username}</Text>
        <Text style={[styles.scoreText, { color: textColor }]}>{item.highScore}</Text>
      </View>
    );
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.heading}>RANKINGS</Text>
          <FlatList
            data={players}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
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
