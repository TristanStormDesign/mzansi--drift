import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const grey = '#2B2B2B';
const greyDark = '#1A1A1A';
const red = '#C62828';
const redDark = '#8E1B1B';
const lightGrey = '#E0E0E0';

const loginGreen = '#1C8C37';
const loginGreenDark = '#146227';
const signupYellow = '#F6AF09';
const signupYellowDark = '#B97F07';

export const accountStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'flex-end',
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
      paddingHorizontal: 12,
      paddingVertical: 10,
      zIndex: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toastText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
      textAlign: 'center',
    },
    card: {
      backgroundColor: '#0F1518',
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
      backgroundColor: '#4A5A6A',
    },
    heading: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 28,
      color: lightGrey,
      textAlign: 'center',
      marginBottom: 30,
    },
    formWrapper: {
      justifyContent: 'flex-start',
    },
    formSection: {
      gap: 16,
      marginBottom: 20,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: 12,
    },
    toggleButton: {
      flex: 1,
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 48,
    },
    toggleText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    activeLogin: {
      backgroundColor: loginGreen,
      borderColor: loginGreenDark,
    },
    activeLoginText: {
      color: lightGrey,
    },
    activeSignup: {
      backgroundColor: signupYellow,
      borderColor: signupYellowDark,
    },
    activeSignupText: {
      color: '#222',
    },
    input: {
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      paddingHorizontal: 12,
      height: 48,
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    dropdownToggle: {
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      paddingHorizontal: 12,
      height: 48,
      justifyContent: 'center',
    },
    dropdownToggleText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    dropdown: {
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      maxHeight: 150,
    },
    countryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: greyDark,
    },
    flagSmall: {
      width: 24,
      height: 16,
      marginRight: 8,
    },
    countryName: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    bottomSection: {
      gap: 16,
    },
    primaryButton: {
      backgroundColor: red,
      borderWidth: 4,
      borderColor: redDark,
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
    returnButton: {
      backgroundColor: '#4A5A6A',
      borderWidth: 4,
      borderColor: '#2F3B47',
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
