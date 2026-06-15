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
import { updatePresence, subscribeToPartnerPresence, updatePresenceLocation } from '../services/presenceService';
import { uploadSharedMoment, subscribeToSharedMoments } from '../services/momentService';
import { createMemory as saveMemory, subscribeToVaultMemories } from '../services/memoryService';
import { fetchRelationship } from '../services/relationshipService';
import { startLocationWatch, coordsFromPresence, requestLocationPermission, getCurrentCoords } from '../services/locationService';
import { formatMemoryDate, memoryTitleFromNote } from '../utils/memoryFormat';
import { haversineKm, formatDistance, Coordinates } from '../utils/distance';
import { subscribeToPartnerStory } from '../services/storyService';
import { logMoodEntry, subscribeToMoodHistory } from '../services/moodHistoryService';
import { subscribeToLiveCanvas, mergeCanvasLayers, LiveCanvasState } from '../services/liveCanvasService';
import { SharedStoryDoc, MoodHistoryEntry, SharedMomentDoc } from '../types/firebase';
import { toDate } from '../utils/time';

export type { MoodId };

export type MemoryItem = {
  id: string;
  type: 'image' | 'story' | 'note';
  title: string;
  date: string;
  uri?: string;
  note?: string;
  location?: string;
  authorName?: string;
  authorId?: string;
};

export type SharedStoryPreview = {
  strokeCount: number;
  stickerCount: number;
  sentAt: string;
  isLive?: boolean;
};

type CreateMemoryInput = {
  note: string;
  location?: string;
  mood?: string;
  localImageUri?: string | null;
  type?: MemoryItem['type'];
  title?: string;
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
  vaultMemories: MemoryItem[];
  createMemory: (data: CreateMemoryInput) => Promise<void>;
  /** @deprecated use vaultMemories */
  memories: MemoryItem[];
  /** @deprecated use createMemory */
  vaultItems: MemoryItem[];
  addVaultItem: (item: MemoryItem) => void;
  sharedMoments: SharedMomentDoc[];
  shareMoment: (localUri: string, caption?: string) => Promise<void>;
  userMood: MoodId;
  setUserMood: (mood: MoodId) => void;
  partnerMood: MoodId;
  dailyStatus: string;
  setDailyStatus: (status: string) => void;
  partnerDailyStatus: string;
  partnerPresenceUpdatedAt: Date | null;
  distanceKm: number | null;
  distanceLabel: string;
  distanceLive: boolean;
  locationSharingEnabled: boolean;
  partnerLocationUpdatedAt: Date | null;
  refreshLocation: () => Promise<boolean>;
  partnerStory: SharedStoryDoc | null;
  sharedStoryPreview: SharedStoryPreview | null;
  moodHistory: MoodHistoryEntry[];
  biometricUnlockEnabled: boolean;
  setBiometricUnlockEnabled: (enabled: boolean) => void;
  reportLocalStoryPreview: (preview: SharedStoryPreview) => void;
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
  const [sharedMoments, setSharedMoments] = useState<SharedMomentDoc[]>([]);
  const [userMood, setUserMood] = useState<MoodId>('connected');
  const [partnerMood, setPartnerMood] = useState<MoodId>('restful');
  const [dailyStatus, setDailyStatus] = useState('Thinking of you ☁️');
  const [partnerDailyStatus, setPartnerDailyStatus] = useState('');
  const [partnerPresenceUpdatedAt, setPartnerPresenceUpdatedAt] = useState<Date | null>(null);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [partnerCoords, setPartnerCoords] = useState<Coordinates | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false);
  const [partnerLocationUpdatedAt, setPartnerLocationUpdatedAt] = useState<Date | null>(null);
  const [partnerStory, setPartnerStory] = useState<SharedStoryDoc | null>(null);
  const [liveCanvas, setLiveCanvas] = useState<LiveCanvasState>({ layers: {} });
  const [localStoryPreview, setLocalStoryPreview] = useState<SharedStoryPreview | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodHistoryEntry[]>([]);
  const [biometricUnlockEnabled, setBiometricUnlockEnabled] = useState(true);
  const [vaultMemories, setVaultMemories] = useState<MemoryItem[]>([]);

  useEffect(() => {
    if (!profile) return;
    if (profile.displayName) setUserName(profile.displayName);
    if (profile.partnerDisplayName) setPartnerName(profile.partnerDisplayName);
    setRelationshipId(profile.relationshipId);
  }, [profile]);

  useEffect(() => {
    if (!firebaseEnabled || !relationshipId) return;
    fetchRelationship(relationshipId)
      .then((rel) => {
        if (rel?.anniversary) setAnniversary(rel.anniversary);
      })
      .catch(() => {});
  }, [firebaseEnabled, relationshipId]);

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
      if (presence?.dailyStatus) setPartnerDailyStatus(presence.dailyStatus);
      setPartnerPresenceUpdatedAt(toDate(presence?.updatedAt));
      setPartnerCoords(coordsFromPresence(presence?.latitude, presence?.longitude));
      setPartnerLocationUpdatedAt(toDate(presence?.locationUpdatedAt));
    });
  }, [firebaseEnabled, user, relationshipId]);

  useEffect(() => {
    if (!userCoords || !partnerCoords) {
      setDistanceKm(null);
      return;
    }
    setDistanceKm(haversineKm(userCoords, partnerCoords));
  }, [userCoords, partnerCoords]);

  const refreshLocation = useCallback(async (): Promise<boolean> => {
    if (!firebaseEnabled || !user || !relationshipId) return false;

    const granted = await requestLocationPermission();
    if (!granted) return false;

    const coords = await getCurrentCoords();
    if (!coords) return false;

    setUserCoords(coords);
    setLocationSharingEnabled(true);
    try {
      await updatePresenceLocation(relationshipId, user.uid, coords);
      return true;
    } catch {
      return false;
    }
  }, [firebaseEnabled, user, relationshipId]);

  useEffect(() => {
    if (!firebaseEnabled || !user || !relationshipId) {
      setLocationSharingEnabled(false);
      return;
    }

    let subscription: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const sub = await startLocationWatch(async (coords) => {
        if (cancelled) return;
        setUserCoords(coords);
        setLocationSharingEnabled(true);
        try {
          await updatePresenceLocation(relationshipId, user.uid, coords);
        } catch {
          /* network blip */
        }
      });
      if (cancelled) {
        sub?.remove();
        return;
      }
      if (sub) {
        subscription = sub;
        setLocationSharingEnabled(true);
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [firebaseEnabled, user, relationshipId]);

  useEffect(() => {
    if (!firebaseEnabled || !relationshipId) {
      if (!firebaseEnabled) setSharedMoments([]);
      return;
    }

    return subscribeToSharedMoments(relationshipId, setSharedMoments);
  }, [firebaseEnabled, relationshipId]);

  useEffect(() => {
    if (!firebaseEnabled || !relationshipId || !user) {
      if (!firebaseEnabled) setVaultMemories([]);
      return;
    }
    return subscribeToVaultMemories(relationshipId, user.uid, setVaultMemories);
  }, [firebaseEnabled, relationshipId, user]);

  useEffect(() => {
    if (!firebaseEnabled || !user || !relationshipId) return;
    return subscribeToPartnerStory(relationshipId, user.uid, setPartnerStory);
  }, [firebaseEnabled, user, relationshipId]);

  useEffect(() => {
    if (!firebaseEnabled || !relationshipId) return;
    return subscribeToLiveCanvas(relationshipId, setLiveCanvas);
  }, [firebaseEnabled, relationshipId]);

  useEffect(() => {
    if (!firebaseEnabled || !relationshipId) return;
    return subscribeToMoodHistory(relationshipId, setMoodHistory);
  }, [firebaseEnabled, relationshipId]);

  const shareMoment = useCallback(
    async (localUri: string, caption?: string) => {
      if (firebaseEnabled && user && relationshipId) {
        await uploadSharedMoment(relationshipId, user.uid, userName, localUri, caption);
        return;
      }
      const localMoment: SharedMomentDoc = {
        id: `local_${Date.now()}`,
        userId: user?.uid ?? 'local',
        displayName: userName,
        imageUrl: localUri,
        caption,
        createdAt: new Date().toISOString(),
      };
      setSharedMoments((prev) => [localMoment, ...prev]);
    },
    [firebaseEnabled, user, relationshipId, userName]
  );

  const createMemory = useCallback(
    async (data: CreateMemoryInput) => {
      if (firebaseEnabled && user && relationshipId) {
        await saveMemory(relationshipId, user.uid, userName, data);
        return;
      }
      const item: MemoryItem = {
        id: `${Date.now()}`,
        type: data.type ?? (data.localImageUri ? 'image' : 'note'),
        title: data.title ?? memoryTitleFromNote(data.note),
        date: formatMemoryDate(new Date()),
        uri: data.localImageUri ?? undefined,
        note: data.note,
        location: data.location,
        authorName: userName,
      };
      setVaultMemories((prev) => [item, ...prev]);
    },
    [firebaseEnabled, user, relationshipId, userName]
  );

  const addVaultItem = (item: MemoryItem) => {
    setVaultMemories((prev) => [item, ...prev]);
  };

  const handleSetUserMood = (mood: MoodId) => {
    setUserMood(mood);
    if (firebaseEnabled && user && relationshipId) {
      logMoodEntry(relationshipId, user.uid, mood).catch(() => {});
    }
  };
  const handleSetDailyStatus = (status: string) => setDailyStatus(status);

  const distanceLabel = formatDistance(distanceKm);
  const distanceLive = locationSharingEnabled && partnerCoords !== null && distanceKm !== null;

  const liveCanvasPreview: SharedStoryPreview | null = (() => {
    const merged = mergeCanvasLayers(liveCanvas.layers, user?.uid);
    if (merged.strokes.length === 0 && merged.stickers.length === 0) return null;
    return {
      strokeCount: merged.strokes.length,
      stickerCount: merged.stickers.length,
      sentAt: liveCanvas.updatedAt ?? new Date().toISOString(),
      isLive: true,
    };
  })();

  const sharedStoryPreview: SharedStoryPreview | null =
    liveCanvasPreview ??
    (partnerStory
      ? {
          strokeCount: partnerStory.strokes.length,
          stickerCount: partnerStory.stickers.length,
          sentAt: partnerStory.createdAt ?? new Date().toISOString(),
        }
      : localStoryPreview);

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
        vaultMemories,
        memories: vaultMemories,
        createMemory,
        vaultItems: vaultMemories,
        addVaultItem,
        sharedMoments,
        shareMoment,
        userMood,
        setUserMood: handleSetUserMood,
        partnerMood,
        dailyStatus,
        setDailyStatus: handleSetDailyStatus,
        partnerDailyStatus,
        partnerPresenceUpdatedAt,
        distanceKm,
        distanceLabel,
        distanceLive,
        locationSharingEnabled,
        partnerLocationUpdatedAt,
        refreshLocation,
        partnerStory,
        sharedStoryPreview,
        moodHistory,
        biometricUnlockEnabled,
        setBiometricUnlockEnabled,
        reportLocalStoryPreview: setLocalStoryPreview,
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
