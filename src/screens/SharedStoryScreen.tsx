import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme/theme';
import { ArrowLeft, Eraser, Save, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { sendSharedStory, StoryStroke, StorySticker } from '../services/storyService';
import {
  clearLiveCanvas,
  mergeCanvasLayers,
  subscribeToLiveCanvas,
  syncCanvasLayer,
} from '../services/liveCanvasService';

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = width - 40;
const CANVAS_HEIGHT = 400;

const STICKERS = ['❤️', '✨', '🌙', '🦋', '☕', '🌸', '🔥', '💫'];
const COLORS = ['#F5F5DC', '#ffd9e0', '#c5c5d8', '#D8A7B1', '#4ADE80'];

type Stroke = StoryStroke;
type PlacedSticker = StorySticker;

const StoryCanvas = ({
  strokes,
  stickers,
}: {
  strokes: Stroke[];
  stickers: PlacedSticker[];
}) => {
  const pathFromStroke = (stroke: Stroke) => {
    if (stroke.points.length === 0) return '';
    return stroke.points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ');
  };

  return (
    <View style={styles.canvas}>
      <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        {strokes.map((stroke, idx) => (
          <Path
            key={`stroke-${idx}`}
            d={pathFromStroke(stroke)}
            stroke={stroke.color}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
      {stickers.map((s) => (
        <Text key={s.id} style={[styles.stickerOnCanvas, { left: s.x - 14, top: s.y - 18 }]}>
          {s.emoji}
        </Text>
      ))}
    </View>
  );
};

export const SharedStoryScreen = () => {
  const navigation = useNavigation();
  const { partnerName, relationshipId, userName } = useAppContext();
  const { firebaseEnabled, user } = useAuth();
  const [myStrokes, setMyStrokes] = useState<Stroke[]>([]);
  const [myStickers, setMyStickers] = useState<PlacedSticker[]>([]);
  const [remoteLayers, setRemoteLayers] = useState<Record<string, { strokes: Stroke[]; stickers: PlacedSticker[]; displayName: string }>>({});
  const [brushColor, setBrushColor] = useState(COLORS[0]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const activeStroke = useRef<Stroke | null>(null);
  const isDrawing = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestMine = useRef({ strokes: myStrokes, stickers: myStickers });

  useEffect(() => {
    latestMine.current = { strokes: myStrokes, stickers: myStickers };
  }, [myStrokes, myStickers]);

  const pushLayerToCloud = useCallback(
    async (strokes: Stroke[], stickers: PlacedSticker[]) => {
      if (!firebaseEnabled || !user || !relationshipId) return;
      try {
        await syncCanvasLayer(relationshipId, user.uid, userName, { strokes, stickers });
      } catch {
        /* network blip */
      }
    },
    [firebaseEnabled, user, relationshipId, userName]
  );

  const scheduleSync = useCallback(
    (strokes: Stroke[], stickers: PlacedSticker[]) => {
      if (!firebaseEnabled || !user || !relationshipId) return;
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        pushLayerToCloud(strokes, stickers);
      }, 280);
    },
    [firebaseEnabled, user, relationshipId, pushLayerToCloud]
  );

  useEffect(() => {
    if (!firebaseEnabled || !relationshipId) return;

    return subscribeToLiveCanvas(relationshipId, (state) => {
      const nextRemote: typeof remoteLayers = {};
      for (const [uid, layer] of Object.entries(state.layers)) {
        if (uid === user?.uid) {
          if (!isDrawing.current) {
            setMyStrokes(layer.strokes);
            setMyStickers(layer.stickers);
          }
          continue;
        }
        nextRemote[uid] = layer;
      }
      setRemoteLayers(nextRemote);
    });
  }, [firebaseEnabled, relationshipId, user?.uid]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !selectedSticker,
      onMoveShouldSetPanResponder: () => !selectedSticker,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        isDrawing.current = true;
        activeStroke.current = { color: brushColor, points: [{ x: locationX, y: locationY }] };
        setMyStrokes((prev) => {
          const next = [...prev, activeStroke.current!];
          scheduleSync(next, latestMine.current.stickers);
          return next;
        });
      },
      onPanResponderMove: (evt) => {
        if (!activeStroke.current) return;
        const { locationX, locationY } = evt.nativeEvent;
        activeStroke.current.points.push({ x: locationX, y: locationY });
        setMyStrokes((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            color: activeStroke.current!.color,
            points: [...activeStroke.current!.points],
          };
          scheduleSync(next, latestMine.current.stickers);
          return next;
        });
      },
      onPanResponderRelease: () => {
        activeStroke.current = null;
        isDrawing.current = false;
        pushLayerToCloud(latestMine.current.strokes, latestMine.current.stickers);
      },
      onPanResponderTerminate: () => {
        activeStroke.current = null;
        isDrawing.current = false;
        pushLayerToCloud(latestMine.current.strokes, latestMine.current.stickers);
      },
    })
  ).current;

  const placeSticker = (evt: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (!selectedSticker) return;
    const { locationX, locationY } = evt.nativeEvent;
    setMyStickers((prev) => {
      const next = [
        ...prev,
        { id: `${user?.uid ?? 'local'}_${Date.now()}`, emoji: selectedSticker, x: locationX, y: locationY },
      ];
      pushLayerToCloud(latestMine.current.strokes, next);
      return next;
    });
    setSelectedSticker(null);
  };

  const partnerStrokes = useMemo(
    () => Object.values(remoteLayers).flatMap((layer) => layer.strokes),
    [remoteLayers]
  );
  const partnerStickers = useMemo(
    () => Object.values(remoteLayers).flatMap((layer) => layer.stickers),
    [remoteLayers]
  );
  const displayStrokes = useMemo(() => [...partnerStrokes, ...myStrokes], [partnerStrokes, myStrokes]);
  const displayStickers = useMemo(
    () => [...partnerStickers, ...myStickers],
    [partnerStickers, myStickers]
  );

  const activePartners = useMemo(
    () =>
      Object.values(remoteLayers)
        .filter((l) => l.strokes.length > 0 || l.stickers.length > 0)
        .map((l) => l.displayName),
    [remoteLayers]
  );

  const clearMyLayer = () => {
    setMyStrokes([]);
    setMyStickers([]);
    pushLayerToCloud([], []);
  };

  const clearTogether = async () => {
    if (!firebaseEnabled || !relationshipId) {
      clearMyLayer();
      return;
    }
    Alert.alert('Clear canvas?', 'This removes the drawing for both of you.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setClearing(true);
          try {
            await clearLiveCanvas(relationshipId);
            setMyStrokes([]);
            setMyStickers([]);
          } catch {
            Alert.alert('Could not clear', 'Check your connection.');
          } finally {
            setClearing(false);
          }
        },
      },
    ]);
  };

  const saveSnapshot = async () => {
    if (displayStrokes.length === 0 && displayStickers.length === 0) {
      Alert.alert('Draw something first', 'Add a stroke or sticker before saving.');
      return;
    }

    if (firebaseEnabled && user && relationshipId) {
      setSaving(true);
      try {
        const merged = mergeCanvasLayers(
          {
            ...remoteLayers,
            [user.uid]: { strokes: myStrokes, stickers: myStickers, displayName: userName },
          },
          user.uid
        );
        await sendSharedStory(relationshipId, user.uid, userName, {
          strokes: merged.strokes,
          stickers: merged.stickers,
        });
        Alert.alert('Saved', 'Snapshot saved to your story history.');
      } catch {
        Alert.alert('Save failed', 'Check Firestore rules and connection.');
      } finally {
        setSaving(false);
      }
      return;
    }

    Alert.alert('Offline mode', 'Sign in with Firebase to draw together and save.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Shared Story</Text>
          <Text style={styles.headerSubtitle}>
            {firebaseEnabled ? 'Draw together — updates live' : 'Local canvas only'}
          </Text>
        </View>
        <TouchableOpacity onPress={saveSnapshot} style={styles.iconBtn} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={theme.colors.primary} size="small" />
          ) : (
            <Save color={theme.colors.primary} size={22} />
          )}
        </TouchableOpacity>
      </View>

      {firebaseEnabled && activePartners.length > 0 && (
        <View style={styles.liveBadge}>
          <Users color={theme.colors.tertiary} size={14} />
          <Text style={styles.liveBadgeText}>
            {activePartners.join(' & ')} {activePartners.length === 1 ? 'is' : 'are'} drawing
          </Text>
        </View>
      )}

      <View
        {...panResponder.panHandlers}
        onStartShouldSetResponder={() => !!selectedSticker}
        onResponderRelease={selectedSticker ? placeSticker : undefined}
      >
        <StoryCanvas strokes={displayStrokes} stickers={displayStickers} />
      </View>

      <View style={styles.toolRow}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, brushColor === c && styles.colorDotActive]}
            onPress={() => {
              setBrushColor(c);
              setSelectedSticker(null);
            }}
          />
        ))}
        <TouchableOpacity style={styles.toolBtn} onPress={clearTogether} disabled={clearing}>
          <Eraser color={theme.colors.primary} size={20} />
        </TouchableOpacity>
      </View>

      <Text style={styles.toolLabel}>STICKERS — select, then tap canvas</Text>
      <View style={styles.stickerRow}>
        {STICKERS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[styles.stickerChip, selectedSticker === emoji && styles.stickerChipActive]}
            onPress={() => setSelectedSticker(emoji)}
          >
            <Text style={styles.stickerEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>
        You and {partnerName} share one canvas. Tap save to archive a snapshot.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 8,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 11,
    color: theme.colors.tertiary,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(236, 185, 196, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(236, 185, 196, 0.25)',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tertiary,
    letterSpacing: 0.3,
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: theme.roundness.xl,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
    marginBottom: 16,
  },
  stickerOnCanvas: {
    position: 'absolute',
    fontSize: 28,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: theme.colors.primary,
  },
  toolBtn: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  toolLabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  stickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stickerChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerChipActive: {
    borderColor: theme.colors.tertiary,
    backgroundColor: 'rgba(216, 167, 177, 0.2)',
  },
  stickerEmoji: {
    fontSize: 22,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
