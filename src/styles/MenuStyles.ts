import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const red = '#C62828';
const redDark = '#8E1B1B';
const grey = '#2B2B2B';
const greyDark = '#1A1A1A';
const lightGrey = '#E0E0E0';

export const menuStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingTop: insets.top + 20,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginBottom: 20,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      gap: 8,
    },
    infoText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: '#fff',
    },
    flagIcon: {
      width: 28,
      height: 18,
    },
    coinIcon: {
      width: 22,
      height: 22,
    },
    bottomSection: {
      position: 'absolute',
      bottom: insets.bottom + 20,
      left: 0,
      right: 0,
      alignItems: 'center',
      gap: 20,
    },
    startButtons: {
      width: '100%',
      alignItems: 'center',
      gap: 12,
    },
    pixelButtonOuter: {
      width: '72%',
      height: 64,
      backgroundColor: red,
      borderWidth: 4,
      borderColor: redDark,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pixelButtonInner: {
      flex: 1,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pixelButtonOuterGrey: {
      width: '72%',
      height: 50,
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pixelButtonInnerGrey: {
      flex: 1,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    startButtonDisabled: {
      opacity: 0.6,
    },
    startButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 22,
      color: lightGrey,
    },
    startButtonTextSmall: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
    },
    menuRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 22,
      marginTop: 10,
    },
    navItem: {
      alignItems: 'center',
    },
    navButtonOuter: {
      width: 58,
      height: 58,
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navButtonInner: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    navIcon: {
      width: 32,
      height: 32,
      resizeMode: 'contain',
    },
    navLabel: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 10,
      color: lightGrey,
      marginTop: 4,
    },
    loginToast: {
      position: 'absolute',
      top: insets.top + 10,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    loginToastText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
      textAlign: 'center',
    },
    toastIcon: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
    },
    highScoreToast: {
      position: 'absolute',
      top: '100%',
      marginTop: 6,
      alignSelf: 'flex-start',
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    toastText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 12,
      color: lightGrey,
    },
  });
