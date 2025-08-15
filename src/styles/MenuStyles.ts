import { StyleSheet } from 'react-native';

export const menuStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#000', 
    padding: 20 
  },

  title: { 
    color: '#fff', 
    fontSize: 32, 
    marginBottom: 40 
  },

  button: { 
    backgroundColor: '#333', 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 8, 
    marginVertical: 10, 
    width: '80%', 
    alignItems: 'center' 
  },

  buttonText: { 
    color: '#fff', 
    fontSize: 18 
  }
});
