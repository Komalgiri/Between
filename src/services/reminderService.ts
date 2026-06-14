import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { ReminderDoc } from '../types/firebase';
import { toDate } from '../utils/time';

export type ReminderItem = ReminderDoc & { id: string };

const remindersCollection = (relationshipId: string) =>
  collection(getFirebaseDb(), 'relationships', relationshipId, 'reminders');

export const addReminder = async (
  relationshipId: string,
  userId: string,
  data: { title: string; dueLabel: string; type: ReminderDoc['type'] }
): Promise<void> => {
  await addDoc(remindersCollection(relationshipId), {
    title: data.title,
    dueLabel: data.dueLabel,
    type: data.type,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToReminders = (
  relationshipId: string,
  onUpdate: (reminders: ReminderItem[]) => void
): (() => void) => {
  const q = query(remindersCollection(relationshipId), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title ?? '',
        dueLabel: data.dueLabel ?? '',
        type: data.type ?? 'milestone',
        createdBy: data.createdBy ?? '',
        createdAt: toDate(data.createdAt)?.toISOString(),
      };
    });
    onUpdate(items);
  });
};
