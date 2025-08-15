import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing
} from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { countryList } from '../utils/countryList';
import { accountStyles } from '../styles/AccountStyles';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = accountStyles(insets);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [countrySearch, setCountrySearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    Silkscreen_400Regular,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.navigate('Menu' as never);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  const handleAuth = async () => {
    try {
      const cred = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      if (!isLogin) {
        const flag = countryList.find((c) => c.name === country);
        const flagUri = flag ? Image.resolveAssetSource(flag.flag).uri : null;
        await setDoc(doc(db, 'users', user.uid), {
          username,
          country,
          profilePhoto: flagUri,
        });
      }

      navigation.navigate('Menu' as never);
    } catch (err: any) {
      Alert.alert('Auth Error', err.message);
    }
  };

  const filteredCountries = countryList.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <View style={styles.accountOverlay}>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setIsLogin(true)}
              style={[styles.toggleButton, isLogin && styles.activeToggle]}
            >
              <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>LOG IN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsLogin(false)}
              style={[styles.toggleButton, !isLogin && styles.activeToggle]}
            >
              <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>SIGN UP</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="EMAIL"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#555"
          />
          <TextInput
            style={styles.input}
            placeholder="PASSWORD"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#555"
          />

          {!isLogin && (
            <>
              <TextInput
                style={styles.input}
                placeholder="USERNAME"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#555"
              />
              <TouchableOpacity
                style={styles.dropdownToggle}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text style={styles.dropdownToggleText}>
                  {country || 'SELECT COUNTRY'}
                </Text>
              </TouchableOpacity>
              {showDropdown && (
                <View style={styles.dropdown}>
                  <TextInput
                    style={styles.input}
                    placeholder="SEARCH..."
                    value={countrySearch}
                    onChangeText={setCountrySearch}
                    placeholderTextColor="#555"
                  />
                  <FlatList
                    data={filteredCountries}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.countryRow}
                        onPress={() => {
                          setCountry(item.name);
                          setProfilePhoto(Image.resolveAssetSource(item.flag).uri);
                          setShowDropdown(false);
                          setCountrySearch('');
                        }}
                      >
                        <Image source={item.flag} style={styles.flagSmall} />
                        <Text style={styles.countryName}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Animated.Text
              style={[styles.primaryButtonText, { transform: [{ scale: scaleAnim }] }]}
            >
              {isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
            </Animated.Text>
          </TouchableOpacity>
        </View>

        <View style={styles.returnButtonContainer}>
          <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
            <Text style={styles.returnText}>RETURN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
