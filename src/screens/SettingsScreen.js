import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { getCouple, setMyName } from '../services/coupleService';
import { colors, spacing, radius } from '../config/theme';

export default function SettingsScreen() {
  const { coupleId, uid, myMember, partnerMember, partnerUid } = useApp();
  const [code, setCode] = useState(null);
  const [name, setName] = useState(myMember?.name || '');

  useEffect(() => {
    if (myMember?.name) setName(myMember.name);
  }, [myMember?.name]);

  useEffect(() => {
    if (!coupleId) return;
    getCouple(coupleId).then((c) => setCode(c?.code || null));
  }, [coupleId]);

  async function shareCode() {
    if (!code) return;
    await Share.share({
      message: `Link up with me on Rasam 💞 — use code ${code}`,
    });
  }

  async function saveName() {
    try {
      await setMyName(coupleId, uid, name.trim());
      Alert.alert('Saved 💕');
    } catch (e) {
      Alert.alert('Could not save', e.message);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings ⚙️</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Your couple code</Text>
          <Text style={styles.code}>{code || '······'}</Text>
          <TouchableOpacity style={styles.btn} onPress={shareCode}>
            <Text style={styles.btnText}>Share code</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            {partnerUid
              ? `Linked with ${partnerMember?.name || 'your partner'} 💞`
              : 'Send this to your partner so they can join.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            maxLength={24}
          />
          <TouchableOpacity style={styles.btnOutline} onPress={saveName}>
            <Text style={styles.btnOutlineText}>Save name</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Made with 💗 for two</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  label: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  code: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 8,
    color: colors.primary,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  hint: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnOutlineText: { color: colors.primaryDark, fontWeight: '700', fontSize: 16 },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 'auto',
  },
});
