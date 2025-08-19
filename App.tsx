import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import SplashScreen from './src/screens/SplashScreen';
import MenuScreen from './src/screens/MenuScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AccountScreen from './src/screens/AccountScreen';
import GarageScreen from './src/screens/GarageScreen';
import RankingsScreen from './src/screens/RankingsScreen';
import GameScreen from './src/screens/GameScreen';
import MultiplayerScreen from './src/screens/MultiplayerScreen';

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0F1518',
    card: '#0F1518',
    border: '#2F3B47',
    text: '#E0E0E0',
    primary: '#E0E0E0',
  },
};

export default function App() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync('#0F1518');
    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('#0F1518');
        await NavigationBar.setButtonStyleAsync('light');
      } catch {}
    })();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0F1518" />
      <NavigationContainer theme={theme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />

          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              presentation: 'transparentModal',
              cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                  transform: [
                    {
                      translateY: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [800, 0],
                      }),
                    },
                  ],
                },
              }),
            }}
          />

          <Stack.Screen
            name="Account"
            component={AccountScreen}
            options={{
              presentation: 'transparentModal',
              cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                  transform: [
                    {
                      translateY: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [800, 0],
                      }),
                    },
                  ],
                },
              }),
            }}
          />

          <Stack.Screen
            name="Garage"
            component={GarageScreen}
            options={{
              presentation: 'transparentModal',
              cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                  transform: [
                    {
                      translateY: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [800, 0],
                      }),
                    },
                  ],
                },
              }),
            }}
          />

          <Stack.Screen
            name="Rankings"
            component={RankingsScreen}
            options={{
              presentation: 'transparentModal',
              cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                  transform: [
                    {
                      translateY: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [800, 0],
                      }),
                    },
                  ],
                },
              }),
            }}
          />

          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Multiplayer" component={MultiplayerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
