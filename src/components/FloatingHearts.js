// Full-screen overlay that reacts to incoming signals:
//   • heartbeat   → vibrate + float a burst of hearts up the screen
//   • alert_reply → brief toast with the partner's quick reply
// Listens to `incomingSignal` from AppContext.
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  Vibration,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useApp } from '../context/AppContext';
import { SIGNAL_TYPES } from '../config/constants';
import { colors, radius, spacing } from '../config/theme';

const { width, height } = Dimensions.get('window');

let heartId = 0;

function HeartParticle({ startX, onDone }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -height * 0.7,
        duration: 2200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(drift, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(onDone);
  }, []);

  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (Math.random() - 0.5) * 80],
  });

  return (
    <Animated.Text
      style={[
        styles.particle,
        { left: startX, transform: [{ translateY }, { translateX }], opacity },
      ]}
    >
      {['💗', '💕', '❤️', '💞'][Math.floor(Math.random() * 4)]}
    </Animated.Text>
  );
}

export default function FloatingHearts() {
  const { incomingSignal, clearIncomingSignal } = useApp();
  const [hearts, setHearts] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!incomingSignal) return;

    if (incomingSignal.type === SIGNAL_TYPES.HEARTBEAT) {
      // Vibrate + haptic burst.
      Vibration.vibrate([0, 120, 80, 120, 80, 200]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Spawn a burst of hearts at random x positions.
      const burst = Array.from({ length: 12 }).map(() => ({
        id: heartId++,
        startX: Math.random() * (width - 60) + 10,
      }));
      setHearts((prev) => [...prev, ...burst]);
    }

    if (incomingSignal.type === SIGNAL_TYPES.ALERT_REPLY) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setToast(incomingSignal.payload?.text || 'Your partner replied');
      setTimeout(() => setToast(null), 3000);
    }

    clearIncomingSignal();
  }, [incomingSignal]);

  function removeHeart(id) {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      {hearts.map((h) => (
        <HeartParticle
          key={h.id}
          startX={h.startX}
          onDone={() => removeHeart(h.id)}
        />
      ))}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  particle: { position: 'absolute', bottom: height * 0.18, fontSize: 34 },
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  toastText: { color: colors.white, fontWeight: '700' },
});
