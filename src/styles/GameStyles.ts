import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#2F5D50';
const dark = '#1f3d35ff';

export const gameStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingTop: insets.top + 20,
      paddingBottom: insets.bottom + 88,
    },
    hudRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    hudText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 12,
      color: '#000',
    },
    heartsRow: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
    },
    heart: {
      width: 22,
      height: 18,
      position: 'relative',
    },
    heartHalf: {
      position: 'absolute',
      width: 10,
      height: 16,
      top: 1,
      backgroundColor: '#D64545',
      borderRadius: 4,
    },
    card: {
      flex: 1,
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: 20,
      padding: 12,
    },
    road: {
      flex: 1,
      borderRadius: 14,
      backgroundColor: 'rgba(0,0,0,0.06)',
      overflow: 'hidden',
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
    obstacle: {
      position: 'absolute',
      borderRadius: 6,
    },
    overlayCard: {
      position: 'absolute',
      top: '25%',
      left: 12,
      right: 12,
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      gap: 12,
    },
    overlayTitle: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 20,
      color: '#000',
      textAlign: 'center',
    },
    overlaySub: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: '#000',
      opacity: 0.85,
      textAlign: 'center',
      marginBottom: 4,
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
