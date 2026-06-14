import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme/theme';
import { ArrowLeft, Eraser, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = width - 40;
const CANVAS_HEIGHT = 360;

const STICKERS = ['❤️', '✨', '🌙', '🦋', '☕', '🌸', '🔥', '💫'];
const COLORS = ['#F5F5DC', '#ffd9e0', '#c5c5d8', '#D8A7B1', '#4ADE80'];

type Stroke = { color: string; points: { x: number; y: number }[] };
type PlacedSticker = { id: string; emoji: string; x: number; y: number };

export const SharedStoryScreen = () => {
  const navigation = useNavigation();
  const { setSharedStoryPreview, partnerName } = useAppContext();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [brushColor, setBrushColor] = useState(COLORS[0]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const activeStroke = useRef<Stroke | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !selectedSticker,
      onMoveShouldSetPanResponder: () => !selectedSticker,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        activeStroke.current = { color: brushColor, points: [{ x: locationX, y: locationY }] };
        setStrokes((prev) => [...prev, activeStroke.current!]);
      },
      onPanResponderMove: (evt) => {
        if (!activeStroke.current) return;
        const { locationX, locationY } = evt.nativeEvent;
        activeStroke.current.points.push({ x: locationX, y: locationY });
        setStrokes((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            color: activeStroke.current!.color,
            points: [...activeStroke.current!.points],
          };
          return next;
        });
      },
      onPanResponderRelease: () => {
        activeStroke.current = null;
      },
    })
  ).current;

  const placeSticker = (evt: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (!selectedSticker) return;
    const { locationX, locationY } = evt.nativeEvent;
    setStickers((prev) => [
      ...prev,
      { id: String(Date.now()), emoji: selectedSticker, x: locationX, y: locationY },
    ]);
    setSelectedSticker(null);
  };

  const pathFromStroke = (stroke: Stroke) => {
    if (stroke.points.length === 0) return '';
    return stroke.points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ');
  };

  const sendToPartner = () => {
    setSharedStoryPreview({
      strokeCount: strokes.length,
      stickerCount: stickers.length,
      sentAt: new Date().toISOString(),
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shared Story</Text>
        <TouchableOpacity onPress={sendToPartner} style={styles.iconBtn}>
          <Send color={theme.colors.primary} size={22} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Draw, add stickers, and send — shows on {partnerName}'s widget preview on Home.
      </Text>

      <View
        style={styles.canvas}
        {...panResponder.panHandlers}
        onStartShouldSetResponder={() => !!selectedSticker}
        onResponderRelease={selectedSticker ? placeSticker : undefined}
      >
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
        <TouchableOpacity style={styles.toolBtn} onPress={() => { setStrokes([]); setStickers([]); }}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.containerPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 8,
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
  subtitle: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
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
    paddingBottom: 32,
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
});
