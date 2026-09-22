import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GameScreen from './src/screens/GameScreen';
import GameModeScreen from './src/screens/GameModeScreen';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('GameMode');
  const [mode, setMode] = useState('pvp');

  const navigation = {
    navigate: (screenName, params) => {
      if (params && params.mode) {
        setMode(params.mode);
      }
      setCurrentScreen(screenName);
    }
  };

  return (
    <SafeAreaProvider>
      {currentScreen === 'GameMode' ? (
        <GameModeScreen navigation={navigation} />
      ) : (
        <GameScreen navigation={navigation} route={{ params: { mode } }} />
      )}
    </SafeAreaProvider>
  );
};

export default App;
