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
import { SharedStoryDoc } from '../types/firebase';
import { toDate } from '../utils/time';

export type StoryStroke = { color: string; points: { x: number; y: number }[] };
export type StorySticker = { id: string; emoji: string; x: number; y: number };

const storiesCollection = (relationshipId: string) =>
  collection(getFirebaseDb(), 'relationships', relationshipId, 'stories');

export const sendSharedStory = async (
  relationshipId: string,
  userId: string,
  fromName: string,
  data: { strokes: StoryStroke[]; stickers: StorySticker[] }
): Promise<void> => {
  await addDoc(storiesCollection(relationshipId), {
    fromUserId: userId,
    fromName,
    strokes: data.strokes,
    stickers: data.stickers,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToPartnerStory = (
  relationshipId: string,
  myUserId: string,
  onUpdate: (story: SharedStoryDoc | null) => void
): (() => void) => {
  const q = query(storiesCollection(relationshipId), orderBy('createdAt', 'desc'), limit(10));

  return onSnapshot(q, (snapshot) => {
    const partnerDoc = snapshot.docs.find((d) => d.data().fromUserId !== myUserId);
    if (!partnerDoc) {
      onUpdate(null);
      return;
    }
    const data = partnerDoc.data();
    onUpdate({
      id: partnerDoc.id,
      fromUserId: data.fromUserId,
      fromName: data.fromName ?? 'Partner',
      strokes: data.strokes ?? [],
      stickers: data.stickers ?? [],
      createdAt: toDate(data.createdAt)?.toISOString(),
    });
  });
};
