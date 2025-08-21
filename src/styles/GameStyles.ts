import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const grey = '#2B2B2B';
const greyDark = '#1A1A1A';
const lightGrey = '#E0E0E0';
const cardBg = '#0F1518';
const chipBg = '#0B1114';
const chipBorder = '#2F3B47';
const red = '#C62828';
const redDark = '#8E1B1B';
const loginGreen = '#1C8C37';
const loginGreenDark = '#146227';

export const gameStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    blank: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingTop: insets.top + 20,
    },
    card: {
      flex: 1,
      marginHorizontal: 20,
      paddingBottom: insets.bottom + 20,
      justifyContent: 'flex-end',
    },
    road: {
      flex: 1,
      backgroundColor: cardBg,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      overflow: 'hidden',
      position: 'relative',
    },
    hudInside: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
      zIndex: 4,
    },
    hudRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    hudHeartsChip: {
      backgroundColor: chipBg,
      borderWidth: 4,
      borderColor: chipBorder,
      borderRadius: 8,
      paddingHorizontal: 10,
      height: 32,
      justifyContent: 'center',
      minWidth: 80,
    },
    hudHeartsInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    heartIcon: {
      width: 16,
      height: 16,
    },
    heartOn: {
      opacity: 1,
    },
    heartOff: {
      opacity: 0.25,
    },
    hudChipsRight: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    hudChip: {
      backgroundColor: chipBg,
      borderWidth: 4,
      borderColor: chipBorder,
      borderRadius: 8,
      paddingHorizontal: 10,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 56,
    },
    hudChipRow: {
      backgroundColor: chipBg,
      borderWidth: 4,
      borderColor: chipBorder,
      borderRadius: 8,
      paddingHorizontal: 10,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
      minWidth: 72,
    },
    hudChipText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    hudCoinIcon: {
      width: 16,
      height: 16,
    },
    obstacle: {
      position: 'absolute',
      top: 0,
      backgroundColor: 'transparent',
      zIndex: 2,
    },
    car: {
      position: 'absolute',
      backgroundColor: 'transparent',
      zIndex: 3,
    },
    full: {
      width: '100%',
      height: '100%',
    },
    relativeBox: {
      position: 'relative',
    },

    overlayWrap: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
    },
    overlayCard: {
      backgroundColor: cardBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 20,
      paddingTop: 10,
      width: '100%',
    },
    overlayTitle: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 28,
      color: lightGrey,
      textAlign: 'center',
      marginBottom: 18,
    },
    overlaySectionWrap: {
      gap: 14,
      marginBottom: 18,
    },
    overlayInfoCard: {
      backgroundColor: chipBg,
      borderWidth: 4,
      borderColor: chipBorder,
      borderRadius: 10,
      padding: 12,
      alignItems: 'center',
    },
    overlayInfoText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
      marginBottom: 10,
      textAlign: 'center',
    },
    tutorialBox: {
      width: 80,
      height: 80,
      borderRadius: 6,
      overflow: 'hidden',
      alignSelf: 'center',
    },

    miniRow: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'center',
    },
    miniCard: {
      backgroundColor: chipBg,
      borderWidth: 4,
      borderColor: chipBorder,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems: 'center',
      minWidth: 120,
      gap: 6,
    },
    miniImg: {
      width: 28,
      height: 28,
    },
    miniText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 12,
      color: lightGrey,
    },

    btnCol: {
      gap: 16,
    },
    btnRow: {
      flexDirection: 'row',
      gap: 16,
    },
    btnGreen: {
      backgroundColor: loginGreen,
      borderWidth: 4,
      borderColor: loginGreenDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      width: '100%',
    },
    btnGrey: {
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      width: '100%',
    },
    btnGreenFlex: {
      flex: 1,
      backgroundColor: loginGreen,
      borderWidth: 4,
      borderColor: loginGreenDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    btnGreyFlex: {
      flex: 1,
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    btnText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 18,
      color: lightGrey,
    },

    overlayHigh: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: '#FFD54F',
      textAlign: 'center',
      marginBottom: 8,
    },
    endRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 18,
    },
    infoPill: {
      backgroundColor: chipBg,
      borderWidth: 4,
      borderColor: chipBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoPillRow: {
      backgroundColor: chipBg,
      borderWidth: 4,
      borderColor: chipBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    infoPillText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
    },
    pillCoin: {
      width: 18,
      height: 18,
    },
  });
