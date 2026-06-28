// Lets me set my own live status. Partner sees it update in real time.
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';

import { useApp } from '../context/AppContext';
import { setMyStatus } from '../services/statusService';
import { STATUS_OPTIONS, statusMeta } from '../config/constants';
import { colors, spacing, radius } from '../config/theme';

export default function StatusSelector() {
  const { coupleId, uid, myMember } = useApp();
  const [open, setOpen] = useState(false);
  const current = statusMeta(myMember?.status || 'free');

  async function pick(statusKey) {
    setOpen(false);
    try {
      await setMyStatus(coupleId, uid, statusKey);
    } catch (e) {
      console.warn('set status failed', e);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>I'm currently…</Text>
      <TouchableOpacity style={styles.current} onPress={() => setOpen(true)}>
        <Text style={styles.currentEmoji}>{current.emoji}</Text>
        <Text style={styles.currentLabel}>{current.label}</Text>
        <Text style={styles.change}>change ›</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Set your status</Text>
            <View style={styles.grid}>
              {STATUS_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.chip,
                    current.key === s.key && styles.chipActive,
                  ]}
                  onPress={() => pick(s.key)}
                >
                  <Text style={styles.chipEmoji}>{s.emoji}</Text>
                  <Text style={styles.chipLabel}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  heading: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  current: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  currentEmoji: { fontSize: 26 },
  currentLabel: { fontSize: 18, fontWeight: '700', color: colors.text, flex: 1 },
  change: { color: colors.primaryDark, fontWeight: '600' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    width: '31%',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipEmoji: { fontSize: 26 },
  chipLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 4 },
});
