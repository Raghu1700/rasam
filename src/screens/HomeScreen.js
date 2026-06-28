import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import PartnerStatusCard from '../components/PartnerStatusCard';
import StatusSelector from '../components/StatusSelector';
import HeartButton from '../components/HeartButton';
import AlertButton from '../components/AlertButton';
import FloatingHearts from '../components/FloatingHearts';
import { syncWidget } from '../services/widgetService';
import { BACKGROUNDS, BG_OVERLAY } from '../config/backgrounds';
import { colors, spacing } from '../config/theme';

export default function HomeScreen() {
  const { partnerMember } = useApp();

  // Keep the Android home-screen widget in sync with the partner's status.
  useEffect(() => {
    syncWidget(partnerMember).catch(() => {});
  }, [partnerMember]);

  return (
    <ImageBackground source={BACKGROUNDS.home} style={styles.bg} resizeMode="cover">
      {/* Dim the photo so cards/text stay readable. */}
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Us 💞</Text>

          <PartnerStatusCard />

          <View style={styles.section}>
            <HeartButton />
          </View>

          <View style={styles.divider} />

          <StatusSelector />

          <AlertButton />
        </ScrollView>

        {/* Reacts to incoming heartbeats / replies. */}
        <FloatingHearts />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: BG_OVERLAY },
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  section: { alignItems: 'center', paddingVertical: spacing.md },
  divider: { height: 1, backgroundColor: colors.border },
});
