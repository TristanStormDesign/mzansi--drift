import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Dimensions, PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsStyles } from '../styles/SettingsStyles';

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = settingsStyles(insets);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);

  const deleteOverlayY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const slideY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    Animated.timing(slideY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Load saved mute states
  useEffect(() => {
    (async () => {
      try {
        const mm = await AsyncStorage.getItem('musicMuted');
        const sm = await AsyncStorage.getItem('sfxMuted');
        setMusicMuted(mm === 'true');
        setSfxMuted(sm === 'true');
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setIsLoggedIn(!!user));
    return unsub;
  }, []);

  const toggleMusic = async () => {
    const next = !musicMuted;
    setMusicMuted(next);
    await AsyncStorage.setItem('musicMuted', String(next));
  };

  const toggleSfx = async () => {
    const next = !sfxMuted;
    setSfxMuted(next);
    await AsyncStorage.setItem('sfxMuted', String(next));
  };

  const openDeleteOverlay = () => {
    setShowDeleteOverlay(true);
    deleteOverlayY.setValue(Dimensions.get('window').height);
    Animated.timing(deleteOverlayY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  };

  const closeDeleteOverlay = () => {
    Animated.timing(deleteOverlayY, { toValue: Dimensions.get('window').height, duration: 300, useNativeDriver: true }).start(() => {
      setShowDeleteOverlay(false);
    });
  };

  const handleClose = () => {
    Animated.timing(slideY, { toValue: Dimensions.get('window').height, duration: 400, useNativeDriver: true }).start(() =>
      navigation.goBack()
    );
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

  const deleteOverlayPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) deleteOverlayY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) closeDeleteOverlay();
        else Animated.spring(deleteOverlayY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const handleLogout = async () => {
    await signOut(auth);
    handleClose();
  };

  const handleDelete = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteDoc(doc(db, 'scores', user.uid));
      await deleteUser(user);
      closeDeleteOverlay();
      handleClose();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <Animated.View style={[styles.card, { transform: [{ translateY: slideY }] }]} {...panResponder.panHandlers}>
        <View style={styles.dragHandleWrapper}>
          <View style={styles.dragHandle} />
        </View>

        <Text style={styles.heading}>SETTINGS</Text>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={toggleMusic}>
            <Text style={styles.primaryButtonText}>{musicMuted ? 'UNMUTE MUSIC' : 'MUTE MUSIC'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={toggleSfx}>
            <Text style={styles.primaryButtonText}>{sfxMuted ? 'UNMUTE SFX' : 'MUTE SFX'}</Text>
          </TouchableOpacity>

          {isLoggedIn && (
            <>
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogout}>
                <Text style={styles.primaryButtonText}>LOG OUT</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dangerButton} onPress={openDeleteOverlay}>
                <Text style={styles.primaryButtonText}>DELETE ACCOUNT</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.returnButton} onPress={handleClose}>
            <Text style={styles.returnText}>RETURN</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {showDeleteOverlay && (
        <View style={styles.overlayWrap}>
          <Animated.View style={[styles.overlaySheet, { transform: [{ translateY: deleteOverlayY }] }]} {...deleteOverlayPan.panHandlers}>
            <View style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </View>

            <Text style={styles.heading}>DELETE ACCOUNT</Text>
            <Text style={styles.confirmText}>Are you sure you want to delete your account? This cannot be undone.</Text>

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeDeleteOverlay}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.redButton} onPress={handleDelete}>
                <Text style={styles.redButtonText}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
