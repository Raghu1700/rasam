// Bridges app data → the Android home-screen widget.
//
// The widget runs in a separate, short-lived background task that can't hold
// React state or a live Firestore listener. So the app caches the data the
// widget needs in AsyncStorage; the widget's task handler reads it back and
// re-renders. We also cache the ids needed to fire a heartbeat straight from
// the widget's heart button.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { statusMeta } from '../config/constants';
import { auth } from '../config/firebase';

export const WIDGET_DATA_KEY = 'rasam.widget.data';

// Called from the Home screen whenever the partner's member doc changes.
export async function syncWidget(partnerMember) {
  if (Platform.OS !== 'android') return;

  const meta = statusMeta(partnerMember?.status || 'free');
  const data = {
    partnerName: partnerMember?.name || 'Partner',
    statusLabel: meta.label,
    statusEmoji: meta.emoji,
    // Ids the widget needs to send a heartbeat in the background.
    coupleId: (await AsyncStorage.getItem('rasam.coupleId')) || null,
    uid: auth.currentUser?.uid || null,
    partnerUid: partnerMember?.id || null,
    myName: (await AsyncStorage.getItem('rasam.myName')) || 'Me',
  };
  await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data));

  // Ask the OS to repaint the widget with the fresh data.
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const { StatusWidget } = require('../widget/StatusWidget');
    await requestWidgetUpdate({
      widgetName: 'StatusWidget',
      renderWidget: () => StatusWidget({ data }),
    });
  } catch (e) {
    // Widget module may be unavailable in Expo Go / iOS — safe to ignore.
  }
}

export async function readWidgetData() {
  const raw = await AsyncStorage.getItem(WIDGET_DATA_KEY);
  return raw ? JSON.parse(raw) : null;
}
