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
    topBar: {
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: 20,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    flagIcon: {
      width: 32,
      height: 20,
      resizeMode: 'contain',
    },
    username: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: '#000',
    },
    coinBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    coinIcon: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
    },
    coinText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: '#000',
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
    upgradeRowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    upgradeInfoCard: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: green,
      paddingVertical: 12,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
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
    actionButton: {
      width: 60,
      height: 60,
      backgroundColor: green,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    priceContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    coinSmall: {
      width: 14,
      height: 14,
      resizeMode: 'contain',
    },
    priceText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 12,
      color: '#fff',
    },
    equipText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 12,
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
