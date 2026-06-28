// Shared Photo of the Day. One photo per day; both partners can upload/view;
// it "resets" each day (yesterday's photo no longer shows — see photoService).
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useApp } from '../context/AppContext';
import {
  subscribeToPhotoOfDay,
  uploadPhotoOfDay,
} from '../services/photoService';
import { BACKGROUNDS, BG_OVERLAY } from '../config/backgrounds';
import { colors, spacing, radius } from '../config/theme';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = width - spacing.lg * 2;

export default function PhotoScreen() {
  const { coupleId, uid, partnerMember } = useApp();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!coupleId) return;
    const unsub = subscribeToPhotoOfDay(coupleId, (p) => {
      setPhoto(p);
      setLoading(false);
    });
    return unsub;
  }, [coupleId]);

  async function pickAndUpload() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert('Permission needed', 'Allow photo access to share.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled) return;

    setUploading(true);
    try {
      await uploadPhotoOfDay(coupleId, uid, result.assets[0].uri);
    } catch (e) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploading(false);
    }
  }

  const mine = photo?.uploadedBy === uid;

  return (
    <ImageBackground source={BACKGROUNDS.photo} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Photo of the Day 📷</Text>
        <Text style={styles.subtitle}>
          One shared moment, every day. Resets at midnight.
        </Text>

        <View style={styles.frame}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : photo ? (
            <Image source={{ uri: photo.url }} style={styles.photo} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🖼️</Text>
              <Text style={styles.emptyText}>
                No photo yet today.{'\n'}Be the first to share one!
              </Text>
            </View>
          )}
        </View>

        {photo && (
          <Text style={styles.caption}>
            {mine
              ? 'You shared this 💕'
              : `${partnerMember?.name || 'Your partner'} shared this 💕`}
          </Text>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={pickAndUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.btnText}>
              {photo ? 'Replace today\'s photo' : 'Upload today\'s photo'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: BG_OVERLAY },
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted },
  frame: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  photo: { width: '100%', height: '100%' },
  empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  emptyEmoji: { fontSize: 50 },
  emptyText: { color: colors.textMuted, textAlign: 'center', fontSize: 15 },
  caption: { textAlign: 'center', color: colors.textMuted, fontWeight: '600' },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: 'auto',
  },
  btnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
});
