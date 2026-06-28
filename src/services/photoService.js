// Shared Photo of the Day — stored FREE inside Firestore (no paid Cloud
// Storage). The picked image is resized + compressed to a small JPEG and saved
// as a base64 data-URI on a dedicated doc, so it stays well under Firestore's
// 1 MB/document limit. "Resets" each day simply by keying on the date.
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import * as ImageManipulator from 'expo-image-manipulator';

import { db } from '../config/firebase';

// Single doc that holds the current photo. Kept in its own subcollection so
// the (frequently-read) couple doc stays small.
function photoRef(coupleId) {
  return doc(db, 'couples', coupleId, 'photoOfDay', 'current');
}

// Local-day key like "2026-06-28". Used to decide if today's photo exists.
export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Resize + compress a picked image to a small base64 JPEG. Targets ~900px wide
// at quality 0.5 — typically 80–250 KB, safely under the 1 MB doc limit.
async function compressToDataUri(localUri) {
  const result = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 900 } }],
    {
      compress: 0.5,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );
  return `data:image/jpeg;base64,${result.base64}`;
}

// Upload (store) a picked image as today's photo.
export async function uploadPhotoOfDay(coupleId, uid, localUri) {
  const dateKey = todayKey();
  const dataUri = await compressToDataUri(localUri);

  // Guard against the 1 MB Firestore document limit.
  if (dataUri.length > 950_000) {
    throw new Error('That photo is too large even after compression.');
  }

  await setDoc(photoRef(coupleId), {
    url: dataUri, // base64 data-URI — works directly as an <Image> source
    uploadedBy: uid,
    dateKey,
    uploadedAt: serverTimestamp(),
  });
  return dataUri;
}

// Subscribe to the photo doc and surface today's photo (or null if the stored
// one is from a previous day — i.e. the daily reset).
export function subscribeToPhotoOfDay(coupleId, callback) {
  return onSnapshot(
    photoRef(coupleId),
    (snap) => {
      const photo = snap.data();
      if (photo && photo.dateKey === todayKey()) {
        callback(photo);
      } else {
        callback(null); // no photo for today yet
      }
    },
    (err) => console.warn('photo subscription error:', err)
  );
}
