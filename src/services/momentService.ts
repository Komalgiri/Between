import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseDb, getFirebaseStorage } from '../lib/firebase';
import { SharedMomentDoc } from '../types/firebase';
import { toDate } from '../utils/time';

const momentsCollection = (relationshipId: string) =>
  collection(getFirebaseDb(), 'relationships', relationshipId, 'moments');

export const uploadSharedMoment = async (
  relationshipId: string,
  userId: string,
  displayName: string,
  localUri: string
): Promise<void> => {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const momentId = `${userId}_${Date.now()}`;
  const storagePath = `relationships/${relationshipId}/moments/${momentId}.jpg`;
  const storageRef = ref(getFirebaseStorage(), storagePath);

  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  const imageUrl = await getDownloadURL(storageRef);

  await addDoc(momentsCollection(relationshipId), {
    userId,
    displayName,
    imageUrl,
    storagePath,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToPartnerMoment = (
  relationshipId: string,
  myUserId: string,
  onUpdate: (moment: SharedMomentDoc | null) => void
): (() => void) => {
  const q = query(momentsCollection(relationshipId), orderBy('createdAt', 'desc'), limit(10));

  return onSnapshot(q, (snapshot) => {
    const partnerDoc = snapshot.docs.find((d) => d.data().userId !== myUserId);
    if (!partnerDoc) {
      onUpdate(null);
      return;
    }

    const data = partnerDoc.data();
    onUpdate({
      id: partnerDoc.id,
      userId: data.userId,
      displayName: data.displayName ?? 'Partner',
      imageUrl: data.imageUrl,
      storagePath: data.storagePath,
      createdAt: toDate(data.createdAt)?.toISOString(),
    });
  });
};
