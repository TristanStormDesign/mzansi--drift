import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/screens/SplashScreen';
import MenuScreen from './src/screens/MenuScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AccountScreen from './src/screens/AccountScreen';
import GarageScreen from './src/screens/GarageScreen';
import RankingsScreen from './src/screens/RankingsScreen';
import GameScreen from './src/screens/GameScreen';
import MultiplayerScreen from './src/screens/MultiplayerScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'transparentModal', cardStyleInterpolator: ({ current }) => ({ cardStyle: { transform: [{ translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [800, 0] }) }] } }) }}
        />
        <Stack.Screen
          name="Account"
          component={AccountScreen}
          options={{ presentation: 'transparentModal', cardStyleInterpolator: ({ current }) => ({ cardStyle: { transform: [{ translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [800, 0] }) }] } }) }}
        />
        <Stack.Screen
          name="Garage"
          component={GarageScreen}
          options={{ presentation: 'transparentModal', cardStyleInterpolator: ({ current }) => ({ cardStyle: { transform: [{ translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [800, 0] }) }] } }) }}
        />
        <Stack.Screen
          name="Rankings"
          component={RankingsScreen}
          options={{ presentation: 'transparentModal', cardStyleInterpolator: ({ current }) => ({ cardStyle: { transform: [{ translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [800, 0] }) }] } }) }}
        />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Multiplayer" component={MultiplayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
