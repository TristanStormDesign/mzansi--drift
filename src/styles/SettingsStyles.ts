import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#4CAF50';
const red = '#E53935';
const blue = '#3F51B5';

export const settingsStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: '#F5F5F5',
      paddingTop: insets.top + 20,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 100,
      gap: 20,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 24,
      position: 'relative',
    },
    heading: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 22,
      textAlign: 'center',
      marginBottom: 20,
      color: '#000',
    },
    label: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: '#222',
      marginTop: 10,
      marginBottom: 4,
    },
    value: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: '#000',
      marginBottom: 10,
    },
    input: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: green,
      color: '#000',
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      marginBottom: 14,
      borderRadius: 8,
    },
    countryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    flagSmall: {
      width: 28,
      height: 18,
      marginRight: 8,
      borderWidth: 1,
      borderColor: '#000',
    },
    primaryButton: {
      backgroundColor: green,
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
      paddingVertical: 20,
      marginBottom: 14,
      alignItems: 'center',
    },
    deleteButton: {
      backgroundColor: red,
    },
    primaryButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 18,
      color: '#fff',
    },
    returnButtonContainer: {
      position: 'absolute',
      bottom: insets.bottom + 20,
      left: 20,
      right: 20,
    },
    returnButton: {
      backgroundColor: blue,
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
      paddingVertical: 20,
      alignItems: 'center',
    },
    returnText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 22,
      color: '#fff',
    },
  });
