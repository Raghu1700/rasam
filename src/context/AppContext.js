// The app's single source of truth. Handles:
//   • anonymous sign-in + resolving which couple we belong to
//   • realtime subscriptions to my member doc and my partner's
//   • registering/saving the push token
//   • routing notification action-button taps (alert quick replies)
//   • exposing incoming heartbeats so the UI can animate/vibrate
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth } from '../config/firebase';
import {
  ensureSignedIn,
  findCoupleForUser,
  savePushToken,
  subscribeToCouple,
} from '../services/coupleService';
import { subscribeToMember } from '../services/statusService';
import {
  subscribeToSignals,
  sendAlertReply,
} from '../services/signalService';
import {
  registerForPushToken,
  setupNotificationCategories,
} from '../services/notificationService';
import { SIGNAL_TYPES, ALERT_ACTIONS } from '../config/constants';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const COUPLE_CACHE_KEY = 'rasam.coupleId';

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false); // initial auth/couple resolved
  const [uid, setUid] = useState(null);
  const [coupleId, setCoupleId] = useState(null);
  const [myMember, setMyMember] = useState(null);
  const [partnerMember, setPartnerMember] = useState(null);
  const [partnerUid, setPartnerUid] = useState(null);

  // Transient incoming-signal channel the UI listens to (heartbeats, replies).
  const [incomingSignal, setIncomingSignal] = useState(null);

  // App start time — we only react to signals created after this so we don't
  // replay history on launch.
  const sessionStart = useRef(Date.now());

  // --- 1. Sign in + figure out our couple -------------------------------
  const resolveCouple = useCallback(async () => {
    const myUid = await ensureSignedIn();
    setUid(myUid);

    let resolved = await findCoupleForUser(myUid);
    if (resolved) {
      setCoupleId(resolved.coupleId);
      await AsyncStorage.setItem(COUPLE_CACHE_KEY, resolved.coupleId);
    } else {
      // Fall back to any cached id (covers brief offline launches).
      const cached = await AsyncStorage.getItem(COUPLE_CACHE_KEY);
      if (cached) setCoupleId(cached);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    setupNotificationCategories().catch(() => {});
    resolveCouple().catch((e) => {
      console.warn('resolveCouple failed:', e);
      setReady(true);
    });
  }, [resolveCouple]);

  // Called by the setup screen after create/join so the app re-renders into
  // the main UI without a restart.
  const onLinked = useCallback(async (newCoupleId) => {
    setCoupleId(newCoupleId);
    await AsyncStorage.setItem(COUPLE_CACHE_KEY, newCoupleId);
  }, []);

  // --- 2. Subscribe to my member doc + derive partner uid ---------------
  useEffect(() => {
    if (!coupleId || !uid) return;
    const unsub = subscribeToMember(coupleId, uid, (m) => {
      setMyMember(m);
      // Cache my name so the widget's background task can use it as the
      // heartbeat sender name.
      if (m?.name) AsyncStorage.setItem('rasam.myName', m.name).catch(() => {});
    });
    return unsub;
  }, [coupleId, uid]);

  // Watch the couple doc so we discover the partner uid the moment they join
  // (members array grows) — no app restart needed.
  useEffect(() => {
    if (!coupleId || !uid) return;
    const unsub = subscribeToCouple(coupleId, (couple) => {
      if (!couple) return;
      const other = (couple.members || []).find((m) => m !== uid);
      setPartnerUid(other || null);
    });
    return unsub;
  }, [coupleId, uid]);

  // --- 3. Subscribe to the partner's member doc (live status) -----------
  useEffect(() => {
    if (!coupleId || !partnerUid) return;
    const unsub = subscribeToMember(coupleId, partnerUid, setPartnerMember);
    return unsub;
  }, [coupleId, partnerUid]);

  // --- 4. Register + persist push token ---------------------------------
  useEffect(() => {
    if (!coupleId || !uid) return;
    (async () => {
      const token = await registerForPushToken();
      if (token) await savePushToken(coupleId, uid, token);
    })();
  }, [coupleId, uid]);

  // --- 5. Listen for incoming signals (heartbeats, replies, alerts) -----
  useEffect(() => {
    if (!coupleId || !uid) return;
    const unsub = subscribeToSignals(
      coupleId,
      uid,
      sessionStart.current,
      (signal) => setIncomingSignal(signal)
    );
    return unsub;
  }, [coupleId, uid]);

  // --- 6. Handle notification action-button taps (quick replies) --------
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const actionId = response.actionIdentifier;
        const data = response.notification.request.content.data || {};
        if (
          data.type === SIGNAL_TYPES.ALERT &&
          (actionId === ALERT_ACTIONS.COMING ||
            actionId === ALERT_ACTIONS.FIVE_MIN)
        ) {
          // Reply goes back to whoever sent the alert (data.from).
          const myName = myMember?.name || 'Your partner';
          try {
            await sendAlertReply(
              data.coupleId,
              uid,
              myName,
              data.from,
              actionId
            );
          } catch (e) {
            console.warn('Failed to send reply:', e);
          }
        }
      }
    );
    return () => sub.remove();
  }, [uid, myMember]);

  const value = {
    ready,
    uid,
    coupleId,
    myMember,
    partnerMember,
    partnerUid,
    incomingSignal,
    clearIncomingSignal: () => setIncomingSignal(null),
    onLinked,
    isLinked: !!coupleId,
    currentUser: auth.currentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
