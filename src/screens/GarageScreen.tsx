import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import soonIcon from '../assets/garage/soon.webp';

export default function GarageScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = garageStyles(insets);

  const [hasWing, setHasWing] = useState(false);
  const [hasStripes, setHasStripes] = useState(false);
  const [hasPlate, setHasPlate] = useState(false);

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

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.heading}>GARAGE</Text>
          <Image source={carImage} style={styles.carImage} resizeMode="contain" />
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>UPGRADES</Text>
          <View style={styles.upgradeList}>
            <TouchableOpacity style={styles.upgradeRow} onPress={() => setHasWing(!hasWing)}>
              <Text style={styles.upgradeText}>Wing</Text>
              <Image source={wingIcon} style={styles.upgradeImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.upgradeRow} onPress={() => setHasStripes(!hasStripes)}>
              <Text style={styles.upgradeText}>Stripes</Text>
              <Image source={stripesIcon} style={styles.upgradeImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.upgradeRow} onPress={() => setHasPlate(!hasPlate)}>
              <Text style={styles.upgradeText}>Plate</Text>
              <Image source={plateIcon} style={styles.upgradeImage} />
            </TouchableOpacity>
            <View style={[styles.upgradeRow, styles.moreSoonRow]}>
              <Text style={[styles.upgradeText, styles.moreSoonText]}>More Soon</Text>
              <Image source={soonIcon} style={styles.upgradeImage} />
            </View>
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
