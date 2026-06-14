import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { MoodId } from '../types/mood';
import { PresenceDoc } from '../types/firebase';
import { Coordinates } from '../utils/distance';

const presenceDoc = (relationshipId: string, userId: string) =>
  doc(getFirebaseDb(), 'relationships', relationshipId, 'presence', userId);

export const updatePresence = async (
  relationshipId: string,
  userId: string,
  data: { mood: MoodId; dailyStatus: string; displayName: string }
): Promise<void> => {
  await setDoc(
    presenceDoc(relationshipId, userId),
    {
      mood: data.mood,
      dailyStatus: data.dailyStatus,
      displayName: data.displayName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const updatePresenceLocation = async (
  relationshipId: string,
  userId: string,
  coords: Coordinates
): Promise<void> => {
  await setDoc(
    presenceDoc(relationshipId, userId),
    {
      latitude: coords.latitude,
      longitude: coords.longitude,
      locationUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const subscribeToPartnerPresence = (
  relationshipId: string,
  myUserId: string,
  onUpdate: (presence: PresenceDoc | null) => void
): (() => void) => {
  const presenceCol = collection(
    getFirebaseDb(),
    'relationships',
    relationshipId,
    'presence'
  );

  return onSnapshot(query(presenceCol), (snapshot) => {
    const partnerDoc = snapshot.docs.find((d) => d.id !== myUserId);
    if (!partnerDoc) {
      onUpdate(null);
      return;
    }
    onUpdate(partnerDoc.data() as PresenceDoc);
  });
};
