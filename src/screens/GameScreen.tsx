import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BackButton from '../components/BackButton';
import { gameStyles as styles } from '../styles/GameStyles';

export default function GameScreen() {
  const [crashed, setCrashed] = useState(false);

  const startGame = () => {
    setCrashed(false);
  };

  const crashGame = () => {
    setCrashed(true);
  };

  return (
    <View style={styles.container}>
      <BackButton />
      {!crashed ? (
        <>
          <Text style={styles.text}>Game Running</Text>
          <TouchableOpacity style={styles.button} onPress={crashGame}>
            <Text style={styles.buttonText}>Simulate Crash</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.text}>Crashed!</Text>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
