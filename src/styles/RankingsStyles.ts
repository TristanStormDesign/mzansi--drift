import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

const grey = '#2B2B2B';
const greyDark = '#1A1A1A';
const lightGrey = '#E0E0E0';

export const rankingsStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'flex-end',
    },
    card: {
      backgroundColor: '#0F1518',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 20,
      paddingTop: 10,
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
    listContainer: {
      gap: 10,
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 4,
      borderRadius: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: grey,
    },
    medalIcon: {
      width: 28,
      height: 28,
      marginRight: 8,
    },
    rankText: {
      width: 28,
      textAlign: 'center',
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
      marginRight: 8,
    },
    flagSmall: {
      width: 24,
      height: 16,
      borderRadius: 2,
      marginRight: 8,
      backgroundColor: greyDark,
    },
    usernameText: {
      flex: 1,
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
    },
    scoreText: {
      minWidth: 50,
      textAlign: 'right',
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
      marginLeft: 8,
    },
    bottomSection: {
      marginTop: 20,
      gap: 16,
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
