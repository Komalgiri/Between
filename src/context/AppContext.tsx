import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { MoodId } from '../types/mood';
import { updatePresence, subscribeToPartnerPresence } from '../services/presenceService';

export type { MoodId };

export type MemoryItem = {
  id: string;
  type: 'image' | 'story' | 'note';
  title: string;
  date: string;
  uri?: string;
};

export type SharedStoryPreview = {
  strokeCount: number;
  stickerCount: number;
  sentAt: string;
};

type AppContextType = {
  userName: string;
  setUserName: (name: string) => void;
  partnerName: string;
  setPartnerName: (name: string) => void;
  anniversary: string;
  setAnniversary: (date: string) => void;
  relationshipId: string | null;
  cuteNotificationsEnabled: boolean;
  setCuteNotificationsEnabled: (enabled: boolean) => void;
  vaultItems: MemoryItem[];
  addVaultItem: (item: MemoryItem) => void;
  sharedMomentUri: string | null;
  setSharedMomentUri: (uri: string | null) => void;
  userMood: MoodId;
  setUserMood: (mood: MoodId) => void;
  partnerMood: MoodId;
  dailyStatus: string;
  setDailyStatus: (status: string) => void;
  distanceKm: number;
  sharedStoryPreview: SharedStoryPreview | null;
  setSharedStoryPreview: (preview: SharedStoryPreview | null) => void;
  syncPresenceToCloud: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const { firebaseEnabled, user, profile } = useAuth();

  const [userName, setUserName] = useState('You');
  const [partnerName, setPartnerName] = useState('Partner');
  const [anniversary, setAnniversary] = useState('');
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [cuteNotificationsEnabled, setCuteNotificationsEnabled] = useState(true);
  const [sharedMomentUri, setSharedMomentUri] = useState<string | null>(null);
  const [userMood, setUserMood] = useState<MoodId>('connected');
  const [partnerMood, setPartnerMood] = useState<MoodId>('restful');
  const [dailyStatus, setDailyStatus] = useState('Thinking of you ☁️');
  const [distanceKm] = useState(142);
  const [sharedStoryPreview, setSharedStoryPreview] = useState<SharedStoryPreview | null>(null);

  const [vaultItems, setVaultItems] = useState<MemoryItem[]>([
    {
      id: '1',
      type: 'image',
      title: 'Late Night Texts',
      date: 'Oct 14, 2023',
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGs-JZf-6e7hjaZjBMJYf-lKSXNnDA_9kl7fsg17OhGNS3O-HeqEpIh4WAKRJCLvP9dL6kxJ-Orej-VQysoWOH7EEYSKVJj8yD9febTr2pkp3IMtiNpR3dHvSckK6qtP-YOfEjHmSOO6uceAx3eGtm4xiZD27eop0gQgphpoIdk_BWlymAkoWfgKUYrCjFr87gFsHF_t8WGminUaVZab7oGQQXzVC4Tgg-bJ7qGpVxK-DtN2442jGfFuqCDyAyEb7y88g-euCN9g',
    },
    { id: '2', type: 'note', title: 'Vows Draft', date: 'Nov 02, 2023' },
  ]);

  useEffect(() => {
    if (!profile) return;
    if (profile.displayName) setUserName(profile.displayName);
    if (profile.partnerDisplayName) setPartnerName(profile.partnerDisplayName);
    setRelationshipId(profile.relationshipId);
  }, [profile]);

  const syncPresenceToCloud = useCallback(async () => {
    if (!firebaseEnabled || !user || !relationshipId) return;
    await updatePresence(relationshipId, user.uid, {
      mood: userMood,
      dailyStatus,
      displayName: userName,
    });
  }, [firebaseEnabled, user, relationshipId, userMood, dailyStatus, userName]);

  useEffect(() => {
    if (!firebaseEnabled || !user || !relationshipId) return;
    syncPresenceToCloud().catch(() => {});
  }, [userMood, dailyStatus, relationshipId, firebaseEnabled, user, syncPresenceToCloud]);

  useEffect(() => {
    if (!firebaseEnabled || !user || !relationshipId) return;

    return subscribeToPartnerPresence(relationshipId, user.uid, (presence) => {
      if (presence?.mood) setPartnerMood(presence.mood);
      if (presence?.displayName) setPartnerName(presence.displayName);
    });
  }, [firebaseEnabled, user, relationshipId]);

  const addVaultItem = (item: MemoryItem) => {
    setVaultItems((prev) => [item, ...prev]);
  };

  const handleSetUserMood = (mood: MoodId) => setUserMood(mood);
  const handleSetDailyStatus = (status: string) => setDailyStatus(status);

  return (
    <AppContext.Provider
      value={{
        userName,
        setUserName,
        partnerName,
        setPartnerName,
        anniversary,
        setAnniversary,
        relationshipId,
        cuteNotificationsEnabled,
        setCuteNotificationsEnabled,
        vaultItems,
        addVaultItem,
        sharedMomentUri,
        setSharedMomentUri,
        userMood,
        setUserMood: handleSetUserMood,
        partnerMood,
        dailyStatus,
        setDailyStatus: handleSetDailyStatus,
        distanceKm,
        sharedStoryPreview,
        setSharedStoryPreview,
        syncPresenceToCloud,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
