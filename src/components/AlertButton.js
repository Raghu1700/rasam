// "Come online" alert. Sends the partner a push with quick-reply buttons.
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useApp } from '../context/AppContext';
import { sendAlert } from '../services/signalService';
import { colors, spacing, radius } from '../config/theme';

export default function AlertButton() {
  const { coupleId, uid, myMember, partnerUid } = useApp();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onPress() {
    if (!partnerUid) {
      return Alert.alert('No partner yet', 'Wait for them to join your code.');
    }
    setBusy(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await sendAlert(coupleId, uid, myMember?.name, partnerUid);
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch (e) {
      Alert.alert('Could not send', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <TouchableOpacity
      style={[styles.btn, sent && styles.btnSent]}
      onPress={onPress}
      disabled={busy}
      activeOpacity={0.85}
    >
      {busy ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>
          {sent ? 'Alert sent 💗' : '🔔  Come online!'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  btnSent: { backgroundColor: colors.success },
  text: { color: colors.white, fontSize: 20, fontWeight: '800' },
});
