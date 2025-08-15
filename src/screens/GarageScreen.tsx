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

  const [wingEquipped, setWingEquipped] = useState(false);
  const [stripesEquipped, setStripesEquipped] = useState(false);
  const [plateEquipped, setPlateEquipped] = useState(false);

  const upgradeCosts = {
    hasWing: 200,
    hasStripes: 150,
    hasPlate: 100,
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
          setWingEquipped(data.wingEquipped || false);
          setStripesEquipped(data.stripesEquipped || false);
          setPlateEquipped(data.plateEquipped || false);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUpgradeAction = async (
    field: string,
    cost: number,
    equippedSetter: React.Dispatch<React.SetStateAction<boolean>>,
    ownedSetter: React.Dispatch<React.SetStateAction<boolean>>,
    isEquipped: boolean,
    isOwned: boolean
  ) => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const currentCoins = data.coins || 0;
    if (!isOwned) {
      if (currentCoins >= cost) {
        await updateDoc(ref, {
          [field]: true,
          coins: currentCoins - cost,
          [`${field.replace('has', '').toLowerCase()}Equipped`]: true,
        });
        setCoinBalance(currentCoins - cost);
        ownedSetter(true);
        equippedSetter(true);
      }
      return;
    }
    const newValue = !isEquipped;
    await updateDoc(ref, {
      [`${field.replace('has', '').toLowerCase()}Equipped`]: newValue,
    });
    equippedSetter(newValue);
  };

  const carImage = useMemo(() => {
    if (wingEquipped && stripesEquipped && plateEquipped) return stockWingStripesPlate;
    if (wingEquipped && stripesEquipped) return stockWingStripes;
    if (wingEquipped && plateEquipped) return stockWingPlate;
    if (stripesEquipped && plateEquipped) return stockStripesPlate;
    if (wingEquipped) return stockWing;
    if (stripesEquipped) return stockStripes;
    if (plateEquipped) return stockPlate;
    return stock;
  }, [wingEquipped, stripesEquipped, plateEquipped]);

  const renderUpgradeRow = (
    label: string,
    image: any,
    field: string,
    cost: number,
    isOwned: boolean,
    isEquipped: boolean,
    equippedSetter: React.Dispatch<React.SetStateAction<boolean>>,
    ownedSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => (
    <View style={styles.upgradeRowContainer}>
      <View style={styles.upgradeInfoCard}>
        <Text style={styles.upgradeText}>{label}</Text>
        <Image source={image} style={styles.upgradeImage} />
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleUpgradeAction(field, cost, equippedSetter, ownedSetter, isEquipped, isOwned)}
      >
        {!isOwned ? (
          <View style={styles.priceContent}>
            <Image source={coinIcon} style={styles.coinSmall} />
            <Text style={styles.priceText}>{cost}</Text>
          </View>
        ) : isEquipped ? (
          <Text style={styles.equipText}>Unequip</Text>
        ) : (
          <Text style={styles.equipText}>Equip</Text>
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
            {renderUpgradeRow('Wing', wingIcon, 'hasWing', upgradeCosts.hasWing, hasWing, wingEquipped, setWingEquipped, setHasWing)}
            {renderUpgradeRow('Stripes', stripesIcon, 'hasStripes', upgradeCosts.hasStripes, hasStripes, stripesEquipped, setStripesEquipped, setHasStripes)}
            {renderUpgradeRow('Plate', plateIcon, 'hasPlate', upgradeCosts.hasPlate, hasPlate, plateEquipped, setPlateEquipped, setHasPlate)}
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
