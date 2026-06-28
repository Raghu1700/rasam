// Secret password gate shown on every app launch. Until the correct password
// (from lockConfig.js) is entered, nothing else in the app is rendered.
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_PASSWORD } from '../config/lockConfig';
import { colors, spacing, radius } from '../config/theme';

export default function LockScreen({ onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;

  function fail() {
    setError(true);
    setValue('');
    // Little shake animation on a wrong password.
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function submit() {
    if (value === APP_PASSWORD) {
      setError(false);
      onUnlock();
    } else {
      fail();
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.lock}>🔒</Text>
        <Text style={styles.title}>Rasam</Text>
        <Text style={styles.subtitle}>Enter your secret password</Text>

        <Animated.View
          style={[styles.inputWrap, { transform: [{ translateX: shake }] }]}
        >
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value}
            onChangeText={(t) => {
              setValue(t);
              setError(false);
            }}
            placeholder="••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            keyboardType="default"
            autoFocus
            onSubmitEditing={submit}
            returnKeyType="go"
          />
        </Animated.View>

        {error && <Text style={styles.errorText}>Wrong password. Try again.</Text>}

        <TouchableOpacity style={styles.btn} onPress={submit}>
          <Text style={styles.btnText}>Unlock 💞</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  lock: { fontSize: 56 },
  title: { fontSize: 34, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.md },
  inputWrap: { width: '100%' },
  input: {
    width: '100%',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.text,
  },
  inputError: { borderColor: colors.primary },
  errorText: { color: colors.primaryDark, fontWeight: '600' },
  btn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
});
