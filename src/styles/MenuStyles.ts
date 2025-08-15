import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#2F5D50';
const darkGreen = '#1f3d35ff';

export const menuStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    userBox: {
      position: 'absolute',
      top: 20,
      left: 20,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 8,
      padding: 6,
      zIndex: 1,
    },
    username: {
      color: '#fff',
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
    },
    flag: {
      width: 32,
      height: 20,
      marginTop: 4,
    },
    score: {
      color: '#fff',
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      marginTop: 4,
    },
    rightMenu: {
      position: 'absolute',
      top: '50%',
      right: 20,
      transform: [{ translateY: -100 }],
      alignItems: 'center',
    },
    navButton: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 8,
      marginVertical: 6,
    },
    navIcon: {
      width: 40,
      height: 40,
    },
    playButtonContainer: {
      position: 'absolute',
      bottom: insets.bottom + 20,
      left: 20,
      right: 20,
    },
    playButton: {
      backgroundColor: 'rgba(47,93,80,0.85)',
      borderRadius: 12,
      paddingVertical: 20,
      alignItems: 'center',
    },
    playButtonText: {
      color: '#fff',
      fontSize: 20,
      fontFamily: 'Silkscreen_400Regular',
    },
    accountOverlay: {
      flex: 1,
      justifyContent: 'space-between',
      padding: 20,
      backgroundColor: 'transparent',
    },
    card: {
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: 20,
      padding: 24,
    },
    toggleRow: {
      flexDirection: 'row',
      marginBottom: 24,
      backgroundColor: 'rgba(255,255,255,0.6)',
      borderRadius: 12,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
    },
    toggleText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: '#333',
    },
    activeToggle: {
      backgroundColor: darkGreen,
    },
    activeToggleText: {
      color: '#fff',
    },
    input: {
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      marginBottom: 14,
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      borderWidth: 1,
      borderColor: green,
      color: '#000',
    },
    dropdownToggle: {
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: green,
      marginBottom: 14,
    },
    dropdownToggleText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: '#000',
    },
    dropdown: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: green,
      maxHeight: 150,
      marginBottom: 14,
    },
    countryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
    flagSmall: {
      width: 24,
      height: 16,
      marginRight: 8,
    },
    countryName: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: '#000',
    },
    primaryButton: {
      backgroundColor: 'rgba(47,93,80,0.85)',
      borderRadius: 12,
      paddingVertical: 20,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: '#fff',
    },
    returnButtonContainer: {
      position: 'absolute',
      bottom: insets.bottom + 20,
      left: 20,
      right: 20,
    },
    returnButton: {
      backgroundColor: 'rgba(47,93,80,0.85)',
      borderRadius: 12,
      paddingVertical: 20,
      alignItems: 'center',
    },
    returnText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: '#fff',
    },
  });
