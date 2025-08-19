import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Animated, Dimensions, PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
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

type Upgradable = 'hasWing' | 'hasStripes' | 'hasPlate';

export default function GarageScreen() {
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = garageStyles(insets);

  const [coinBalance, setCoinBalance] = useState(0);
  const [hasWing, setHasWing] = useState(false);
  const [hasStripes, setHasStripes] = useState(false);
  const [hasPlate, setHasPlate] = useState(false);
  const [wingEquipped, setWingEquipped] = useState(false);
  const [stripesEquipped, setStripesEquipped] = useState(false);
  const [plateEquipped, setPlateEquipped] = useState(false);

  const slideY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  const [showPurchaseOverlay, setShowPurchaseOverlay] = useState(false);
  const purchaseOverlayY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const [pendingField, setPendingField] = useState<Upgradable>('hasWing');
  const [pendingCost, setPendingCost] = useState(0);
  const equippedSetterRef = useRef<React.Dispatch<React.SetStateAction<boolean>> | null>(null);
  const ownedSetterRef = useRef<React.Dispatch<React.SetStateAction<boolean>> | null>(null);

  const [showInsufficientToast, setShowInsufficientToast] = useState(false);
  const insufficientToastAnim = useRef(new Animated.Value(0)).current;

  const upgradeCosts = { hasWing: 200, hasStripes: 150, hasPlate: 100 };

  useEffect(() => {
    Animated.timing(slideY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();
      setCoinBalance(data.coins || 0);
      setHasWing(data.hasWing || false);
      setHasStripes(data.hasStripes || false);
      setHasPlate(data.hasPlate || false);
      setWingEquipped(data.wingEquipped || false);
      setStripesEquipped(data.stripesEquipped || false);
      setPlateEquipped(data.plateEquipped || false);
    });
    return unsub;
  }, []);

  const handleClose = () => {
    Animated.timing(slideY, { toValue: Dimensions.get('window').height, duration: 400, useNativeDriver: true }).start(() => navigation.goBack());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) slideY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) handleClose();
        else Animated.spring(slideY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const openPurchaseOverlay = (
    field: Upgradable,
    cost: number,
    equippedSetter: React.Dispatch<React.SetStateAction<boolean>>,
    ownedSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setPendingField(field);
    setPendingCost(cost);
    equippedSetterRef.current = equippedSetter;
    ownedSetterRef.current = ownedSetter;
    setShowPurchaseOverlay(true);
    purchaseOverlayY.setValue(Dimensions.get('window').height);
    Animated.timing(purchaseOverlayY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  };

  const closePurchaseOverlay = () => {
    Animated.timing(purchaseOverlayY, { toValue: Dimensions.get('window').height, duration: 300, useNativeDriver: true }).start(() =>
      setShowPurchaseOverlay(false)
    );
  };

  const showInsufficient = () => {
    setShowInsufficientToast(true);
    Animated.sequence([
      Animated.timing(insufficientToastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(insufficientToastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setShowInsufficientToast(false));
  };

  const confirmPurchase = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const currentCoins = data.coins || 0;
    if (currentCoins < pendingCost) {
      closePurchaseOverlay();
      showInsufficient();
      return;
    }
    const equipKey = `${pendingField.replace('has', '').toLowerCase()}Equipped`;
    await updateDoc(ref, {
      [pendingField]: true,
      coins: currentCoins - pendingCost,
      [equipKey]: true,
    });
    setCoinBalance(currentCoins - pendingCost);
    ownedSetterRef.current && ownedSetterRef.current(true);
    equippedSetterRef.current && equippedSetterRef.current(true);
    closePurchaseOverlay();
  };

  const toggleEquip = async (field: Upgradable, newValue: boolean, equippedSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const equipKey = `${field.replace('has', '').toLowerCase()}Equipped`;
    await updateDoc(ref, { [equipKey]: newValue });
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

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      {showInsufficientToast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: insufficientToastAnim,
              transform: [
                {
                  translateY: insufficientToastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>Not enough coins to purchase</Text>
        </Animated.View>
      )}

      <Animated.View style={[styles.card, { transform: [{ translateY: slideY }] }]} {...panResponder.panHandlers}>
        <View style={styles.dragHandleWrapper}>
          <View style={styles.dragHandle} />
        </View>

        <Text style={styles.heading}>GARAGE</Text>

        <View style={styles.previewSection}>
          <Image source={carImage} style={styles.carImage} />
        </View>

        <View style={styles.upgradeSection}>
          <View style={styles.upgradeRow}>
            <View style={styles.upgradeInfo}>
              <Image source={wingIcon} style={styles.upgradeIcon} />
              <Text style={styles.upgradeLabel}>Wing</Text>
            </View>
            {!hasWing ? (
              <TouchableOpacity
                style={styles.priceButton}
                onPress={() => openPurchaseOverlay('hasWing', upgradeCosts.hasWing, setWingEquipped, setHasWing)}
              >
                <View style={styles.priceWrap}>
                  <Image source={coinIcon} style={styles.coinSmall} />
                  <Text style={styles.priceText}>{upgradeCosts.hasWing}</Text>
                </View>
              </TouchableOpacity>
            ) : wingEquipped ? (
              <TouchableOpacity style={styles.unequipButton} onPress={() => toggleEquip('hasWing', false, setWingEquipped)}>
                <Text style={styles.actionText}>UNEQUIP</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.equipButton} onPress={() => toggleEquip('hasWing', true, setWingEquipped)}>
                <Text style={styles.actionText}>EQUIP</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.upgradeRow}>
            <View style={styles.upgradeInfo}>
              <Image source={stripesIcon} style={styles.upgradeIcon} />
              <Text style={styles.upgradeLabel}>Stripes</Text>
            </View>
            {!hasStripes ? (
              <TouchableOpacity
                style={styles.priceButton}
                onPress={() => openPurchaseOverlay('hasStripes', upgradeCosts.hasStripes, setStripesEquipped, setHasStripes)}
              >
                <View style={styles.priceWrap}>
                  <Image source={coinIcon} style={styles.coinSmall} />
                  <Text style={styles.priceText}>{upgradeCosts.hasStripes}</Text>
                </View>
              </TouchableOpacity>
            ) : stripesEquipped ? (
              <TouchableOpacity style={styles.unequipButton} onPress={() => toggleEquip('hasStripes', false, setStripesEquipped)}>
                <Text style={styles.actionText}>UNEQUIP</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.equipButton} onPress={() => toggleEquip('hasStripes', true, setStripesEquipped)}>
                <Text style={styles.actionText}>EQUIP</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.upgradeRow}>
            <View style={styles.upgradeInfo}>
              <Image source={plateIcon} style={styles.upgradeIcon} />
              <Text style={styles.upgradeLabel}>Plate</Text>
            </View>
            {!hasPlate ? (
              <TouchableOpacity
                style={styles.priceButton}
                onPress={() => openPurchaseOverlay('hasPlate', upgradeCosts.hasPlate, setPlateEquipped, setHasPlate)}
              >
                <View style={styles.priceWrap}>
                  <Image source={coinIcon} style={styles.coinSmall} />
                  <Text style={styles.priceText}>{upgradeCosts.hasPlate}</Text>
                </View>
              </TouchableOpacity>
            ) : plateEquipped ? (
              <TouchableOpacity style={styles.unequipButton} onPress={() => toggleEquip('hasPlate', false, setPlateEquipped)}>
                <Text style={styles.actionText}>UNEQUIP</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.equipButton} onPress={() => toggleEquip('hasPlate', true, setPlateEquipped)}>
                <Text style={styles.actionText}>EQUIP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.returnButton} onPress={handleClose}>
            <Text style={styles.returnText}>RETURN</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {showPurchaseOverlay && (
        <View style={styles.overlayWrap}>
          <Animated.View style={[styles.overlaySheet, { transform: [{ translateY: purchaseOverlayY }] }]}>
            <View style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </View>

            <Text style={styles.heading}>PURCHASE ITEM</Text>
            <Text style={styles.confirmText}>Are you sure you want to purchase this item?</Text>

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closePurchaseOverlay}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.greenButton} onPress={confirmPurchase}>
                <Text style={styles.greenButtonText}>BUY</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
