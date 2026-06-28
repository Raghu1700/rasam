// Live status: write my status, subscribe to the partner's in real time.
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Update my own status.
export async function setMyStatus(coupleId, uid, statusKey) {
  await setDoc(
    doc(db, 'couples', coupleId, 'members', uid),
    { status: statusKey, statusUpdatedAt: serverTimestamp() },
    { merge: true }
  );
}

// Subscribe to a member doc (partner or self). Returns an unsubscribe fn.
export function subscribeToMember(coupleId, uid, callback) {
  return onSnapshot(
    doc(db, 'couples', coupleId, 'members', uid),
    (snap) => callback(snap.exists() ? { id: uid, ...snap.data() } : null),
    (err) => console.warn('member subscription error:', err)
  );
}
