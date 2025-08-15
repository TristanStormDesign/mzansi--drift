import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPACING = 16;
const BUTTON_SIZE = 65;

export const gameStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },

    title: {
      color: '#fff',
      fontSize: 28,
      fontFamily: 'Silkscreen_400Regular',
      textAlign: 'center',
      marginVertical: SPACING,
    },

    returnButtonContainer: {
      position: 'absolute',
      bottom: insets.bottom + SPACING,
      left: insets.left + SPACING,
      right: insets.right + SPACING,
    },

    returnButton: {
      backgroundColor: '#000',
      borderWidth: 5,
      borderColor: '#ccc',
      height: BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },

    returnButtonText: {
      color: '#fff',
      fontSize: 28,
      fontFamily: 'Silkscreen_400Regular',
    },
  });
