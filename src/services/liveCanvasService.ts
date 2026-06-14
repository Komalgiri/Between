import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { StorySticker, StoryStroke } from './storyService';
import { toDate } from '../utils/time';

export const LIVE_CANVAS_DOC_ID = 'shared';

export type CanvasLayer = {
  strokes: StoryStroke[];
  stickers: StorySticker[];
  displayName: string;
};

export type LiveCanvasState = {
  layers: Record<string, CanvasLayer>;
  updatedAt?: string;
};

const canvasRef = (relationshipId: string) =>
  doc(getFirebaseDb(), 'relationships', relationshipId, 'liveCanvas', LIVE_CANVAS_DOC_ID);

export const subscribeToLiveCanvas = (
  relationshipId: string,
  onUpdate: (state: LiveCanvasState) => void
): (() => void) => {
  return onSnapshot(canvasRef(relationshipId), (snap) => {
    if (!snap.exists()) {
      onUpdate({ layers: {} });
      return;
    }
    const data = snap.data();
    const layers: Record<string, CanvasLayer> = {};
    const raw = data.layers ?? {};
    for (const [uid, layer] of Object.entries(raw)) {
      const l = layer as Record<string, unknown>;
      layers[uid] = {
        strokes: (l.strokes as StoryStroke[]) ?? [],
        stickers: (l.stickers as StorySticker[]) ?? [],
        displayName: (l.displayName as string) ?? 'Partner',
      };
    }
    onUpdate({
      layers,
      updatedAt: toDate(data.updatedAt)?.toISOString(),
    });
  });
};

export const syncCanvasLayer = async (
  relationshipId: string,
  userId: string,
  displayName: string,
  data: { strokes: StoryStroke[]; stickers: StorySticker[] }
): Promise<void> => {
  await setDoc(
    canvasRef(relationshipId),
    {
      layers: {
        [userId]: {
          strokes: data.strokes,
          stickers: data.stickers,
          displayName,
          updatedAt: serverTimestamp(),
        },
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const clearLiveCanvas = async (relationshipId: string): Promise<void> => {
  await setDoc(canvasRef(relationshipId), {
    layers: {},
    updatedAt: serverTimestamp(),
  });
};

export const mergeCanvasLayers = (
  layers: Record<string, CanvasLayer>,
  myUserId?: string
): { strokes: StoryStroke[]; stickers: StorySticker[]; partnerNames: string[] } => {
  const strokes: StoryStroke[] = [];
  const stickers: StorySticker[] = [];
  const partnerNames: string[] = [];

  for (const [uid, layer] of Object.entries(layers)) {
    strokes.push(...layer.strokes);
    stickers.push(...layer.stickers);
    if (uid !== myUserId && layer.strokes.length + layer.stickers.length > 0) {
      partnerNames.push(layer.displayName);
    }
  }

  return { strokes, stickers, partnerNames };
};
