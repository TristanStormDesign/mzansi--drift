import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, Animated, Dimensions, PanResponder, TextInput } from 'react-native';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { multiplayerStyles } from '../styles/MultiplayerStyles';
import SvgQRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { doc, getDoc, onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

function codeId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function MultiplayerScreen() {
  const navigation = useNavigation() as any;
  const insets = useSafeAreaInsets();
  const styles = multiplayerStyles(insets);
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });

  const [currentUser, setCurrentUser] = useState<any>(null);

  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  const [mode, setMode] = useState<'menu' | 'host' | 'join'>('menu');

  const [roomId, setRoomId] = useState('');
  const [guestJoined, setGuestJoined] = useState(false);
  const roomUnsubRef = useRef<null | (() => void)>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [manualCode, setManualCode] = useState('');
  const [torch, setTorch] = useState(false);
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const lastScanTsRef = useRef(0);

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    return () => {
      if (roomUnsubRef.current) roomUnsubRef.current();
      roomUnsubRef.current = null;
    };
  }, []);

  const isLoggedIn = !!currentUser;

  const meMeta = useMemo(() => {
    return {
      uid: currentUser?.uid || '',
      displayName: currentUser?.displayName || 'Player',
    };
  }, [currentUser]);

  async function fetchFlag(uid: string) {
    try {
      const uRef = doc(db, 'users', uid);
      const snap = await getDoc(uRef);
      const d = snap.data() || {};
      return typeof d.flagEmoji === 'string' ? d.flagEmoji : '';
    } catch {
      return '';
    }
  }

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: Dimensions.get('window').height, duration: 400, useNativeDriver: true })
      .start(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Menu');
        }
      });
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

  async function handleCreate() {
    if (!currentUser) return;
    const id = codeId();
    const flagEmoji = await fetchFlag(currentUser.uid);
    const roomRef = doc(db, 'rooms', id);
    await setDoc(roomRef, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'lobby',
      bestOf: 3,
      round: 1,
      seed: 0,
      players: {
        p1: { uid: meMeta.uid, displayName: meMeta.displayName, flagEmoji, lane: 0, lives: 3, alive: true },
        p2: { uid: '', displayName: '', flagEmoji: '', lane: 0, lives: 3, alive: true },
      },
      scores: { p1: 0, p2: 0 },
      winner: null,
    }, { merge: true });
    setRoomId(id);
    if (roomUnsubRef.current) roomUnsubRef.current();
    roomUnsubRef.current = onSnapshot(roomRef, (snap) => {
      const d = snap.data() as any;
      const hasGuest = d?.players?.p2?.uid && d.players.p2.uid.length > 0;
      setGuestJoined(!!hasGuest);
    });
    setMode('host');
  }

  async function handleJoin() {
    if (!currentUser) return;
    if (!permission?.granted) {
      await requestPermission();
    }
    setScanningEnabled(true);
    setTorch(false);
    setManualCode('');
    setMode('join');
  }

  async function joinRoomById(id: string) {
    if (!currentUser) return;
    const clean = String(id || '').trim().toUpperCase();
    if (!clean) return;
    const flagEmoji = await fetchFlag(currentUser.uid);
    const roomRef = doc(db, 'rooms', clean);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) throw new Error('Room not found');
      const d = snap.data() as any;
      if (d.status !== 'lobby') throw new Error('Room not joinable');
      if (d.players?.p2?.uid) throw new Error('Room full');
      tx.update(roomRef, {
        'players.p2': { uid: currentUser.uid, displayName: meMeta.displayName, flagEmoji, lane: 0, lives: 3, alive: true },
        updatedAt: serverTimestamp(),
      });
    });
    setManualCode('');
    navigation.navigate('MultiplayerGame', { roomId: clean });
  }

  function onQrScanned(data: string) {
    const now = Date.now();
    if (!scanningEnabled) return;
    if (now - lastScanTsRef.current < 500) return;
    lastScanTsRef.current = now;
    setScanningEnabled(false);
    joinRoomById(data);
    setTimeout(() => setScanningEnabled(true), 1000);
  }

  async function handleStartMatch() {
    if (!roomId) return;
    const seed = (Date.now() & 0xfffffff) >>> 0;
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      status: 'running',
      round: 1,
      seed,
      updatedAt: serverTimestamp(),
      winner: null,
    });
    navigation.navigate('MultiplayerGame', { roomId });
  }

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;

  return (
    <View style={styles.flex}>
      <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]} {...panResponder.panHandlers}>
        <View style={styles.dragHandleWrapper}>
          <View style={styles.dragHandle} />
        </View>

        {mode === 'menu' && (
          <>
            <Text style={styles.heading}>MULTIPLAYER</Text>

            <View style={styles.bottomSection}>
              <TouchableOpacity style={[styles.primaryButton, !isLoggedIn && styles.disabled]} onPress={handleJoin} disabled={!isLoggedIn}>
                <Text style={styles.primaryButtonText}>{isLoggedIn ? 'JOIN GAME' : 'SIGN IN TO JOIN'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.primaryButton, !isLoggedIn && styles.disabled]} onPress={handleCreate} disabled={!isLoggedIn}>
                <Text style={styles.primaryButtonText}>{isLoggedIn ? 'CREATE GAME' : 'SIGN IN TO CREATE'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.returnButton} onPress={handleClose}>
                <Text style={styles.returnText}>RETURN</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {mode === 'host' && (
          <>
            <Text style={styles.heading}>HOST LOBBY</Text>

            <View style={styles.qrWrapOuter}>
              <View style={styles.qrWhiteBox}>
                {!!roomId && <SvgQRCode value={roomId} size={220} color="#000000" backgroundColor="#FFFFFF" quietZone={12} />}
              </View>
            </View>
            <Text style={styles.codeText}>{roomId}</Text>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>{guestJoined ? 'Guest connected' : 'Waiting for guest...'}</Text>
            </View>

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setMode('menu'); setRoomId(''); if (roomUnsubRef.current) roomUnsubRef.current(); roomUnsubRef.current = null; }}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={guestJoined ? styles.blueButton : styles.disabledButton} onPress={guestJoined ? handleStartMatch : undefined} disabled={!guestJoined}>
                <Text style={styles.blueButtonText}>{guestJoined ? 'START' : 'WAITING'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSection}>
              <TouchableOpacity style={styles.returnButton} onPress={handleClose}>
                <Text style={styles.returnText}>RETURN</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {mode === 'join' && (
          <>
            <Text style={styles.heading}>JOIN GAME</Text>

            <View style={styles.scannerWrap}>
              {permission?.granted ? (
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  active={mode === 'join'}
                  enableTorch={torch}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={({ data }) => onQrScanned(String(data))}
                />
              ) : (
                <View style={styles.centerBox}>
                  <TouchableOpacity style={styles.blueButton} onPress={requestPermission}>
                    <Text style={styles.blueButtonText}>ALLOW CAMERA</Text>
                  </TouchableOpacity>
                </View>
              )}
              {permission?.granted && (
                <View style={styles.scannerControls}>
                  <TouchableOpacity style={styles.controlBtn} onPress={() => setTorch((v) => !v)}>
                    <Text style={styles.controlBtnText}>{torch ? 'TORCH OFF' : 'TORCH ON'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={styles.helperText}>Scan QR or enter room code</Text>

            <TextInput
              value={manualCode}
              onChangeText={(t) => setManualCode(t.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="ROOM CODE"
              placeholderTextColor="rgba(224,224,224,0.5)"
              style={styles.input}
            />

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setMode('menu'); setManualCode(''); }}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={manualCode ? styles.blueButton : styles.disabledButton} onPress={() => joinRoomById(manualCode)} disabled={!manualCode}>
                <Text style={styles.blueButtonText}>JOIN</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSection}>
              <TouchableOpacity style={styles.returnButton} onPress={handleClose}>
                <Text style={styles.returnText}>RETURN</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}
