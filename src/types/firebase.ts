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
  updatedAt: string;
};
