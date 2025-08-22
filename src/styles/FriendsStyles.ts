import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const grey = '#2B2B2B';
const greyDark = '#1A1A1A';
const red = '#C62828';
const redDark = '#8E1B1B';
const lightGrey = '#E0E0E0';
const handleBlue = '#4A5A6A';
const handleBlueDark = '#2F3B47';
const green = '#2E7D32';
const greenDark = '#1B5E20';

export const friendsStyles = (insets: ReturnType<typeof useSafeAreaInsets>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: '#0F1518',
      paddingTop: insets.top + 20,
    },
    heading: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 28,
      color: lightGrey,
      textAlign: 'center',
      marginBottom: 16,
    },
    feedList: {
      flex: 1,
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    // Instagram-like post card
    postCard: {
      backgroundColor: '#0B1114',
      borderWidth: 3,
      borderColor: handleBlueDark,
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 16,
      width: '100%',
      alignSelf: 'center',
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    postAuthor: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    postTime: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 12,
      color: '#9AA0A6',
    },
    postImage: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: grey,
    },
    postText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    emptyText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
      textAlign: 'center',
      marginTop: 40,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginBottom: insets.bottom + 20,
      marginHorizontal: 20,
      gap: 12,
    },
    // ADD button → green
    primaryButton: {
      flex: 1,
      backgroundColor: green,
      borderWidth: 4,
      borderColor: greenDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    primaryButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
    },
    // FRIENDS button → grey
    greyButton: {
      flex: 1,
      backgroundColor: handleBlue,
      borderWidth: 4,
      borderColor: handleBlueDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    greyButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
    },
    returnButton: {
      flex: 1,
      backgroundColor: handleBlue,
      borderWidth: 4,
      borderColor: handleBlueDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    returnText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 16,
      color: lightGrey,
    },
    overlayWrap: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: 'flex-end',
    },
    overlaySheet: {
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
    overlayHeading: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 24,
      color: lightGrey,
      textAlign: 'center',
      marginBottom: 20,
    },
    qrBox: {
      alignSelf: 'center',
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      padding: 16,
      marginBottom: 20,
    },
    qrWhite: {
      backgroundColor: '#FFFFFF',
      padding: 10,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    camera: {
      width: '100%',
      height: 260,
      marginBottom: 20,
      borderRadius: 12,
      overflow: 'hidden',
    },
    cameraPlaceholder: {
      width: '100%',
      height: 260,
      marginBottom: 20,
      borderRadius: 12,
      borderWidth: 4,
      borderColor: handleBlueDark,
      backgroundColor: grey,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraPlaceholderText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    friendsList: {
      flexGrow: 0,
      marginTop: 10,
    },
    friendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: greyDark,
    },
    friendName: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 18,
      color: lightGrey,
      marginLeft: 8,
    },
    removeButton: {
      backgroundColor: red,
      borderWidth: 3,
      borderColor: redDark,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    removeButtonText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
    },
    bottomButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: 12,
      marginBottom: 20,
    },
    returnButtonModal: {
      backgroundColor: handleBlue,
      borderWidth: 4,
      borderColor: handleBlueDark,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      marginTop: 12,
      width: '100%',
    },
    loginToast: {
      position: 'absolute',
      top: insets.top + 10,
      left: 20,
      right: 20,
      backgroundColor: grey,
      borderWidth: 4,
      borderColor: greyDark,
      borderRadius: 6,
      paddingHorizontal: 18,
      paddingVertical: 16,
      zIndex: 10,
    },
    loginToastText: {
      fontFamily: 'Silkscreen_400Regular',
      fontSize: 14,
      color: lightGrey,
      textAlign: 'center',
    },
  });
