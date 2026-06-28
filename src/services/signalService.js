// Ephemeral signals: alerts ("come online"), alert replies, and heartbeats.
// Each is a doc in couples/{id}/signals. The partner subscribes to recent
// signals addressed to them and reacts (animation / vibration / toast).
//
// Delivery has two paths that work together:
//   1. Firestore realtime — drives in-app reactions when the app is open.
//   2. Expo push — reaches the partner when the app is closed, and carries
//      the quick-reply action buttons for alerts.
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { getMember } from './coupleService';
import { sendPush } from './notificationService';
import {
  SIGNAL_TYPES,
  ALERT_CATEGORY,
  ALERT_ACTIONS,
} from '../config/constants';

// Write a signal to Firestore. `to` is the recipient uid.
async function writeSignal(coupleId, signal) {
  await addDoc(collection(db, 'couples', coupleId, 'signals'), {
    ...signal,
    createdAt: serverTimestamp(),
  });
}

// Send the "come online" alert to the partner.
export async function sendAlert(coupleId, fromUid, fromName, partnerUid) {
  await writeSignal(coupleId, {
    type: SIGNAL_TYPES.ALERT,
    from: fromUid,
    to: partnerUid,
  });

  const partner = await getMember(coupleId, partnerUid);
  await sendPush({
    to: partner?.pushToken,
    title: `${fromName || 'Your partner'} wants you online 💗`,
    body: 'Tap to reply',
    categoryId: ALERT_CATEGORY, // adds the quick-reply buttons
    channelId: 'default',
    data: {
      type: SIGNAL_TYPES.ALERT,
      coupleId,
      from: fromUid,
      fromName,
    },
  });
}

// Reply to an alert (from a notification action button or in-app).
export async function sendAlertReply(
  coupleId,
  fromUid,
  fromName,
  partnerUid,
  replyKey
) {
  const text =
    replyKey === ALERT_ACTIONS.COMING ? 'Coming! 🏃' : 'Give me 5 min ⏳';

  await writeSignal(coupleId, {
    type: SIGNAL_TYPES.ALERT_REPLY,
    from: fromUid,
    to: partnerUid,
    payload: { reply: replyKey, text },
  });

  const partner = await getMember(coupleId, partnerUid);
  await sendPush({
    to: partner?.pushToken,
    title: `${fromName || 'Your partner'} replied`,
    body: text,
    channelId: 'default',
    data: { type: SIGNAL_TYPES.ALERT_REPLY, coupleId },
  });
}

// Send a heartbeat — partner's phone vibrates + floating heart animation.
export async function sendHeartbeat(coupleId, fromUid, fromName, partnerUid) {
  await writeSignal(coupleId, {
    type: SIGNAL_TYPES.HEARTBEAT,
    from: fromUid,
    to: partnerUid,
  });

  const partner = await getMember(coupleId, partnerUid);
  await sendPush({
    to: partner?.pushToken,
    title: `${fromName || 'Your partner'} sent you a heartbeat 💓`,
    body: 'Thinking of you',
    channelId: 'heartbeat',
    data: { type: SIGNAL_TYPES.HEARTBEAT, coupleId },
  });
}

// Subscribe to signals addressed to me, created after `since`. We pass a
// start time so we only react to NEW signals, never replay old ones.
export function subscribeToSignals(coupleId, myUid, since, callback) {
  const q = query(
    collection(db, 'couples', coupleId, 'signals'),
    where('to', '==', myUid),
    where('createdAt', '>', Timestamp.fromMillis(since)),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(
    q,
    (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          callback({ id: change.doc.id, ...change.doc.data() });
        }
      });
    },
    (err) => console.warn('signal subscription error:', err)
  );
}
