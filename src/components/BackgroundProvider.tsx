import React, { createContext, useContext, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, Image } from 'react-native';

type BackgroundContextType = {
  moveUp: (onComplete?: () => void, delay?: number) => void;
  moveDown: (onComplete?: () => void, delay?: number) => void;
};

const BackgroundContext = createContext<BackgroundContextType>({
  moveUp: () => {},
  moveDown: () => {},
});

export const useBackground = () => useContext(BackgroundContext);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const translateY = useRef(new Animated.Value(0)).current;

  const moveUp = (onComplete?: () => void, delay: number = 0) => {
    setTimeout(() => {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: true,
      }).start(onComplete);
    }, delay);
  };

  const moveDown = (onComplete?: () => void, delay: number = 0) => {
    setTimeout(() => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(onComplete);
    }, delay);
  };

  return (
    <BackgroundContext.Provider value={{ moveUp, moveDown }}>
      <Animated.View style={[styles.backgroundWrapper, { transform: [{ translateY }] }]}>
        <Image
          source={require('../assets/bg/bg.webp')}
          style={{ position: 'absolute', bottom: 0, width: screenWidth, height: screenHeight * 1.2 }}
          resizeMode="cover"
        />
      </Animated.View>
      {children}
    </BackgroundContext.Provider>
  );
};

const styles = StyleSheet.create({
  backgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
});
