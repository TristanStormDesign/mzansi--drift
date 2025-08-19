import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Image, ImageBackground, Animated, Dimensions, TextInput, FlatList, PanResponder, Platform, KeyboardAvoidingView } from 'react-native';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { onAuthStateChanged, updateEmail } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { countryList } from '../utils/countryList';
import { menuStyles } from '../styles/MenuStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import coinIcon from '../assets/coin/coin.webp';

import bg from '../assets/bgs/bg.webp';
import wingBg from '../assets/bgs/wing-bg.webp';
import stripesBg from '../assets/bgs/stripes-bg.webp';
import plateBg from '../assets/bgs/plate-bg.webp';
import wingStripesBg from '../assets/bgs/stripes-wing-bg.webp';
import wingPlateBg from '../assets/bgs/wing-plate-bg.webp';
import stripesPlateBg from '../assets/bgs/stripes-plate-bg.webp';
import wingStripesPlateBg from '../assets/bgs/stripes-plate-wing-bg.webp';

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const styles = menuStyles(insets);
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [country, setCountry] = useState<string>('');
  const [email, setEmail] = useState('');
  const [coinBalance, setCoinBalance] = useState(0);
  const [wingEquipped, setWingEquipped] = useState(false);
  const [stripesEquipped, setStripesEquipped] = useState(false);
  const [plateEquipped, setPlateEquipped] = useState(false);
  const [toastAnim] = useState(new Animated.Value(0));
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [editVisible, setEditVisible] = useState(false);
  const editY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editFlagUri, setEditFlagUri] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setEmail(user.email || '');
        const ref = doc(db, 'users', user.uid);
        const unsubscribeDoc = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as any;
            setUsername(data.username || '');
            setProfilePhoto(data.profilePhoto || null);
            setCountry(data.country || '');
            setCoinBalance(data.coins || 0);
            setWingEquipped(data.wingEquipped || false);
            setStripesEquipped(data.stripesEquipped || false);
            setPlateEquipped(data.plateEquipped || false);
          }
        });
        return unsubscribeDoc;
      } else {
        setCurrentUser(null);
        setUsername('');
        setProfilePhoto(null);
        setCountry('');
        setEmail('');
        setCoinBalance(0);
        setWingEquipped(false);
        setStripesEquipped(false);
        setPlateEquipped(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  const bgImage = () => {
    if (wingEquipped && stripesEquipped && plateEquipped) return wingStripesPlateBg;
    if (wingEquipped && stripesEquipped) return wingStripesBg;
    if (wingEquipped && plateEquipped) return wingPlateBg;
    if (stripesEquipped && plateEquipped) return stripesPlateBg;
    if (wingEquipped) return wingBg;
    if (stripesEquipped) return stripesBg;
    if (plateEquipped) return plateBg;
    return bg;
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowToast(false));
  };

  const openEdit = () => {
    if (!currentUser) return;
    setEditEmail(email);
    setEditUsername(username);
    setEditCountry(country);
    setEditFlagUri(profilePhoto || null);
    setCountrySearch('');
    setShowCountryList(false);
    setEditVisible(true);
    Animated.timing(editY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  };

  const closeEdit = () => {
    Animated.timing(editY, { toValue: Dimensions.get('window').height, duration: 400, useNativeDriver: true }).start(() => {
      setEditVisible(false);
    });
  };

  const saveEdit = async () => {
    try {
      if (currentUser && editEmail && editEmail !== currentUser.email) {
        await updateEmail(currentUser, editEmail);
      }
      if (currentUser) {
        const ref = doc(db, 'users', currentUser.uid);
        await updateDoc(ref, {
          username: editUsername || username,
          country: editCountry || country,
          profilePhoto: editFlagUri || null,
        });
      }
      setEmail(editEmail);
      setUsername(editUsername);
      setCountry(editCountry);
      setProfilePhoto(editFlagUri);
      closeEdit();
    } catch (e) {
      closeEdit();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) editY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) {
          closeEdit();
        } else {
          Animated.spring(editY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (!fontsLoaded) return null;

  const isLoggedIn = !!currentUser;

  const filteredCountries = countryList.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <ImageBackground source={bgImage()} style={styles.flex} resizeMode="cover">
      <View style={styles.topRow}>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={styles.infoCard}
            disabled={!isLoggedIn}
            onPress={openEdit}
          >
            {profilePhoto ? <Image source={{ uri: profilePhoto }} style={styles.flagIcon} /> : null}
            <Text style={styles.infoText}>{isLoggedIn ? username : 'GUEST'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoCard}>
          <Image source={coinIcon} style={styles.coinIcon} />
          <Text style={styles.infoText}>{coinBalance}</Text>
        </View>
      </View>

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

      <View style={styles.bottomSection}>
        <View style={styles.startButtons}>
          <TouchableOpacity style={styles.pixelButtonOuter} onPress={() => navigation.navigate('Game' as never)}>
            <View style={styles.pixelButtonInner}>
              <Text style={styles.startButtonText}>PLAY</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pixelButtonOuterGrey, !isLoggedIn && styles.startButtonDisabled]}
            onPress={() => {
              if (isLoggedIn) {
                navigation.navigate('Multiplayer' as never);
              } else {
                triggerToast('You are logged out. Please Login to play Multiplayer');
              }
            }}
          >
            <View style={styles.pixelButtonInnerGrey}>
              <Text style={styles.startButtonTextSmall}>MULTIPLAYER</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.menuRow}>
          {!isLoggedIn && (
            <View style={styles.navItem}>
              <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Account' as never)}>
                <View style={styles.navButtonInner}>
                  <Image source={require('../assets/menu/account-icon.webp')} style={styles.navIcon} />
                </View>
              </TouchableOpacity>
              <Text style={styles.navLabel}>LOGIN</Text>
            </View>
          )}
          <View style={styles.navItem}>
            <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Settings' as never)}>
              <View style={styles.navButtonInner}>
                <Image source={require('../assets/menu/settings-icon.webp')} style={styles.navIcon} />
              </View>
            </TouchableOpacity>
            <Text style={styles.navLabel}>SETTINGS</Text>
          </View>
          <View style={styles.navItem}>
            <TouchableOpacity
              style={styles.navButtonOuter}
              onPress={() => {
                if (isLoggedIn) {
                  navigation.navigate('Garage' as never);
                } else {
                  triggerToast('You are logged out. Please login to use Garage');
                }
              }}
            >
              <View style={styles.navButtonInner}>
                <Image source={require('../assets/menu/garage-icon.webp')} style={styles.navIcon} />
              </View>
            </TouchableOpacity>
            <Text style={styles.navLabel}>GARAGE</Text>
          </View>
          <View style={styles.navItem}>
            <TouchableOpacity style={styles.navButtonOuter} onPress={() => navigation.navigate('Rankings' as never)}>
              <View style={styles.navButtonInner}>
                <Image source={require('../assets/menu/rankings-icon.webp')} style={styles.navIcon} />
              </View>
            </TouchableOpacity>
            <Text style={styles.navLabel}>RANKINGS</Text>
          </View>
        </View>
      </View>

      {editVisible && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.editOverlay}>
          <Animated.View style={[styles.editCard, { transform: [{ translateY: editY }] }]} {...panResponder.panHandlers}>
            <View style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </View>

            <Text style={styles.editHeading}>EDIT ACCOUNT</Text>

            <View style={styles.editFormSection}>
              <TextInput
                style={styles.input}
                placeholder="EMAIL"
                placeholderTextColor="#888"
                value={editEmail}
                onChangeText={setEditEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="USERNAME"
                placeholderTextColor="#888"
                value={editUsername}
                onChangeText={setEditUsername}
              />

              <TouchableOpacity style={styles.dropdownToggle} onPress={() => setShowCountryList(!showCountryList)}>
                <View style={styles.countryRowCompact}>
                  {editFlagUri ? <Image source={{ uri: editFlagUri }} style={styles.flagSmall} /> : null}
                  <Text style={styles.dropdownToggleText}>{editCountry || 'SELECT COUNTRY'}</Text>
                </View>
              </TouchableOpacity>

              {showCountryList && (
                <View style={styles.dropdown}>
                  <TextInput
                    style={styles.input}
                    placeholder="SEARCH..."
                    placeholderTextColor="#888"
                    value={countrySearch}
                    onChangeText={setCountrySearch}
                  />
                  <FlatList
                    data={filteredCountries}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.countryRow}
                        onPress={() => {
                          setEditCountry(item.name);
                          const uri = Image.resolveAssetSource(item.flag).uri;
                          setEditFlagUri(uri);
                          setShowCountryList(false);
                          setCountrySearch('');
                        }}
                      >
                        <Image source={item.flag} style={styles.flagSmall} />
                        <Text style={styles.countryName}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                    style={{ maxHeight: 180 }}
                  />
                </View>
              )}
            </View>

            <View style={styles.bottomButtonsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={saveEdit}>
                <Text style={styles.primaryButtonText}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.returnButton} onPress={closeEdit}>
                <Text style={styles.returnText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </ImageBackground>
  );
}
