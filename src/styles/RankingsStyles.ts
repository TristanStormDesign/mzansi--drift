import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const green = '#2F5D50';

export const rankingsStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
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
    listContainer: {
      gap: 5,
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderWidth: 1,
      marginBottom: 14,
    },
    rankText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      width: 30,
      textAlign: 'center',
    },
    medalIcon: {
      width: 30,
      height: 30,
      marginRight: 5,
    },
    flagIcon: {
      width: 24,
      height: 16,
      marginRight: 8,
    },
    usernameText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      flex: 1,
    },
    scoreText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
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
