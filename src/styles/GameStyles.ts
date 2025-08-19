import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const grey = '#2B2B2B';
const greyDark = '#1A1A1A';
const lightGrey = '#E0E0E0';
const sheetBg = '#0F1518';
const handleBlue = '#4A5A6A';
const handleBlueDark = '#2F3B47';

export const garageStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'flex-end',
    },
    card: {
      backgroundColor: sheetBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 20,
      width: '100%',
    },
    dragHandleWrapper: {
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    dragHandle: {
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: handleBlue,
    },
    heading: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 28,
      color: lightGrey,
      textAlign: 'center',
      marginBottom: 20,
    },
    previewSection: {
      alignItems: 'center',
      marginBottom: 16,
      gap: 10,
    },
    carImage: {
      width: '100%',
      height: 180,
    },
    balancePill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      paddingHorizontal: 12,
      height: 40,
      gap: 8,
    },
    coinSmall: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
    },
    balanceText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    upgradeSection: {
      gap: 12,
      marginBottom: 20,
    },
    upgradeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      paddingHorizontal: 12,
      height: 64,
    },
    upgradeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    upgradeIcon: {
      width: 32,
      height: 32,
      resizeMode: 'contain',
    },
    upgradeLabel: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
    },
    actionButton: {
      backgroundColor: '#3A3A3A',
      borderWidth: 4,
      borderColor: '#222',
      borderRadius: 6,
      height: 44,
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    priceWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    priceText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    actionText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    bottomSection: {
      gap: 16,
    },
    returnButton: {
      backgroundColor: handleBlue,
      borderWidth: 4,
      borderColor: handleBlueDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      width: '100%',
    },
    returnText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 18,
      color: lightGrey,
    },
  });
