import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { MoodId } from '../types/mood';
import { MoodHistoryEntry } from '../types/firebase';
import { toDate } from '../utils/time';

const moodHistoryCollection = (relationshipId: string) =>
  collection(getFirebaseDb(), 'relationships', relationshipId, 'moodHistory');

export const logMoodEntry = async (
  relationshipId: string,
  userId: string,
  mood: MoodId
): Promise<void> => {
  await addDoc(moodHistoryCollection(relationshipId), {
    userId,
    mood,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToMoodHistory = (
  relationshipId: string,
  onUpdate: (entries: MoodHistoryEntry[]) => void
): (() => void) => {
  const q = query(moodHistoryCollection(relationshipId), orderBy('createdAt', 'desc'), limit(14));

  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId as string,
        mood: data.mood as MoodId,
        createdAt: toDate(data.createdAt)?.toISOString(),
      };
    });
    onUpdate(entries);
  });
};

/** Mood → bar height 0–1 for the arc chart */
export const moodBarHeight: Record<MoodId, number> = {
  serene: 0.45,
  connected: 0.85,
  pensive: 0.35,
  restful: 0.55,
};
