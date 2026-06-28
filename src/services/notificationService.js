// Push notifications via Expo's push service. We store each member's Expo
// push token in their member doc; to notify the partner we POST to Expo's
// push endpoint with their token — no custom backend needed.
//
// Quick-reply action buttons ("Coming!" / "Give me 5 min") are implemented
// with a notification category that we register once at startup.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { ALERT_CATEGORY, ALERT_ACTIONS } from '../config/constants';

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

// Foreground notifications: show a banner + play sound.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register the quick-reply action buttons for the "come online" alert.
export async function setupNotificationCategories() {
  await Notifications.setNotificationCategoryAsync(ALERT_CATEGORY, [
    {
      identifier: ALERT_ACTIONS.COMING,
      buttonTitle: 'Coming! 🏃',
      options: { opensAppToForeground: false },
    },
    {
      identifier: ALERT_ACTIONS.FIVE_MIN,
      buttonTitle: 'Give me 5 min ⏳',
      options: { opensAppToForeground: false },
    },
  ]);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Rasam',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B81',
    });
    await Notifications.setNotificationChannelAsync('heartbeat', {
      name: 'Heartbeats',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 120, 80, 120, 80, 200],
      lightColor: '#FF6B81',
    });
  }
}

// Ask permission and return the Expo push token for this device.
export async function registerForPushToken() {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return null;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  const token = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  return token.data;
}

// Send a push to a single Expo push token. `data` is delivered to the app
// and is how we route action-button replies / heartbeats.
export async function sendPush({ to, title, body, data, categoryId, channelId }) {
  if (!to) return;
  const message = {
    to,
    title,
    body,
    sound: 'default',
    priority: 'high',
    data: data || {},
  };
  if (categoryId) message.categoryId = categoryId; // quick-reply buttons
  if (channelId) message.channelId = channelId; // android channel

  try {
    await fetch(EXPO_PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (err) {
    console.warn('Failed to send push:', err);
  }
}
