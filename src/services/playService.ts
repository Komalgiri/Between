import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { PlayMode, PlaySessionDoc, PlayMetaDoc } from '../types/firebase';
import { dateKeyToday } from '../utils/anniversary';
import { toDate } from '../utils/time';

export type PlaySession = {
  mode: PlayMode;
  promptId: string;
  promptText: string;
  dateKey: string;
  responses: PlaySessionDoc['responses'];
};

export const buildPlayDocId = (mode: PlayMode, promptId: string, dateKey: string): string =>
  `${mode}_${dateKey}_${promptId}`;

export const PLAY_META_DOC_ID = '_meta';

const playDocRef = (relationshipId: string, docId: string) =>
  doc(getFirebaseDb(), 'relationships', relationshipId, 'play', docId);

export const submitPlayResponse = async (
  relationshipId: string,
  userId: string,
  displayName: string,
  session: { mode: PlayMode; promptId: string; promptText: string; dateKey?: string },
  data: { answer?: string; vote?: 'yes' | 'no'; choice?: 'a' | 'b' }
): Promise<void> => {
  const dateKey = session.dateKey ?? dateKeyToday();
  const docId = buildPlayDocId(session.mode, session.promptId, dateKey);
  const ref = playDocRef(relationshipId, docId);

  await setDoc(
    ref,
    {
      mode: session.mode,
      promptId: session.promptId,
      promptText: session.promptText,
      dateKey,
    },
    { merge: true }
  );

  await updateDoc(ref, {
    [`responses.${userId}`]: {
      answer: data.answer ?? '',
      vote: data.vote ?? null,
      choice: data.choice ?? null,
      displayName,
      updatedAt: serverTimestamp(),
    },
  });
};

export const subscribeToPlaySession = (
  relationshipId: string,
  docId: string,
  onUpdate: (session: PlaySession | null) => void
): (() => void) => {
  return onSnapshot(playDocRef(relationshipId, docId), (snap) => {
    if (!snap.exists()) {
      onUpdate(null);
      return;
    }
    const data = snap.data();
    const responses: PlaySessionDoc['responses'] = {};
    const raw = data.responses ?? {};
    for (const [uid, val] of Object.entries(raw)) {
      const v = val as Record<string, unknown>;
      responses[uid] = {
        answer: (v.answer as string) ?? '',
        vote: (v.vote as 'yes' | 'no' | null) ?? null,
        choice: (v.choice as 'a' | 'b' | null) ?? null,
        displayName: (v.displayName as string) ?? 'Partner',
        updatedAt: toDate(v.updatedAt)?.toISOString(),
      };
    }
    onUpdate({
      mode: data.mode as PlayMode,
      promptId: data.promptId as string,
      promptText: data.promptText as string,
      dateKey: data.dateKey as string,
      responses,
    });
  });
};

export const getPartnerResponse = (
  session: PlaySession | null,
  myUserId: string
): PlaySessionDoc['responses'][string] | null => {
  if (!session) return null;
  const entry = Object.entries(session.responses).find(([uid]) => uid !== myUserId);
  return entry ? entry[1] : null;
};

const playMetaRef = (relationshipId: string) =>
  doc(getFirebaseDb(), 'relationships', relationshipId, 'play', PLAY_META_DOC_ID);

export const subscribeToPlayMeta = (
  relationshipId: string,
  onUpdate: (meta: PlayMetaDoc) => void
): (() => void) => {
  return onSnapshot(playMetaRef(relationshipId), (snap) => {
    if (!snap.exists()) {
      onUpdate({ nhiePromptId: null, wyrPromptId: null });
      return;
    }
    const data = snap.data();
    onUpdate({
      nhiePromptId: (data.nhiePromptId as string) ?? null,
      wyrPromptId: (data.wyrPromptId as string) ?? null,
      updatedAt: toDate(data.updatedAt)?.toISOString(),
    });
  });
};

export const updatePlayMetaPrompt = async (
  relationshipId: string,
  mode: 'nhie' | 'wyr',
  promptId: string
): Promise<void> => {
  const field = mode === 'nhie' ? 'nhiePromptId' : 'wyrPromptId';
  await setDoc(
    playMetaRef(relationshipId),
    {
      [field]: promptId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
