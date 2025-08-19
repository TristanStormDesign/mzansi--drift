import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const grey = '#2B2B2B';
const greyDark = '#1A1A1A';

export const gameStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
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
      backgroundColor: '#0F1518',
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      overflow: 'hidden',
      position: 'relative',
    },
    centerLine: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 8,
      left: '50%',
      marginLeft: -4,
      backgroundColor: grey,
    },
    hudInside: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
      zIndex: 4,
    },
    heartsRow: {
      flexDirection: 'row',
      gap: 6,
    },
    heart: {
      width: 14,
      height: 14,
      backgroundColor: '#C62828',
      borderWidth: 4,
      borderColor: '#8E1B1B',
      borderRadius: 4,
    },
  });
