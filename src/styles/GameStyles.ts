import { StyleSheet } from 'react-native';

export const gameStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#000' 
  },

  text: { 
    color: '#fff', 
    fontSize: 24, 
    marginBottom: 20 
  },

  button: { 
    backgroundColor: '#333', 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 8 
  },

  buttonText: { 
    color: '#fff', 
    fontSize: 18 
  }
});
