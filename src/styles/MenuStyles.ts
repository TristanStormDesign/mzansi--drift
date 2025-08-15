import { StyleSheet } from 'react-native';

export const menuStyles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },

  car: {
    width: 160,
    height: 100,
    marginRight: 15
  },

  statsBlock: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 10,
    minWidth: 140
  },

  statsText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5
  },

  flagRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  flag: {
    width: 20,
    height: 14,
    marginRight: 5
  },

  playButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    width: '80%',
    aspectRatio: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20
  },

  playButtonText: {
    color: '#fff',
    fontSize: 20
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%'
  },

  navButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  navIcon: {
    width: 28,
    height: 28,
    marginBottom: 5
  },

  navButtonText: {
    color: '#fff',
    fontSize: 14
  }
});
