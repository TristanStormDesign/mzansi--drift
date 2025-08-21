import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, FlatList, PanResponder, KeyboardAvoidingView, Platform, LogBox, InteractionManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { friendsStyles } from '../styles/FriendsStyles';

type Friend = {
  id: string;
  username: string;
  countryFlag: string | null;
};

type Post = {
  id: string;
  text: string;
};

LogBox.ignoreLogs([
  'Warning: useInsertionEffect must not schedule updates.',
  'useInsertionEffect must not schedule updates',
]);

export default function FriendsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = friendsStyles(insets);
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const slideY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const addY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const friendsY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const qrY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const scannerY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  const [toastAnim] = useState(new Animated.Value(0));
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [permission, requestPermission] = useCameraPermissions();
  const scanLocked = useRef(false);

  useEffect(() => {
    Animated.timing(slideY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  }, [slideY]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const ref = doc(db, 'users', user.uid);
        const unsubDoc = onSnapshot(ref, async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as any;
            if (Array.isArray(data.friends) && data.friends.length) {
              const friendDocs = await Promise.all(
                data.friends.map(async (fid: string) => {
                  const fRef = doc(db, 'users', fid);
                  const fSnap = await getDoc(fRef);
                  if (fSnap.exists()) {
                    const fData = fSnap.data() as any;
                    return { id: fid, username: fData.username || 'Unknown', countryFlag: fData.profilePhoto || null } as Friend;
                  }
                  return null;
                })
              );
              setFriends(friendDocs.filter(Boolean) as Friend[]);
            } else {
              setFriends([]);
            }
          }
        });
        return unsubDoc;
      } else {
        setCurrentUser(null);
        setFriends([]);
      }
    });
    return unsubAuth;
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
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
    if (!permission?.granted) {
      await requestPermission();
    }
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
          if (g.dy > 100) {
            closeAdd();
          } else {
            Animated.spring(addY, { toValue: 0, useNativeDriver: true }).start();
          }
        },
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
          if (g.dy > 100) {
            closeFriends();
          } else {
            Animated.spring(friendsY, { toValue: 0, useNativeDriver: true }).start();
          }
        },
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
          if (g.dy > 100) {
            closeQR();
          } else {
            Animated.spring(qrY, { toValue: 0, useNativeDriver: true }).start();
          }
        },
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
          if (g.dy > 100) {
            closeScanner();
          } else {
            Animated.spring(scannerY, { toValue: 0, useNativeDriver: true }).start();
          }
        },
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
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.loginToastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <Text style={styles.heading}>FEED</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.postText}>{item.text}</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>No posts yet</Text>}
        style={styles.feedList}
      />

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={openAdd}>
          <Text style={styles.primaryButtonText}>ADD</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={openFriends}>
          <Text style={styles.primaryButtonText}>FRIENDS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.returnButton} onPress={handleClose}>
          <Text style={styles.returnText}>RETURN</Text>
        </TouchableOpacity>
      </View>

      {showAdd && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlayWrap}>
          <Animated.View style={[styles.overlaySheet, { transform: [{ translateY: addY }] }]} {...addPanResponder.panHandlers}>
            <View style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </View>
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
            <View style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </View>
            <Text style={styles.overlayHeading}>MY QR</Text>
            {currentUser && (
              <View style={styles.qrBox}>
                <View style={styles.qrWhite}>
                  <QRCode value={currentUser.uid} size={200} backgroundColor="white" color="black" />
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.returnButtonModal} onPress={closeQR}>
              <Text style={styles.returnText}>CLOSE</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      )}

      {showScanner && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlayWrap}>
          <Animated.View style={[styles.overlaySheet, { transform: [{ translateY: scannerY }] }]} {...scannerPanResponder.panHandlers}>
            <View style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </View>
            <Text style={styles.overlayHeading}>SCAN QR</Text>
            {permission?.granted ? (
              cameraEnabled ? (
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={({ data }) => {
                    if (!scanLocked.current) handleScanned(String(data));
                  }}
                />
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Text style={styles.cameraPlaceholderText}>Processing…</Text>
                </View>
              )
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Text style={styles.cameraPlaceholderText}>Camera permission required</Text>
              </View>
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
            <View style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </View>
            <Text style={styles.overlayHeading}>FRIENDS LIST</Text>
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.friendRow}>
                  <Text style={styles.friendName}>{item.username}</Text>
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
