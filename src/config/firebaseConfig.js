// ============================================================================
//  FIREBASE CREDENTIALS  —  loaded from environment variables
// ============================================================================
//
//  The actual key values are NOT stored in this file (so they never land in
//  git). They come from EXPO_PUBLIC_* environment variables:
//
//    • Local dev/builds:  a .env file in the project root (git-ignored).
//                         See .env.example for the variable names.
//    • EAS cloud builds:  EAS environment variables (created with
//                         `eas env:create`, visibility "sensitive").
//
//  Expo automatically inlines any process.env.EXPO_PUBLIC_* value into the app
//  at build time.
//
//  Firebase web API keys are not secrets (they ship inside every app and are
//  protected by Firestore security rules), but keeping them out of git avoids
//  exposing them in the public repo.
// ============================================================================

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Fail fast with a clear message if the env vars aren't set.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Firebase config is missing. Set the EXPO_PUBLIC_FIREBASE_* variables ' +
      'in your .env file (local) and in EAS env vars (cloud builds).'
  );
}
