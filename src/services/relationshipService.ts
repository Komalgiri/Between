import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { Relationship } from '../types/firebase';
import { updateUserProfile } from './authService';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const normalizeInviteCode = (raw: string): string =>
  raw.replace(/\s|-/g, '').toUpperCase();

export const formatInviteCode = (code: string): string => {
  const c = normalizeInviteCode(code);
  if (c.length <= 4) return c;
  return `${c.slice(0, 4)}-${c.slice(4)}`;
};

const generateInviteCode = (): string => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
};

export const createRelationship = async (
  userId: string,
  options: {
    displayName: string;
    partnerDisplayName: string;
    anniversary: string;
  }
): Promise<{ relationshipId: string; inviteCode: string }> => {
  const db = getFirebaseDb();
  const relationshipRef = doc(collection(db, 'relationships'));
  const inviteCode = generateInviteCode();

  const relationship: Relationship = {
    inviteCode,
    anniversary: options.anniversary,
    memberIds: [userId],
    createdBy: userId,
    createdAt: new Date().toISOString(),
    creatorDisplayName: options.displayName,
    memberDisplayNames: { [userId]: options.displayName },
  };

  await setDoc(relationshipRef, relationship);
  await setDoc(doc(db, 'invites', inviteCode), {
    relationshipId: relationshipRef.id,
    createdAt: serverTimestamp(),
  });

  await updateUserProfile(userId, {
    displayName: options.displayName,
    relationshipId: relationshipRef.id,
    partnerDisplayName: options.partnerDisplayName,
  });

  return { relationshipId: relationshipRef.id, inviteCode };
};

export const joinRelationship = async (
  userId: string,
  rawCode: string,
  displayName: string
): Promise<{ relationshipId: string; partnerDisplayName?: string }> => {
  const code = normalizeInviteCode(rawCode);
  const db = getFirebaseDb();
  const inviteSnap = await getDoc(doc(db, 'invites', code));

  if (!inviteSnap.exists()) {
    throw new Error('Invalid invite code. Check the code and try again.');
  }

  const { relationshipId } = inviteSnap.data() as { relationshipId: string };
  const relationshipRef = doc(db, 'relationships', relationshipId);
  const relationshipSnap = await getDoc(relationshipRef);

  if (!relationshipSnap.exists()) {
    throw new Error('This invite is no longer valid.');
  }

  const data = relationshipSnap.data() as Relationship;
  if (data.memberIds.length >= 2 && !data.memberIds.includes(userId)) {
    throw new Error('This sanctuary already has two members.');
  }

  if (!data.memberIds.includes(userId)) {
    await updateDoc(relationshipRef, {
      memberIds: arrayUnion(userId),
      [`memberDisplayNames.${userId}`]: displayName,
    });
  }

  const creatorName =
    data.creatorDisplayName ?? data.memberDisplayNames?.[data.createdBy] ?? 'Partner';

  await updateUserProfile(userId, {
    displayName,
    relationshipId,
    partnerDisplayName: creatorName,
  });

  return { relationshipId, partnerDisplayName: creatorName };
};

export const fetchRelationship = async (
  relationshipId: string
): Promise<Relationship | null> => {
  const snap = await getDoc(doc(getFirebaseDb(), 'relationships', relationshipId));
  if (!snap.exists()) return null;
  return snap.data() as Relationship;
};

export const unlinkPartner = async (
  userId: string,
  relationshipId: string
): Promise<void> => {
  const relationshipRef = doc(getFirebaseDb(), 'relationships', relationshipId);
  const snap = await getDoc(relationshipRef);
  if (!snap.exists()) {
    await updateUserProfile(userId, { relationshipId: null, partnerDisplayName: '' });
    return;
  }

  const data = snap.data() as Relationship;
  const partnerId = data.memberIds.find((id) => id !== userId);

  await updateDoc(relationshipRef, { memberIds: arrayRemove(userId) });
  await updateUserProfile(userId, { relationshipId: null, partnerDisplayName: '' });

  if (partnerId) {
    await updateUserProfile(partnerId, { partnerDisplayName: '' });
  }
};
