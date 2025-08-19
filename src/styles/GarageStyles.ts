import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const grey = '#2B2B2B';
const greyDark = '#1A1A1A';
const lightGrey = '#E0E0E0';
const sheetBg = '#0F1518';
const handleBlue = '#4A5A6A';
const handleBlueDark = '#2F3B47';

const loginGreen = '#1C8C37';
const loginGreenDark = '#146227';
const red = '#C62828';
const redDark = '#8E1B1B';

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
      marginBottom: 30,
    },
    previewSection: {
      alignItems: 'center',
      marginBottom: 20,
    },
    carImage: {
      width: '100%',
      height: 180,
      resizeMode: 'contain',
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
    priceButton: {
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      height: 44,
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    coinSmall: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
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
    equipButton: {
      backgroundColor: loginGreen,
      borderWidth: 4,
      borderColor: loginGreenDark,
      borderRadius: 6,
      height: 44,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unequipButton: {
      backgroundColor: red,
      borderWidth: 4,
      borderColor: redDark,
      borderRadius: 6,
      height: 44,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
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

    overlayWrap: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    overlaySheet: {
      backgroundColor: sheetBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 20,
      width: '100%',
      maxHeight: '60%',
    },
    confirmText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
      textAlign: 'center',
      marginBottom: 16,
    },
    rowButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    cancelButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 18,
      color: lightGrey,
    },
    greenButton: {
      flex: 1,
      backgroundColor: loginGreen,
      borderWidth: 4,
      borderColor: loginGreenDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    greenButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 18,
      color: lightGrey,
    },
    toast: {
      position: 'absolute',
      top: insets.top + 10,
      left: 20,
      right: 20,
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      paddingHorizontal: 18,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    toastText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
      textAlign: 'center',
    },
  });
