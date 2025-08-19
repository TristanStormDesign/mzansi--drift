import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, Alert, KeyboardAvoidingView, Platform, Animated, Dimensions, PanResponder } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });

  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

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
          coins: 500,
          score: 0,
          highScore: 0,
          hasWing: false,
          hasStripes: false,
          hasPlate: false,
          wingEquipped: false,
          stripesEquipped: false,
          plateEquipped: false,
          createdAt: serverTimestamp(),
        });

        await setDoc(doc(db, 'scores', user.uid), {
          uid: user.uid,
          displayName: username,
          highScore: 0,
          score: 0,
          createdAt: serverTimestamp(),
        });
      }

      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        navigation.goBack();
      });
    } catch (err: any) {
      Alert.alert('Auth Error', err.message);
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 400,
      useNativeDriver: true,
    }).start(() => navigation.goBack());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          slideAnim.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const filteredCountries = countryList.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <Animated.View
        style={[styles.card, { transform: [{ translateY: slideAnim }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandleWrapper}>
          <View style={styles.dragHandle} />
        </View>

        <Text style={styles.heading}>ACCOUNT</Text>

        <View style={styles.formWrapper}>
          <View style={styles.formSection}>
            <View style={styles.toggleRow}>
              <TouchableOpacity onPress={() => setIsLogin(true)} style={[styles.toggleButton, isLogin && styles.activeLogin]}>
                <Text style={[styles.toggleText, isLogin && styles.activeLoginText]}>LOG IN</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsLogin(false)} style={[styles.toggleButton, !isLogin && styles.activeSignup]}>
                <Text style={[styles.toggleText, !isLogin && styles.activeSignupText]}>SIGN UP</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="EMAIL" value={email} onChangeText={setEmail} placeholderTextColor="#888" />
            <TextInput style={styles.input} placeholder="PASSWORD" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#888" />

            {!isLogin && (
              <>
                <TextInput style={styles.input} placeholder="USERNAME" value={username} onChangeText={setUsername} placeholderTextColor="#888" />
                <TouchableOpacity style={styles.dropdownToggle} onPress={() => setShowDropdown(!showDropdown)}>
                  <Text style={styles.dropdownToggleText}>{country || 'SELECT COUNTRY'}</Text>
                </TouchableOpacity>
                {showDropdown && (
                  <View style={styles.dropdown}>
                    <TextInput style={styles.input} placeholder="SEARCH..." value={countrySearch} onChangeText={setCountrySearch} placeholderTextColor="#888" />
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
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
              <Text style={styles.primaryButtonText}>
                {isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.returnButton} onPress={handleClose}>
              <Text style={styles.returnText}>RETURN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
