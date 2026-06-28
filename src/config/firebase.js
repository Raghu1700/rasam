// Central Firebase initialization. Everything else imports the instances
// (auth, db) from here so we only ever create one app.
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { firebaseConfig } from './firebaseConfig';

const app = initializeApp(firebaseConfig);

// initializeAuth (not getAuth) so we can wire up AsyncStorage persistence —
// this keeps the user signed in (anonymously) across app restarts.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// experimentalForceLongPolling avoids flaky realtime connections that some
// Android networks/emulators have with Firestore's default transport.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Note: we deliberately do NOT use Firebase Cloud Storage (it now requires a
// paid plan). The Photo of the Day is stored compressed inside Firestore — see
// services/photoService.js.

export default app;
