import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { AppProvider, useApp } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import SetupScreen from './src/screens/SetupScreen';
import LockScreen from './src/screens/LockScreen';
import { LOCK_ENABLED } from './src/config/lockConfig';
import { colors } from './src/config/theme';

function Gate() {
  const { ready, isLinked } = useApp();

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not linked yet → couple setup. Linked → the main tab app.
  return isLinked ? <RootNavigator /> : <SetupScreen />;
}

export default function App() {
  // `unlocked` lives only in memory, so the password is required on every cold
  // launch of the app (per "lock every launch").
  const [unlocked, setUnlocked] = useState(!LOCK_ENABLED);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {!unlocked ? (
        <LockScreen onUnlock={() => setUnlocked(true)} />
      ) : (
        <AppProvider>
          <NavigationContainer>
            <Gate />
          </NavigationContainer>
        </AppProvider>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
