// Shows the partner's live status, updating in real time from Firestore.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useApp } from '../context/AppContext';
import { statusMeta } from '../config/constants';
import { colors, spacing, radius } from '../config/theme';

function timeAgo(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PartnerStatusCard() {
  const { partnerMember, partnerUid } = useApp();

  if (!partnerUid) {
    return (
      <View style={styles.card}>
        <Text style={styles.name}>Waiting for your partner…</Text>
        <Text style={styles.hint}>
          Share your couple code from the Settings tab.
        </Text>
      </View>
    );
  }

  const meta = statusMeta(partnerMember?.status || 'free');
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{partnerMember?.name || 'Partner'} is</Text>
      <View style={styles.row}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
        <Text style={styles.status}>{meta.label}</Text>
      </View>
      <Text style={styles.updated}>
        updated {timeAgo(partnerMember?.statusUpdatedAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  label: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emoji: { fontSize: 40 },
  status: { fontSize: 30, fontWeight: '800', color: colors.text },
  updated: { fontSize: 12, color: colors.textMuted },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  hint: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
