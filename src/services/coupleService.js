// Couple linking + the core data model.
//
// Firestore layout:
//   couples/{coupleId}
//     - code: "ABC123"        (the shareable link code)
//     - members: [uid, uid]
//     - createdAt
//     - photoOfDay: { url, uploadedBy, dateKey, uploadedAt }
//   couples/{coupleId}/members/{uid}
//     - name, status, statusUpdatedAt, pushToken
//   couples/{coupleId}/signals/{autoId}   (ephemeral alerts/heartbeats)
//     - type, from, createdAt, payload
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

import { auth, db } from '../config/firebase';

// Generate a friendly 6-char code (no ambiguous chars like O/0/I/1).
function generateCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Ensure we have an anonymous user; returns the uid.
export async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser.uid;
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}

// Create a new couple with a fresh, unique code. Returns { coupleId, code }.
export async function createCouple(name) {
  const uid = await ensureSignedIn();

  // Retry a few times in the (unlikely) event of a code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const existing = await getDocs(
      query(collection(db, 'couples'), where('code', '==', code), limit(1))
    );
    if (!existing.empty) continue;

    const coupleRef = doc(collection(db, 'couples'));
    await setDoc(coupleRef, {
      code,
      members: [uid],
      createdAt: serverTimestamp(),
      photoOfDay: null,
    });
    await setDoc(doc(db, 'couples', coupleRef.id, 'members', uid), {
      name: name || 'Me',
      status: 'free',
      statusUpdatedAt: serverTimestamp(),
      pushToken: null,
    });
    return { coupleId: coupleRef.id, code };
  }
  throw new Error('Could not generate a unique code. Please try again.');
}

// Join an existing couple by its code. Returns { coupleId, code }.
export async function joinCouple(code, name) {
  const uid = await ensureSignedIn();
  const normalized = (code || '').trim().toUpperCase();

  const snap = await getDocs(
    query(
      collection(db, 'couples'),
      where('code', '==', normalized),
      limit(1)
    )
  );
  if (snap.empty) {
    throw new Error('No couple found with that code. Double-check it.');
  }

  const coupleDoc = snap.docs[0];
  const data = coupleDoc.data();
  const members = data.members || [];

  if (!members.includes(uid) && members.length >= 2) {
    throw new Error('This couple is already full (2 people).');
  }

  await updateDoc(doc(db, 'couples', coupleDoc.id), {
    members: arrayUnion(uid),
  });
  await setDoc(
    doc(db, 'couples', coupleDoc.id, 'members', uid),
    {
      name: name || 'Me',
      status: 'free',
      statusUpdatedAt: serverTimestamp(),
      pushToken: null,
    },
    { merge: true }
  );
  return { coupleId: coupleDoc.id, code: normalized };
}

// Look up which couple (if any) this uid already belongs to. Used on launch
// so a returning user skips the setup screen.
export async function findCoupleForUser(uid) {
  const snap = await getDocs(
    query(
      collection(db, 'couples'),
      where('members', 'array-contains', uid),
      limit(1)
    )
  );
  if (snap.empty) return null;
  return { coupleId: snap.docs[0].id, ...snap.docs[0].data() };
}

// Subscribe to the couple doc itself. Used to learn — in real time — when the
// partner joins (members array grows) and when photoOfDay changes.
export function subscribeToCouple(coupleId, callback) {
  return onSnapshot(
    doc(db, 'couples', coupleId),
    (snap) => callback(snap.exists() ? { coupleId, ...snap.data() } : null),
    (err) => console.warn('couple subscription error:', err)
  );
}

// Save / refresh this member's push token so the partner can reach us.
export async function savePushToken(coupleId, uid, token) {
  if (!coupleId || !uid || !token) return;
  await setDoc(
    doc(db, 'couples', coupleId, 'members', uid),
    { pushToken: token },
    { merge: true }
  );
}

// Fetch a single member doc (used to grab the partner's push token).
export async function getMember(coupleId, uid) {
  const snap = await getDoc(doc(db, 'couples', coupleId, 'members', uid));
  return snap.exists() ? { id: uid, ...snap.data() } : null;
}

// Fetch the couple doc (e.g. to display the shareable code in Settings).
export async function getCouple(coupleId) {
  const snap = await getDoc(doc(db, 'couples', coupleId));
  return snap.exists() ? { coupleId, ...snap.data() } : null;
}

// Update my display name.
export async function setMyName(coupleId, uid, name) {
  await updateDoc(doc(db, 'couples', coupleId, 'members', uid), {
    name: name || 'Me',
  });
}
