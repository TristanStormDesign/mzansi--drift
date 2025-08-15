import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPACING = 16;
const CONTENT_WIDTH = '80%';
const BUTTON_SIZE = 65;

export const menuStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: SafeAreaView.length ? 0 : SPACING,
  },
  playButton: {
    backgroundColor: '#000',
    borderWidth: 5,
    borderColor: '#ccc',
    width: CONTENT_WIDTH,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Silkscreen_400Regular',
  },
  navRow: {
    flexDirection: 'row',
    width: CONTENT_WIDTH,
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  navButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: '#000',
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: '60%',
    height: '60%',
  },
  settingsBorder: { borderColor: '#D53927' },
  accountBorder: { borderColor: '#0071DC' },
  garageBorder: { borderColor: '#1C8832' },
  rankingsBorder: { borderColor: '#B28832' },
});
