import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const grey = '#2B2B2B';
const greyDark = '#1A1A1A';
const lightGrey = '#E0E0E0';
const sheetBg = '#0F1518';
const handleBlue = '#4A5A6A';
const handleBlueDark = '#2F3B47';
const red = '#C62828';
const redDark = '#8E1B1B';

export const settingsStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
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
    bottomSection: {
      gap: 16,
    },
    primaryButton: {
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      width: '100%',
    },
    primaryButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 18,
      color: lightGrey,
    },
    dangerButton: {
      backgroundColor: red,
      borderWidth: 4,
      borderColor: redDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      width: '100%',
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
    redButton: {
      flex: 1,
      backgroundColor: red,
      borderWidth: 4,
      borderColor: redDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    redButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 18,
      color: lightGrey,
    },
  });
