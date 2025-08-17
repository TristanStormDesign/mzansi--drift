import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#2F5D50';
const darkGreen = '#1f3d35ff';

export const menuStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingTop: insets.top + 20,
    },
    topBar: {
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: 20,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginBottom: 20,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    flagIcon: {
      width: 32,
      height: 20,
    },
    username: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: '#000',
    },
    coinBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    coinIcon: {
      width: 24,
      height: 24,
    },
    coinText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: '#000',
    },
    contentRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },
    carContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    carImage: {
      width: '60%',
      height: '40%',
    },
    menuColumn: {
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    navButton: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 8,
    },
    navIcon: {
      width: 40,
      height: 40,
    },
    startButtonContainer: {
      position: 'absolute',
      bottom: insets.bottom + 20,
      left: 20,
      right: 20,
    },
    startRow: {
      flexDirection: 'row',
      gap: 12,
    },
    startButton: {
      flex: 1,
      height: 64,
      backgroundColor: green,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    startButtonSecondary: {
      backgroundColor: darkGreen,
    },
    startButtonDisabled: {
      opacity: 0.5,
    },
    startButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 20,
      color: '#fff',
      textAlign: 'center',
      textAlignVertical: 'center',
      includeFontPadding: false,
      letterSpacing: 0.5,
    },
  });
