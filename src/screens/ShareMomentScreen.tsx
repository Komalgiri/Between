import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  PanResponder,
  Dimensions,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Send,
  Pencil,
  Type,
  Smile,
  Undo2,
  Eraser,
} from 'lucide-react-native';
import { theme } from '../theme/theme';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MomentStroke, MomentSticker, MomentTextLabel } from '../types/momentEditor';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 40;

const COLORS = ['#F5F5DC', '#ffd9e0', '#c5c5d8', '#D8A7B1', '#4ADE80', '#ffffff'];
const STICKERS = ['❤️', '✨', '🌙', '🦋', '☕', '🌸', '🔥', '💫', '😊', '🥰'];
const QUICK_TEXT = ['miss you', 'thinking of you', 'xoxo', 'good night', 'hey you'];

type Tool = 'draw' | 'text' | 'sticker';

type Route = RouteProp<RootStackParamList, 'ShareMoment'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const strokeToPath = (stroke: MomentStroke) => {
  if (stroke.points.length === 0) return '';
  return stroke.points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
};

export const ShareMomentScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { imageUri } = route.params;
  const { shareMoment, partnerName } = useAppContext();
  const { firebaseEnabled } = useAuth();

  const shotRef = useRef<ViewShot>(null);
  const activeStroke = useRef<MomentStroke | null>(null);

  const [tool, setTool] = useState<Tool>('draw');
  const [brushColor, setBrushColor] = useState(COLORS[0]);
  const [strokes, setStrokes] = useState<MomentStroke[]>([]);
  const [stickers, setStickers] = useState<MomentSticker[]>([]);
  const [textLabels, setTextLabels] = useState<MomentTextLabel[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textDraft, setTextDraft] = useState('');
  const [pendingTextPos, setPendingTextPos] = useState({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 });

  const toolRef = useRef(tool);
  const selectedStickerRef = useRef(selectedSticker);
  const brushColorRef = useRef(brushColor);

  toolRef.current = tool;
  selectedStickerRef.current = selectedSticker;
  brushColorRef.current = brushColor;

  const undo = () => {
    if (textLabels.length > 0) {
      setTextLabels((prev) => prev.slice(0, -1));
      return;
    }
    if (stickers.length > 0) {
      setStickers((prev) => prev.slice(0, -1));
      return;
    }
    if (strokes.length > 0) {
      setStrokes((prev) => prev.slice(0, -1));
    }
  };

  const clearAll = () => {
    setStrokes([]);
    setStickers([]);
    setTextLabels([]);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => toolRef.current === 'draw',
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const currentTool = toolRef.current;

        if (currentTool === 'sticker' && selectedStickerRef.current) {
          setStickers((prev) => [
            ...prev,
            {
              id: `s_${Date.now()}`,
              emoji: selectedStickerRef.current!,
              x: locationX,
              y: locationY,
            },
          ]);
          setSelectedSticker(null);
          return;
        }

        if (currentTool === 'text') {
          setPendingTextPos({ x: locationX, y: locationY });
          setTextDraft('');
          setTextModalVisible(true);
          return;
        }

        activeStroke.current = { color: brushColorRef.current, points: [{ x: locationX, y: locationY }] };
        setStrokes((prev) => [...prev, activeStroke.current!]);
      },
      onPanResponderMove: (evt) => {
        if (toolRef.current !== 'draw' || !activeStroke.current) return;
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
      onPanResponderTerminate: () => {
        activeStroke.current = null;
      },
    })
  ).current;

  const confirmTextLabel = () => {
    const trimmed = textDraft.trim();
    if (!trimmed) {
      setTextModalVisible(false);
      return;
    }
    setTextLabels((prev) => [
      ...prev,
      {
        id: `t_${Date.now()}`,
        text: trimmed,
        x: pendingTextPos.x,
        y: pendingTextPos.y,
        color: brushColor,
      },
    ]);
    setTextModalVisible(false);
    setTextDraft('');
  };

  const addQuickText = (phrase: string) => {
    setTextLabels((prev) => [
      ...prev,
      {
        id: `t_${Date.now()}`,
        text: phrase,
        x: CANVAS_SIZE / 2 - 40 + Math.random() * 30,
        y: CANVAS_SIZE / 2 - 20 + Math.random() * 30,
        color: brushColor,
      },
    ]);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const capturedUri = await shotRef.current?.capture?.();
      if (!capturedUri) throw new Error('Could not export moment');

      await shareMoment(capturedUri, caption.trim() || undefined);
      Alert.alert(
        'Moment sent',
        firebaseEnabled
          ? `${partnerName} will see it on their Home screen.`
          : 'Saved for this session.'
      );
      navigation.goBack();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Upload failed';
      Alert.alert('Could not send', message);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create moment</Text>
          <Text style={styles.headerSubtitle}>Doodle, type, sticker — then send</Text>
        </View>
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn} disabled={sending}>
          {sending ? (
            <ActivityIndicator color={theme.colors.background} size="small" />
          ) : (
            <Send color={theme.colors.background} size={20} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ViewShot ref={shotRef} options={{ format: 'jpg', quality: 0.9 }}>
          <View style={styles.canvas} {...panResponder.panHandlers}>
            <Image source={{ uri: imageUri }} style={styles.canvasImage} resizeMode="cover" />
            <View style={styles.canvasDim} />
            <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={StyleSheet.absoluteFill}>
              {strokes.map((stroke, idx) => (
                <Path
                  key={`stroke-${idx}`}
                  d={strokeToPath(stroke)}
                  stroke={stroke.color}
                  strokeWidth={4}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </Svg>
            {stickers.map((s) => (
              <Text key={s.id} style={[styles.sticker, { left: s.x - 16, top: s.y - 18 }]}>
                {s.emoji}
              </Text>
            ))}
            {textLabels.map((t) => (
              <Text
                key={t.id}
                style={[
                  styles.textLabel,
                  { left: t.x - 60, top: t.y - 14, color: t.color, maxWidth: CANVAS_SIZE - 24 },
                ]}
              >
                {t.text}
              </Text>
            ))}
          </View>
        </ViewShot>

        <View style={styles.toolModes}>
          <TouchableOpacity
            style={[styles.modeBtn, tool === 'draw' && styles.modeBtnActive]}
            onPress={() => {
              setTool('draw');
              setSelectedSticker(null);
            }}
          >
            <Pencil color={theme.colors.primary} size={18} />
            <Text style={styles.modeText}>Draw</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, tool === 'text' && styles.modeBtnActive]}
            onPress={() => {
              setTool('text');
              setSelectedSticker(null);
            }}
          >
            <Type color={theme.colors.primary} size={18} />
            <Text style={styles.modeText}>Text</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, tool === 'sticker' && styles.modeBtnActive]}
            onPress={() => setTool('sticker')}
          >
            <Smile color={theme.colors.primary} size={18} />
            <Text style={styles.modeText}>Sticker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeBtn} onPress={undo}>
            <Undo2 color={theme.colors.primary} size={18} />
            <Text style={styles.modeText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeBtn} onPress={clearAll}>
            <Eraser color={theme.colors.primary} size={18} />
            <Text style={styles.modeText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, brushColor === c && styles.colorDotActive]}
              onPress={() => setBrushColor(c)}
            />
          ))}
        </View>

        {tool === 'sticker' && (
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
        )}

        {tool === 'text' && (
          <View style={styles.quickTextRow}>
            {QUICK_TEXT.map((phrase) => (
              <TouchableOpacity key={phrase} style={styles.quickChip} onPress={() => addQuickText(phrase)}>
                <Text style={styles.quickChipText}>{phrase}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.captionLabel}>CAPTION (optional)</Text>
        <TextInput
          style={styles.captionInput}
          placeholder={`Say something to ${partnerName}...`}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={200}
        />

        <Text style={styles.hint}>
          {tool === 'draw' && 'Drag on the photo to doodle.'}
          {tool === 'text' && 'Tap the photo to place text, or use quick phrases.'}
          {tool === 'sticker' && 'Pick a sticker, then tap where you want it.'}
        </Text>
      </ScrollView>

      <Modal visible={textModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add text</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Type here..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={textDraft}
              onChangeText={setTextDraft}
              autoFocus
              maxLength={80}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setTextModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmTextLabel}>
                <Text style={styles.modalConfirm}>Place</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    borderRadius: theme.roundness.xl,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#000',
  },
  canvasImage: {
    ...StyleSheet.absoluteFillObject,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  canvasDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  sticker: {
    position: 'absolute',
    fontSize: 32,
  },
  textLabel: {
    position: 'absolute',
    fontSize: 22,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    width: 120,
    textAlign: 'center',
  },
  toolModes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modeBtn: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    minWidth: 56,
  },
  modeBtnActive: {
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  modeText: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: theme.colors.primary,
  },
  stickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
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
  quickTextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  quickChipText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  captionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.roundness.lg,
    backgroundColor: theme.colors.glass,
    padding: 14,
    color: theme.colors.primary,
    fontSize: 15,
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  modalInput: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glassBorder,
    color: theme.colors.primary,
    fontSize: 18,
    paddingVertical: 10,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  modalCancel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 15,
  },
  modalConfirm: {
    color: theme.colors.tertiary,
    fontSize: 15,
    fontWeight: '700',
  },
});
