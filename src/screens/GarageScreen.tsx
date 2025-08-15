import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { garageStyles } from '../styles/GarageStyles';

import stock from '../assets/garage/stock.webp';
import stockWing from '../assets/garage/stock-wing.webp';
import stockStripes from '../assets/garage/stock-stripes.webp';
import stockPlate from '../assets/garage/stock-plate.webp';
import stockWingStripes from '../assets/garage/stock-wing-stripes.webp';
import stockWingPlate from '../assets/garage/stock-wing-plate.webp';
import stockStripesPlate from '../assets/garage/stock-stripes-plate.webp';
import stockWingStripesPlate from '../assets/garage/stock-wing-stripes-plate.webp';

import wingIcon from '../assets/garage/wing.webp';
import stripesIcon from '../assets/garage/stripes.webp';
import plateIcon from '../assets/garage/plate.webp';
import coinIcon from '../assets/coin/coin.webp';

export default function GarageScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = garageStyles(insets);

  const [coinBalance, setCoinBalance] = useState(0);
  const [username, setUsername] = useState('');
  const [countryFlag, setCountryFlag] = useState('');
  const [hasWing, setHasWing] = useState(false);
  const [hasStripes, setHasStripes] = useState(false);
  const [hasPlate, setHasPlate] = useState(false);

  const upgradeCosts = {
    wing: 200,
    stripes: 150,
    plate: 100,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUsername(data.username || '');
          setCountryFlag(data.profilePhoto || '');
          setCoinBalance(data.coins || 0);
          setHasWing(data.hasWing || false);
          setHasStripes(data.hasStripes || false);
          setHasPlate(data.hasPlate || false);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUpgradeAction = async (key, cost) => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    const owned = data[key] || false;

    if (!owned) {
      if (data.coins >= cost) {
        await updateDoc(ref, { [key]: true, coins: data.coins - cost });
        setCoinBalance(prev => prev - cost);
        if (key === 'hasWing') setHasWing(true);
        if (key === 'hasStripes') setHasStripes(true);
        if (key === 'hasPlate') setHasPlate(true);
      }
    } else {
      const newValue = !owned;
      await updateDoc(ref, { [key]: newValue });
      if (key === 'hasWing') setHasWing(newValue);
      if (key === 'hasStripes') setHasStripes(newValue);
      if (key === 'hasPlate') setHasPlate(newValue);
    }
  };

  const carImage = useMemo(() => {
    if (hasWing && hasStripes && hasPlate) return stockWingStripesPlate;
    if (hasWing && hasStripes) return stockWingStripes;
    if (hasWing && hasPlate) return stockWingPlate;
    if (hasStripes && hasPlate) return stockStripesPlate;
    if (hasWing) return stockWing;
    if (hasStripes) return stockStripes;
    if (hasPlate) return stockPlate;
    return stock;
  }, [hasWing, hasStripes, hasPlate]);

  const renderUpgradeRow = (label, image, key, cost, owned) => (
    <View style={styles.upgradeRowContainer}>
      <View style={styles.upgradeInfoCard}>
        <Text style={styles.upgradeText}>{label}</Text>
        <Image source={image} style={styles.upgradeImage} />
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleUpgradeAction(key, cost)}
      >
        {owned ? (
          <Text style={styles.equipText}>Equip</Text>
        ) : (
          <View style={styles.priceContent}>
            <Image source={coinIcon} style={styles.coinSmall} />
            <Text style={styles.priceText}>{cost}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.userInfo}>
            {countryFlag ? (
              <Image source={{ uri: countryFlag }} style={styles.flagIcon} />
            ) : null}
            <Text style={styles.username}>{username}</Text>
          </View>
          <View style={styles.coinBar}>
            <Image source={coinIcon} style={styles.coinIcon} />
            <Text style={styles.coinText}>{coinBalance}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>GARAGE</Text>
          <Image source={carImage} style={styles.carImage} resizeMode="contain" />
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>UPGRADES</Text>
          <View style={styles.upgradeList}>
            {renderUpgradeRow('Wing', wingIcon, 'hasWing', upgradeCosts.wing, hasWing)}
            {renderUpgradeRow('Stripes', stripesIcon, 'hasStripes', upgradeCosts.stripes, hasStripes)}
            {renderUpgradeRow('Plate', plateIcon, 'hasPlate', upgradeCosts.plate, hasPlate)}
          </View>
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
