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
import { SharedMomentDoc } from '../types/firebase';
import { toDate } from '../utils/time';
import { compressImageForFirestore } from '../utils/compressImage';

const momentsCollection = (relationshipId: string) =>
  collection(getFirebaseDb(), 'relationships', relationshipId, 'moments');

const docToMoment = (id: string, data: Record<string, unknown>): SharedMomentDoc => ({
  id,
  userId: data.userId as string,
  displayName: (data.displayName as string) ?? 'Partner',
  imageUrl: data.imageUrl as string,
  storagePath: data.storagePath as string | undefined,
  caption: data.caption as string | undefined,
  createdAt: toDate(data.createdAt)?.toISOString(),
});

export const uploadSharedMoment = async (
  relationshipId: string,
  userId: string,
  displayName: string,
  localUri: string,
  caption?: string
): Promise<void> => {
  const imageUrl = await compressImageForFirestore(localUri);

  await addDoc(momentsCollection(relationshipId), {
    userId,
    displayName,
    imageUrl,
    caption: caption ?? '',
    createdAt: serverTimestamp(),
  });
};

export const subscribeToSharedMoments = (
  relationshipId: string,
  onUpdate: (moments: SharedMomentDoc[]) => void
): (() => void) => {
  const q = query(momentsCollection(relationshipId), orderBy('createdAt', 'desc'), limit(24));

  return onSnapshot(q, (snapshot) => {
    onUpdate(snapshot.docs.map((d) => docToMoment(d.id, d.data())));
  });
};

/** @deprecated use subscribeToSharedMoments */
export const subscribeToPartnerMoment = (
  relationshipId: string,
  myUserId: string,
  onUpdate: (moment: SharedMomentDoc | null) => void
): (() => void) =>
  subscribeToSharedMoments(relationshipId, (moments) => {
    const partner = moments.find((m) => m.userId !== myUserId) ?? null;
    onUpdate(partner);
  });
