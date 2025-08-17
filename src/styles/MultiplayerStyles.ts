import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#2F5D50';
const darkGreen = '#1f3d35ff';

export const multiplayerStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingTop: insets.top + 20,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 100,
      gap: 20,
    },
    card: {
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: 20,
      padding: 24,
    },
    heading: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
      color: '#000',
    },
    primaryButton: {
      backgroundColor: 'rgba(47,93,80,0.85)',
      borderRadius: 12,
      paddingVertical: 20,
      alignItems: 'center',
      marginBottom: 14,
    },
    secondaryButton: {
      backgroundColor: darkGreen,
      borderRadius: 12,
      paddingVertical: 20,
      alignItems: 'center',
      marginBottom: 14,
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
      backgroundColor: green,
      borderRadius: 12,
      paddingVertical: 20,
      alignItems: 'center',
    },
    returnText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 20,
      color: '#fff',
    },
  });
