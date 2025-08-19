import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Dimensions, PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
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

  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('highScore', 'desc'));
        const snap = await getDocs(q);
        const data: Player[] = snap.docs.map((d) => {
          const v = d.data() as any;
          return {
            id: d.id,
            username: (v.username as string) || 'Unknown',
            countryFlag: (v.profilePhoto as string) || null,
            highScore: (v.highScore as number) || 0,
          };
        });
        setPlayers(data.slice(0, 3));
      } catch (e) {
        console.error('Error fetching leaderboard:', e);
      }
    };
    load();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: Dimensions.get('window').height, duration: 400, useNativeDriver: true })
      .start(() => navigation.goBack());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) slideAnim.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) {
          handleClose();
        } else {
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const renderRow = (item: Player, index: number) => {
    let medal: any = null;
    let bg = 'rgba(255,255,255,0.08)';
    let border = '#2B2B2B';

    if (index === 0) { medal = goldMedal; bg = 'rgba(255,215,0,0.12)'; border = '#B8860B'; }
    else if (index === 1) { medal = silverMedal; bg = 'rgba(192,192,192,0.12)'; border = '#808080'; }
    else if (index === 2) { medal = bronzeMedal; bg = 'rgba(205,127,50,0.12)'; border = '#8B4513'; }

    return (
      <View key={item.id} style={[styles.playerRow, { backgroundColor: bg, borderColor: border }]}>
        {medal ? (
          <Image source={medal} style={styles.medalIcon} resizeMode="contain" />
        ) : (
          <Text style={styles.rankText}>{index + 1}</Text>
        )}
        {item.countryFlag ? <Image source={{ uri: item.countryFlag }} style={styles.flagSmall} resizeMode="cover" /> : <View style={{ width: 24 }} />}
        <Text style={styles.usernameText} numberOfLines={1}>{item.username}</Text>
        <Text style={styles.scoreText}>{item.highScore}</Text>
      </View>
    );
  };

  return (
    <View style={styles.flex}>
      <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]} {...panResponder.panHandlers}>
        <View style={styles.dragHandleWrapper}>
          <View style={styles.dragHandle} />
        </View>

        <Text style={styles.heading}>RANKINGS</Text>

        <View style={styles.listContainer}>
          {players.map(renderRow)}
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.returnButton} onPress={handleClose}>
            <Text style={styles.returnText}>RETURN</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
