import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#2F5D50';
const red = '#B22222';

export const settingsStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingTop: insets.top + 20, // Respect safe area at top
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 100, // Extra space so content not hidden behind return btn
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
    label: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: '#333',
      marginTop: 10,
    },
    value: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: '#000',
      marginBottom: 10,
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
    countryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    flagSmall: {
      width: 24,
      height: 16,
      marginRight: 8,
    },
    primaryButton: {
      backgroundColor: 'rgba(47,93,80,0.85)',
      borderRadius: 12,
      paddingVertical: 20,
      alignItems: 'center',
      marginBottom: 14,
    },
    deleteButton: {
      backgroundColor: red,
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
      backgroundColor: '#2F5D50',
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
