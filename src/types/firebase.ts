import { MoodId } from './mood';

export type UserProfile = {
  displayName: string;
  relationshipId: string | null;
  partnerDisplayName?: string;
  createdAt?: string;
};

export type Relationship = {
  inviteCode: string;
  anniversary: string;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
};

export type PresenceDoc = {
  mood: MoodId;
  dailyStatus: string;
  displayName: string;
  updatedAt?: unknown;
  latitude?: number;
  longitude?: number;
  locationUpdatedAt?: unknown;
};

export type SharedMomentDoc = {
  id: string;
  userId: string;
  displayName: string;
  imageUrl: string;
  storagePath: string;
  createdAt?: string;
};

export type LetterDoc = {
  id: string;
  fromUserId: string;
  fromName: string;
  tone: string;
  body: string;
  createdAt?: string;
};

export type MemoryDoc = {
  id: string;
  userId: string;
  displayName: string;
  type: 'image' | 'story' | 'note';
  title: string;
  note: string;
  location?: string;
  mood?: string;
  imageUrl?: string | null;
  createdAt?: string;
};

export type PlayMode = 'daily' | 'nhie' | 'wyr';

export type PlayResponse = {
  answer: string;
  vote: 'yes' | 'no' | null;
  choice: 'a' | 'b' | null;
  displayName: string;
  updatedAt?: string;
};

export type PlaySessionDoc = {
  mode: PlayMode;
  promptId: string;
  promptText: string;
  dateKey: string;
  responses: Record<string, PlayResponse>;
};

export type PlayMetaDoc = {
  nhiePromptId: string | null;
  wyrPromptId: string | null;
  updatedAt?: string;
};

export type ReminderDoc = {
  title: string;
  dueLabel: string;
  type: 'date' | 'gift' | 'milestone';
  createdBy: string;
  createdAt?: string;
};

export type SharedStoryDoc = {
  id: string;
  fromUserId: string;
  fromName: string;
  strokes: { color: string; points: { x: number; y: number }[] }[];
  stickers: { id: string; emoji: string; x: number; y: number }[];
  createdAt?: string;
};

export type MoodHistoryEntry = {
  id: string;
  userId: string;
  mood: MoodId;
  createdAt?: string;
};
