import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#2F5D50';

export const garageStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
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
    carImage: {
      width: '100%',
      height: 200,
      resizeMode: 'contain',
    },
    upgradeList: {
      gap: 14,
    },
    upgradeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: green,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    upgradeText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: '#000',
      flex: 1,
    },
    upgradeImage: {
      width: 60,
      height: 40,
      resizeMode: 'contain',
      marginLeft: 10,
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
    moreSoonRow: {
      backgroundColor: '#1f3d35',
      borderWidth: 0,
    },
    moreSoonText: {
      color: '#fff',
    },
  });
