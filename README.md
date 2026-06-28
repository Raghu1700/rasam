# Rasam 💞

A private app for two people in a long-distance relationship. Link once with a
couple code, then stay close with live status, alerts, heartbeats, and a shared
photo of the day — plus an Android home-screen widget.

Built with **React Native + Expo** (bare / dev-client for native widget
support), **Firebase** (Auth + Firestore — free plan, no Cloud Storage), and **Expo push
notifications**.

---

## Features

| Feature | What it does |
|---|---|
| 🔗 **Couple linking** | One person creates a couple and gets a 6-char code; the other joins with it. Synced via Firestore. |
| 🔔 **Alert Button** | Tap to send a "come online" push to your partner with quick-reply action buttons — **Coming!** / **Give me 5 min**. |
| 🟢 **Live Status** | Set what you're doing (Working, Sleeping, Eating…); your partner sees it update in real time. |
| 💗 **Heartbeat** | Tap the heart — your partner's phone vibrates and shows a floating-heart animation. |
| 📷 **Photo of the Day** | One shared photo per day, either partner can upload/view. Resets every day. |
| 📱 **Android Widget** | Home-screen widget showing your partner's status + a heart button to send a heartbeat without opening the app. |

---

## Project structure

```
rasam app/
├── App.js                      # Root: gates between Setup and the tab app
├── index.js                    # Registers app + the Android widget task handler
├── app.json                    # Expo config (plugins, widget, notifications)
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Composite index for the signals query
├── assets/                     # Placeholder icons/splash (replace with art)
├── scripts/make-assets.js      # Regenerates placeholder PNGs
└── src/
    ├── config/
    │   ├── firebaseConfig.js    # 👈 PASTE YOUR FIREBASE KEYS HERE
    │   ├── firebase.js          # Initializes Auth / Firestore
    │   ├── constants.js         # Status options, notification categories
    │   └── theme.js             # Colors / spacing
    ├── context/
    │   └── AppContext.js        # Auth + realtime data + notification routing
    ├── navigation/
    │   └── RootNavigator.js     # Bottom tab bar
    ├── screens/
    │   ├── SetupScreen.js       # Create / join a couple
    │   ├── HomeScreen.js        # Status, heartbeat, alert
    │   ├── PhotoScreen.js       # Photo of the day
    │   └── SettingsScreen.js    # Share code, edit name
    ├── components/
    │   ├── AlertButton.js
    │   ├── StatusSelector.js
    │   ├── PartnerStatusCard.js
    │   ├── HeartButton.js
    │   └── FloatingHearts.js
    ├── services/
    │   ├── coupleService.js     # Anonymous auth + couple linking
    │   ├── statusService.js     # Live status read/write
    │   ├── signalService.js     # Alerts / replies / heartbeats
    │   ├── photoService.js      # Photo of the day (compressed → Firestore)
    │   ├── notificationService.js  # Expo push + quick-reply categories
    │   └── widgetService.js     # Bridges app data → widget
    └── widget/
        ├── StatusWidget.js      # Widget UI (FlexWidget/TextWidget)
        └── widgetTaskHandler.js # Background handler (render + heart tap)
```

---

## Data model (Firestore)

```
couples/{coupleId}
  code: "ABC123"
  members: [uidA, uidB]
  createdAt

couples/{coupleId}/members/{uid}
  name, status, statusUpdatedAt, pushToken

couples/{coupleId}/photoOfDay/current   # daily shared photo
  url: "data:image/jpeg;base64,..."     # compressed image, stored in Firestore
  uploadedBy, dateKey, uploadedAt

couples/{coupleId}/signals/{autoId}     # ephemeral
  type: "alert" | "alert_reply" | "heartbeat"
  from, to, createdAt, payload
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Firebase project
In the [Firebase console](https://console.firebase.google.com):

1. Create a project.
2. **Authentication → Sign-in method →** enable **Anonymous**.
3. **Firestore Database →** create (production mode).
   - *No Storage needed* — the Photo of the Day is stored compressed inside
     Firestore, so the app stays entirely on Firebase's **free** plan.
4. **Project settings → Your apps:**
   - Add a **Web app**, copy the config → paste into
     [`src/config/firebaseConfig.js`](src/config/firebaseConfig.js).
   - Add an **Android app** with package `com.raghu.rasam`, download
     `google-services.json` → put it in the project root.
   - (Optional, for iOS push) add an **iOS app**, download
     `GoogleService-Info.plist` → project root.

### 3. Deploy security rules & index
```bash
npm i -g firebase-tools
firebase login
firebase use energy-meter-51848
firebase deploy --only firestore:rules,firestore:indexes
```
(Or paste `firestore.rules` into the console manually — Firestore → Rules tab —
and create the `signals` composite index when the app prompts you with a link.)

### 4. Generate native projects (bare workflow — needed for the widget)
```bash
npx expo prebuild
```

### 5. Run on a device
> Push notifications, the widget, and vibration need a **real device** (or a
> dev build), not Expo Go.

```bash
# Android
npx expo run:android

# iOS (no widget; macOS + Xcode required)
npx expo run:ios
```

For wireless reloads after the first native build:
```bash
npx expo start --dev-client
```

---

## How push notifications work

The app uses **Expo's push service** — no custom backend required:

- Each member's **Expo push token** is saved to their member doc.
- To notify the partner, the app `POST`s to `https://exp.host/--/api/v2/push/send`
  with their token (see `notificationService.js`).
- The **quick-reply buttons** come from a notification *category*
  (`come_online_alert`) registered at startup. Tapping **Coming!** /
  **Give me 5 min** is handled in `AppContext.js` and writes a reply signal +
  push back to the sender — without opening the app.

> For production hardening you can move the send step into a Cloud Function
> triggered by new `signals` docs, so tokens never leave the server. The client
> code path is already structured to make that swap easy.

---

## How the Android widget works

`react-native-android-widget` renders the widget natively from a React
component. Because the widget runs in a short background task (no live
Firestore listener), the flow is:

1. The Home screen caches the partner's status in `AsyncStorage`
   (`widgetService.syncWidget`) and asks the OS to repaint the widget.
2. `widgetTaskHandler.js` reads that cache and renders `StatusWidget`.
3. Tapping the widget's heart fires the `HEARTBEAT` click action, which sends a
   heartbeat in the background using the cached couple ids.

Add the widget from your launcher's widget picker after installing the build.

---

## Notes / next steps

- Placeholder icons live in `assets/` — swap them for real artwork (or rerun
  `node scripts/make-assets.js`).
- iOS does not support the home-screen widget here (it's Android-only via
  `react-native-android-widget`).
- The `firebaseConfig.js`, `google-services.json`, and
  `GoogleService-Info.plist` are git-ignored by default.
