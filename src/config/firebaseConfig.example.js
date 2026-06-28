// ============================================================================
//  FIREBASE CREDENTIALS  —  TEMPLATE
// ============================================================================
//
//  The REAL firebaseConfig.js is intentionally NOT committed to git (it holds
//  your project keys). To set the app up on a fresh machine:
//
//    1. Copy this file to  src/config/firebaseConfig.js
//    2. Fill in your values from the Firebase console
//       (Project settings → Your apps → Web app → firebaseConfig).
//    3. Also place google-services.json in the project root (Android build).
//
//  In the Firebase console, enable:
//    • Authentication → Sign-in method → Anonymous
//    • Firestore Database  (then apply firestore.rules)
//
//  NOTE: We do NOT use Cloud Storage — the Photo of the Day is stored
//  compressed inside Firestore (free plan).
// ============================================================================

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
