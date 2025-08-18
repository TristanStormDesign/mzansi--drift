import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#2F5D50';

export const gameStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingTop: insets.top + 10,
      paddingBottom: insets.bottom + 60,
    },
    hudRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    hudText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 13,
      color: '#000',
    },
    card: {
      flex: 1,
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: 20,
      overflow: 'hidden',
    },
    road: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.06)',
      position: 'relative',
    },
    centerLine: {
      position: 'absolute',
      left: '50%',
      top: 0,
      width: 2,
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.15)',
      transform: [{ translateX: -1 }],
    },
    hudInside: {
      position: 'absolute',
      top: 10,
      left: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10,
    },
    heartsRow: {
      flexDirection: 'row',
      gap: 6,
    },
    heart: {
      width: 20,
      height: 18,
      backgroundColor: '#D64545',
      borderRadius: 4,
    },
    overlayCard: {
      position: 'absolute',
      top: '25%',
      left: 20,
      right: 20,
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      gap: 14,
    },
    overlayTitle: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 22,
      color: '#000',
      textAlign: 'center',
    },
    overlaySub: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: '#000',
      opacity: 0.85,
      textAlign: 'center',
      marginBottom: 6,
    },
    overlayRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    overlayButton: {
      flex: 1,
      backgroundColor: green,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    overlayButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: '#fff',
    },
    overlayHint: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 12,
      color: '#000',
      opacity: 0.8,
      textAlign: 'center',
    },
    returnButtonContainer: {
      position: 'absolute',
      bottom: insets.bottom + 16,
      left: 20,
      right: 20,
    },
    returnButton: {
      backgroundColor: green,
      borderRadius: 12,
      paddingVertical: 18,
      alignItems: 'center',
    },
    returnText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 18,
      color: '#fff',
    },
  });
