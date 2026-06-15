import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { MemoryItem } from '../context/AppContext';
import { formatMemoryDate, memoryTitleFromNote } from '../utils/memoryFormat';
import { toDate } from '../utils/time';
import { compressImageForFirestore } from '../utils/compressImage';

const memoriesCollection = (relationshipId: string) =>
  collection(getFirebaseDb(), 'relationships', relationshipId, 'memories');

const docToMemoryItem = (id: string, data: Record<string, unknown>): MemoryItem => {
  const note = (data.note as string) ?? '';
  const type = (data.type as MemoryItem['type']) ?? 'note';
  return {
    id,
    type,
    title: (data.title as string) || memoryTitleFromNote(note),
    date: formatMemoryDate(data.createdAt),
    uri: data.imageUrl as string | undefined,
    note,
    location: data.location as string | undefined,
    authorName: data.displayName as string | undefined,
    authorId: data.userId as string | undefined,
  };
};

export const createMemory = async (
  relationshipId: string,
  userId: string,
  displayName: string,
  data: {
    note: string;
    location?: string;
    mood?: string;
    localImageUri?: string | null;
    type?: MemoryItem['type'];
    title?: string;
  }
): Promise<void> => {
  let imageUrl: string | undefined;

  if (data.localImageUri) {
    imageUrl = await compressImageForFirestore(data.localImageUri);
  }

  const type = data.type ?? (imageUrl ? 'image' : 'note');

  await addDoc(memoriesCollection(relationshipId), {
    userId,
    displayName,
    type,
    title: data.title ?? memoryTitleFromNote(data.note),
    note: data.note,
    location: data.location ?? '',
    mood: data.mood ?? '',
    imageUrl: imageUrl ?? null,
    isPrivate: true,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToVaultMemories = (
  relationshipId: string,
  userId: string,
  onUpdate: (memories: MemoryItem[]) => void
): (() => void) => {
  const q = query(memoriesCollection(relationshipId), where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs
      .map((d) => ({ id: d.id, data: d.data() }))
      .sort((a, b) => {
        const aTime = toDate(a.data.createdAt)?.getTime() ?? 0;
        const bTime = toDate(b.data.createdAt)?.getTime() ?? 0;
        return bTime - aTime;
      })
      .map(({ id, data }) => docToMemoryItem(id, data));
    onUpdate(items);
  });
};

/** @deprecated use subscribeToVaultMemories */
export const subscribeToMemories = (
  relationshipId: string,
  onUpdate: (memories: MemoryItem[]) => void
): (() => void) => {
  const q = query(memoriesCollection(relationshipId), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => docToMemoryItem(d.id, d.data()));
    onUpdate(items);
  });
};
