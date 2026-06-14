import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { LetterDoc } from '../types/firebase';
import { toDate } from '../utils/time';

const lettersCollection = (relationshipId: string) =>
  collection(getFirebaseDb(), 'relationships', relationshipId, 'letters');

export const sendLetterToPartner = async (
  relationshipId: string,
  userId: string,
  data: { fromName: string; tone: string; body: string }
): Promise<void> => {
  await addDoc(lettersCollection(relationshipId), {
    fromUserId: userId,
    fromName: data.fromName,
    tone: data.tone,
    body: data.body,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToPartnerLetters = (
  relationshipId: string,
  myUserId: string,
  onUpdate: (letters: LetterDoc[]) => void
): (() => void) => {
  const q = query(lettersCollection(relationshipId), orderBy('createdAt', 'desc'), limit(20));

  return onSnapshot(q, (snapshot) => {
    const letters = snapshot.docs
      .filter((d) => d.data().fromUserId !== myUserId)
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          fromUserId: data.fromUserId,
          fromName: data.fromName ?? 'Partner',
          tone: data.tone ?? '',
          body: data.body ?? '',
          createdAt: toDate(data.createdAt)?.toISOString(),
        };
      });
    onUpdate(letters);
  });
};
