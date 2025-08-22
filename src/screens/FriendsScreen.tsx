import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, FlatList, Image, KeyboardAvoidingView, Platform, PanResponder, InteractionManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { friendsStyles } from '../styles/FriendsStyles';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { collection, doc, getDoc, onSnapshot, query, where, limit, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

type Friend = { id: string; username: string | null; countryFlag: string | null };
type Post = {
  id: string;
  uid: string;
  username?: string | null;
  countryFlag?: string | null;
  score?: number;
  type?: string | null;
  createdAt?: any;
  photoUrl?: string | null;
  photoBase64?: string | null;
};

export default function FriendsScreen() {
  const navigation = useNavigation() as any;
  const insets = useSafeAreaInsets();
  const styles = friendsStyles(insets);
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [feed, setFeed] = useState<Post[]>([]);

  const slideY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const addY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const friendsY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const qrY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const scannerY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  const [showAdd, setShowAdd] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const [toastAnim] = useState(new Animated.Value(0));
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [permission, requestPermission] = useCameraPermissions();
  const scanLocked = useRef(false);

  const postUnsubsRef = useRef<Record<string, () => void>>({});
  const postsByUidRef = useRef<Record<string, Post[]>>({});

  useEffect(() => {
    Animated.timing(slideY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  }, [slideY]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      Object.values(postUnsubsRef.current).forEach((fn) => fn && fn());
      postUnsubsRef.current = {};
      postsByUidRef.current = {};
      setFeed([]);
      if (!user) {
        setFriendIds([]);
        setFriends([]);
        return;
      }
      const meRef = doc(db, 'users', user.uid);
      const stopUser = onSnapshot(meRef, async (snap) => {
        const d = snap.data() || {};
        const ids: string[] = Array.isArray(d.friends) ? d.friends.slice(0, 20) : [];
        setFriendIds(ids);
        const toFetch = [user.uid, ...ids];
        wirePostListeners(toFetch);
        const friendDocs = await Promise.all(
          ids.map(async (fid) => {
            const fRef = doc(db, 'users', fid);
            const fSnap = await getDoc(fRef);
            if (!fSnap.exists()) return null;
            const fd: any = fSnap.data();
            return { id: fid, username: fd.username ?? null, countryFlag: fd.countryFlag ?? null } as Friend;
          })
        );
        setFriends(friendDocs.filter(Boolean) as Friend[]);
      });
      postUnsubsRef.current.__me = stopUser;
    });
    return () => {
      Object.values(postUnsubsRef.current).forEach((fn) => fn && fn());
      postUnsubsRef.current = {};
      postsByUidRef.current = {};
    };
  }, []);

  const wirePostListeners = (uids: string[]) => {
    const keep: Record<string, true> = {};
    for (const uid of uids) {
      keep[uid] = true;
      if (postUnsubsRef.current[uid]) continue;
      const q = query(collection(db, 'posts'), where('uid', '==', uid), limit(50));
      const unsub = onSnapshot(q, (snap) => {
        const items: Post[] = [];
        snap.forEach((d) => {
          const v = d.data() as any;
          items.push({
            id: d.id,
            uid: v.uid ?? uid,
            username: v.username ?? null,
            countryFlag: v.countryFlag ?? null,
            score: v.score ?? null,
            type: v.type ?? null,
            createdAt: v.createdAt ?? null,
            photoUrl: v.photoUrl ?? null,
            photoBase64: v.photoBase64 ?? null
          });
        });
        postsByUidRef.current[uid] = items;
        recomputeFeed();
      });
      postUnsubsRef.current[uid] = unsub;
    }
    for (const k of Object.keys(postUnsubsRef.current)) {
      if (k !== '__me' && !keep[k]) {
        postUnsubsRef.current[k]();
        delete postUnsubsRef.current[k];
        delete postsByUidRef.current[k];
      }
    }
    recomputeFeed();
  };

  const recomputeFeed = () => {
    const all: Post[] = [];
    Object.values(postsByUidRef.current).forEach((arr) => all.push(...arr));
    all.sort((a, b) => {
      const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt?._seconds ? a.createdAt._seconds * 1000 : 0;
      const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt?._seconds ? b.createdAt._seconds * 1000 : 0;
      return tb - ta;
    });
    setFeed(all);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => setShowToast(false));
  };

  const handleClose = () => {
    Animated.timing(slideY, { toValue: Dimensions.get('window').height, duration: 400, useNativeDriver: true }).start(() => navigation.goBack());
  };

  const openAdd = () => {
    setShowAdd(true);
    Animated.timing(addY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  };
  const closeAdd = () => {
    Animated.timing(addY, { toValue: Dimensions.get('window').height, duration: 400, useNativeDriver: true }).start(() => setShowAdd(false));
  };

  const openFriends = () => {
    setShowFriends(true);
    Animated.timing(friendsY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  };
  const closeFriends = () => {
    Animated.timing(friendsY, { toValue: Dimensions.get('window').height, duration: 400, useNativeDriver: true }).start(() => setShowFriends(false));
  };

  const openQR = () => {
    setShowQR(true);
    Animated.timing(qrY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  };
  const closeQR = () => {
    Animated.timing(qrY, { toValue: Dimensions.get('window').height, duration: 400, useNativeDriver: true }).start(() => setShowQR(false));
  };

  const openScanner = async () => {
    if (!permission?.granted) await requestPermission();
    setShowScanner(true);
    setCameraEnabled(true);
    scanLocked.current = false;
    Animated.timing(scannerY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  };
  const closeScanner = () => {
    setCameraEnabled(false);
    Animated.timing(scannerY, { toValue: Dimensions.get('window').height, duration: 400, useNativeDriver: true }).start(() => setShowScanner(false));
  };

  const handleScanned = async (data: string) => {
    if (scanLocked.current) return;
    scanLocked.current = true;
    setCameraEnabled(false);
    if (!currentUser) {
      triggerToast('Please login first');
      scanLocked.current = false;
      return;
    }
    if (!data || typeof data !== 'string') {
      triggerToast('Invalid QR');
      scanLocked.current = false;
      return;
    }
    if (data === currentUser.uid) {
      triggerToast('That is your code');
      scanLocked.current = false;
      return;
    }
    InteractionManager.runAfterInteractions(async () => {
      try {
        const otherRef = doc(db, 'users', data);
        const otherSnap = await getDoc(otherRef);
        if (!otherSnap.exists()) {
          triggerToast('User not found');
          scanLocked.current = false;
          return;
        }
        const myRef = doc(db, 'users', currentUser.uid);
        await updateDoc(myRef, { friends: arrayUnion(data) });
        await updateDoc(otherRef, { friends: arrayUnion(currentUser.uid) });
        triggerToast('Friend added');
        closeScanner();
        closeAdd();
      } catch {
        triggerToast('Failed to add friend');
      } finally {
        scanLocked.current = false;
      }
    });
  };

  const handleRemoveFriend = async (fid: string) => {
    if (!currentUser) return;
    try {
      const myRef = doc(db, 'users', currentUser.uid);
      const otherRef = doc(db, 'users', fid);
      await updateDoc(myRef, { friends: arrayRemove(fid) });
      await updateDoc(otherRef, { friends: arrayRemove(currentUser.uid) });
      triggerToast('Friend removed');
    } catch {
      triggerToast('Failed to remove friend');
    }
  };

  const addPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) addY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 100) closeAdd();
          else Animated.spring(addY, { toValue: 0, useNativeDriver: true }).start();
        }
      }),
    [addY]
  );

  const friendsPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) friendsY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 100) closeFriends();
          else Animated.spring(friendsY, { toValue: 0, useNativeDriver: true }).start();
        }
      }),
    [friendsY]
  );

  const qrPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) qrY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 100) closeQR();
          else Animated.spring(qrY, { toValue: 0, useNativeDriver: true }).start();
        }
      }),
    [qrY]
  );

  const scannerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) scannerY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 100) closeScanner();
          else Animated.spring(scannerY, { toValue: 0, useNativeDriver: true }).start();
        }
      }),
    [scannerY]
  );

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;

  return (
    <Animated.View style={[styles.flex, { transform: [{ translateY: slideY }] }]}>
      {showToast && (
        <Animated.View
          style={[
            styles.loginToast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] })
                }
              ]
            }
          ]}
        >
          <Text style={styles.loginToastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <Text style={styles.heading}>FEED</Text>

      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const uri = item.photoUrl ?? item.photoBase64 ?? null;
          const when = item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt?._seconds ? new Date(item.createdAt._seconds * 1000) : null;
          return (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <Text style={styles.postAuthor}>{item.username ?? 'Player'}</Text>
                <Text style={styles.postTime}>{when ? when.toLocaleString() : ''}</Text>
              </View>
              {uri ? <Image source={{ uri }} style={styles.postImage} resizeMode="cover" /> : null}
              <Text style={styles.postText}>
                {item.type === 'high_score'
                  ? `High score: ${item.score ?? 0}`
                  : item.type === 'wooden_spoon'
                    ? `Wooden spoon: ${item.score ?? 0}`
                    : `Score: ${item.score ?? 0}`}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No posts yet</Text>}
        style={styles.feedList}
      />


      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={openAdd}>
          <Text style={styles.primaryButtonText}>ADD</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.greyButton} onPress={openFriends}>
          <Text style={styles.greyButtonText}>FRIENDS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.returnButton} onPress={handleClose}>
          <Text style={styles.returnText}>RETURN</Text>
        </TouchableOpacity>
      </View>


      {showAdd && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlayWrap}>
          <Animated.View style={[styles.overlaySheet, { transform: [{ translateY: addY }] }]} {...addPanResponder.panHandlers}>
            <View style={styles.dragHandleWrapper}><View style={styles.dragHandle} /></View>
            <Text style={styles.overlayHeading}>ADD FRIEND</Text>
            <View style={styles.bottomButtonsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={openQR}>
                <Text style={styles.primaryButtonText}>MY QR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={openScanner}>
                <Text style={styles.primaryButtonText}>SCAN</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.returnButtonModal} onPress={closeAdd}>
              <Text style={styles.returnText}>CLOSE</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      )}

      {showQR && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlayWrap}>
          <Animated.View style={[styles.overlaySheet, { transform: [{ translateY: qrY }] }]} {...qrPanResponder.panHandlers}>
            <View style={styles.dragHandleWrapper}><View style={styles.dragHandle} /></View>
            <Text style={styles.overlayHeading}>MY QR</Text>
            {currentUser ? (
              <View style={styles.qrBox}>
                <View style={styles.qrWhite}>
                  <QRCode value={currentUser.uid} size={200} backgroundColor="white" color="black" />
                </View>
              </View>
            ) : null}
            <TouchableOpacity style={styles.returnButtonModal} onPress={closeQR}>
              <Text style={styles.returnText}>CLOSE</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      )}

      {showScanner && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlayWrap}>
          <Animated.View style={[styles.overlaySheet, { transform: [{ translateY: scannerY }] }]} {...scannerPanResponder.panHandlers}>
            <View style={styles.dragHandleWrapper}><View style={styles.dragHandle} /></View>
            <Text style={styles.overlayHeading}>SCAN QR</Text>
            {permission?.granted ? (
              cameraEnabled ? (
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={({ data }) => { if (!scanLocked.current) handleScanned(String(data)); }}
                />
              ) : (
                <View style={styles.cameraPlaceholder}><Text style={styles.cameraPlaceholderText}>Processing…</Text></View>
              )
            ) : (
              <View style={styles.cameraPlaceholder}><Text style={styles.cameraPlaceholderText}>Camera permission required</Text></View>
            )}
            <TouchableOpacity style={styles.returnButtonModal} onPress={closeScanner}>
              <Text style={styles.returnText}>CLOSE</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      )}

      {showFriends && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlayWrap}>
          <Animated.View style={[styles.overlaySheet, { transform: [{ translateY: friendsY }] }]} {...friendsPanResponder.panHandlers}>
            <View style={styles.dragHandleWrapper}><View style={styles.dragHandle} /></View>
            <Text style={styles.overlayHeading}>FRIENDS LIST</Text>
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.friendRow}>
                  <Text style={styles.friendName}>{item.username ?? 'Player'}</Text>
                  <TouchableOpacity onPress={() => handleRemoveFriend(item.id)} style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>REMOVE</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No Friends Yet</Text>}
              style={styles.friendsList}
            />
            <TouchableOpacity style={styles.returnButtonModal} onPress={closeFriends}>
              <Text style={styles.returnText}>CLOSE</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </Animated.View>
  );
}
