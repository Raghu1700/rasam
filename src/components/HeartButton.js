// Tap to send a heartbeat. Partner's phone vibrates + shows floating hearts.
import React, { useRef, useState } from 'react';
import {
  TouchableWithoutFeedback,
  Animated,
  Text,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useApp } from '../context/AppContext';
import { sendHeartbeat } from '../services/signalService';
import { colors } from '../config/theme';

export default function HeartButton() {
  const { coupleId, uid, myMember, partnerUid } = useApp();
  const scale = useRef(new Animated.Value(1)).current;
  const [count, setCount] = useState(0);

  function pop() {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }

  async function onPress() {
    if (!partnerUid) {
      return Alert.alert('No partner yet', 'They need to join your code.');
    }
    pop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCount((c) => c + 1);
    try {
      await sendHeartbeat(coupleId, uid, myMember?.name, partnerUid);
    } catch (e) {
      console.warn('heartbeat failed', e);
    }
  }

  return (
    <View style={styles.wrap}>
      <TouchableWithoutFeedback onPress={onPress}>
        <Animated.View style={[styles.heart, { transform: [{ scale }] }]}>
          <Text style={styles.heartEmoji}>💗</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
      <Text style={styles.caption}>
        {count > 0 ? `Sent ${count} ${count === 1 ? 'beat' : 'beats'} 💞` : 'Tap to send a heartbeat'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  heart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  heartEmoji: { fontSize: 60 },
  caption: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
});
