// First-run couple linking. One person taps "Create" and shares the code;
// the other taps "Join" and enters it. Both then land in the main app.
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { createCouple, joinCouple } from '../services/coupleService';
import { colors, spacing, radius } from '../config/theme';

export default function SetupScreen() {
  const { onLinked } = useApp();
  const [mode, setMode] = useState(null); // 'create' | 'join' | null
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return Alert.alert('Add your name first 🙂');
    setBusy(true);
    try {
      const { coupleId, code: newCode } = await createCouple(name.trim());
      setGeneratedCode(newCode);
      // Give them a beat to see/share the code, then enter the app.
      setTimeout(() => onLinked(coupleId), 0);
    } catch (e) {
      Alert.alert('Could not create', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) return Alert.alert('Add your name first 🙂');
    if (code.trim().length < 4) return Alert.alert('Enter the full code');
    setBusy(true);
    try {
      const { coupleId } = await joinCouple(code.trim(), name.trim());
      onLinked(coupleId);
    } catch (e) {
      Alert.alert('Could not join', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.logo}>💞</Text>
          <Text style={styles.title}>Rasam</Text>
          <Text style={styles.subtitle}>
            Link with your person to get started
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={24}
          />

          {/* Mode chooser */}
          {!mode && (
            <View style={{ width: '100%', gap: spacing.md }}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setMode('create')}
              >
                <Text style={styles.primaryBtnText}>Create a couple</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setMode('join')}
              >
                <Text style={styles.secondaryBtnText}>
                  Join with a code
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Create flow */}
          {mode === 'create' && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              {generatedCode ? (
                <>
                  <Text style={styles.label}>Share this code 💌</Text>
                  <Text style={styles.code}>{generatedCode}</Text>
                  <ActivityIndicator color={colors.primary} />
                </>
              ) : (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleCreate}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      Generate our code
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              <BackLink onPress={() => setMode(null)} />
            </View>
          )}

          {/* Join flow */}
          {mode === 'join' && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="ABC123"
                placeholderTextColor={colors.textMuted}
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleJoin}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Link us up 💕</Text>
                )}
              </TouchableOpacity>
              <BackLink onPress={() => setMode(null)} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BackLink({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginTop: spacing.lg }}>
      <Text style={{ color: colors.textMuted }}>← Back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  logo: { fontSize: 56 },
  title: { fontSize: 34, fontWeight: '800', color: colors.text },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 6,
    marginBottom: spacing.md,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  secondaryBtn: {
    width: '100%',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryBtnText: { color: colors.primaryDark, fontSize: 17, fontWeight: '700' },
  label: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.sm },
  code: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 8,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
});
