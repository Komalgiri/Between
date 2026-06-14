import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseDb, getFirebaseStorage } from '../lib/firebase';
import { MemoryItem } from '../context/AppContext';
import { formatMemoryDate, memoryTitleFromNote } from '../utils/memoryFormat';
import { toDate } from '../utils/time';

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
    const response = await fetch(data.localImageUri);
    const blob = await response.blob();
    const memoryId = `${userId}_${Date.now()}`;
    const storagePath = `relationships/${relationshipId}/memories/${memoryId}.jpg`;
    const storageRef = ref(getFirebaseStorage(), storagePath);
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    imageUrl = await getDownloadURL(storageRef);
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
    createdAt: serverTimestamp(),
  });
};

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