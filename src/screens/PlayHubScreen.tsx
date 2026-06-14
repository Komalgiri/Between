import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme/theme';
import {
  ArrowLeft,
  MessageCircle,
  Shuffle,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import {
  DAILY_QUESTIONS,
  NEVER_HAVE_I_EVER,
  WOULD_YOU_RATHER,
  getDailyQuestionForDate,
  parseWyrOptions,
  pickRandomPrompt,
} from '../data/playContent';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  buildPlayDocId,
  getPartnerResponse,
  submitPlayResponse,
  subscribeToPlayMeta,
  subscribeToPlaySession,
  updatePlayMetaPrompt,
} from '../services/playService';
import { PlayMode } from '../types/firebase';
import { dateKeyToday } from '../utils/anniversary';

const MODES: { id: PlayMode; label: string }[] = [
  { id: 'daily', label: 'Daily Q' },
  { id: 'nhie', label: 'Never Have I' },
  { id: 'wyr', label: 'Would You Rather' },
];

export const PlayHubScreen = () => {
  const navigation = useNavigation();
  const { partnerName, userName, relationshipId } = useAppContext();
  const { firebaseEnabled, user } = useAuth();

  const [mode, setMode] = useState<PlayMode>('daily');
  const [answer, setAnswer] = useState('');
  const [nhiePrompt, setNhiePrompt] = useState(() => pickRandomPrompt(NEVER_HAVE_I_EVER));
  const [wyrPrompt, setWyrPrompt] = useState(() => pickRandomPrompt(WOULD_YOU_RATHER));
  const [sending, setSending] = useState(false);
  const [partnerAnswer, setPartnerAnswer] = useState('');
  const [partnerVote, setPartnerVote] = useState<'yes' | 'no' | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<'a' | 'b' | null>(null);
  const [myVote, setMyVote] = useState<'yes' | 'no' | null>(null);
  const [myChoice, setMyChoice] = useState<'a' | 'b' | null>(null);
  const skipMetaEcho = useRef(false);

  const dailyQuestion = useMemo(() => getDailyQuestionForDate(), []);
  const dateKey = dateKeyToday();

  const activePromptId =
    mode === 'daily' ? dailyQuestion.id : mode === 'nhie' ? nhiePrompt.id : wyrPrompt.id;
  const activePromptText =
    mode === 'daily' ? dailyQuestion.text : mode === 'nhie' ? nhiePrompt.text : wyrPrompt.text;

  const playDocId = buildPlayDocId(mode, activePromptId, dateKey);
  const wyrOptions = useMemo(
    () => (mode === 'wyr' ? parseWyrOptions(activePromptText) : null),
    [mode, activePromptText]
  );

  useEffect(() => {
    if (!firebaseEnabled || !relationshipId) return;

    return subscribeToPlayMeta(relationshipId, (meta) => {
      if (skipMetaEcho.current) return;
      if (meta.nhiePromptId) {
        const prompt = NEVER_HAVE_I_EVER.find((p) => p.id === meta.nhiePromptId);
        if (prompt) setNhiePrompt(prompt);
      }
      if (meta.wyrPromptId) {
        const prompt = WOULD_YOU_RATHER.find((p) => p.id === meta.wyrPromptId);
        if (prompt) setWyrPrompt(prompt);
      }
    });
  }, [firebaseEnabled, relationshipId]);

  useEffect(() => {
    if (!firebaseEnabled || !user || !relationshipId) {
      setPartnerAnswer('');
      setPartnerVote(null);
      setPartnerChoice(null);
      setMyVote(null);
      setMyChoice(null);
      return;
    }

    return subscribeToPlaySession(relationshipId, playDocId, (session) => {
      const partner = getPartnerResponse(session, user.uid);
      const mine = session?.responses[user.uid];
      setPartnerAnswer(partner?.answer ?? '');
      setPartnerVote(partner?.vote ?? null);
      setPartnerChoice(partner?.choice ?? null);
      setMyVote(mine?.vote ?? null);
      setMyChoice(mine?.choice ?? null);
      if (mine?.answer && mode === 'daily') setAnswer(mine.answer);
    });
  }, [firebaseEnabled, user, relationshipId, playDocId, mode]);

  useEffect(() => {
    if (mode !== 'daily') setAnswer('');
  }, [mode]);

  useEffect(() => {
    if (mode === 'daily') return;
    setMyVote(null);
    setMyChoice(null);
    setPartnerVote(null);
    setPartnerChoice(null);
  }, [mode, activePromptId]);

  const shufflePrompt = async () => {
    if (mode === 'nhie') {
      const next = pickRandomPrompt(NEVER_HAVE_I_EVER);
      setNhiePrompt(next);
      if (firebaseEnabled && relationshipId) {
        skipMetaEcho.current = true;
        try {
          await updatePlayMetaPrompt(relationshipId, 'nhie', next.id);
        } finally {
          setTimeout(() => {
            skipMetaEcho.current = false;
          }, 400);
        }
      }
    }
    if (mode === 'wyr') {
      const next = pickRandomPrompt(WOULD_YOU_RATHER);
      setWyrPrompt(next);
      if (firebaseEnabled && relationshipId) {
        skipMetaEcho.current = true;
        try {
          await updatePlayMetaPrompt(relationshipId, 'wyr', next.id);
        } finally {
          setTimeout(() => {
            skipMetaEcho.current = false;
          }, 400);
        }
      }
    }
  };

  const sendResponse = async (data: { answer?: string; vote?: 'yes' | 'no'; choice?: 'a' | 'b' }) => {
    if (!firebaseEnabled || !user || !relationshipId) {
      Alert.alert('Offline mode', 'Sign in with Firebase to sync answers with your partner.');
      return;
    }

    setSending(true);
    try {
      await submitPlayResponse(
        relationshipId,
        user.uid,
        userName,
        { mode, promptId: activePromptId, promptText: activePromptText, dateKey },
        data
      );
      if (data.vote) setMyVote(data.vote);
      if (data.choice) setMyChoice(data.choice);
      if (data.answer) {
        Alert.alert('Sent', `${partnerName} can see your answer.`);
      }
    } catch {
      Alert.alert('Could not send', 'Check your connection and Firestore rules.');
    } finally {
      setSending(false);
    }
  };

  const partnerVoteLabel =
    partnerVote === 'yes' ? 'Done it!' : partnerVote === 'no' ? 'Nope' : null;

  const partnerChoiceLabel =
    partnerChoice && wyrOptions
      ? partnerChoice === 'a'
        ? wyrOptions[0]
        : wyrOptions[1]
      : null;

  const choicesMatch =
    mode === 'wyr' && myChoice && partnerChoice ? myChoice === partnerChoice : false;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quizzes & Games</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <Sparkles color={theme.colors.tertiary} size={28} />
          <Text style={styles.heroTitle}>Play together, stay close</Text>
          <Text style={styles.heroSubtitle}>
            Answers sync live between you and {partnerName}.
          </Text>
        </View>

        <View style={styles.modeRow}>
          {MODES.map((m) => {
            const selected = mode === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeChip, selected && styles.modeChipSelected]}
                onPress={() => setMode(m.id)}
              >
                <Text style={[styles.modeChipText, selected && styles.modeChipTextSelected]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>
            {mode === 'daily'
              ? "TODAY'S QUESTION"
              : mode === 'nhie'
                ? 'NEVER HAVE I EVER'
                : 'WOULD YOU RATHER'}
          </Text>
          <Text style={styles.promptText}>{activePromptText}</Text>

          {mode === 'daily' && (
            <>
              <Text style={styles.categoryTag}>{dailyQuestion.category}</Text>
              <TextInput
                style={styles.answerInput}
                placeholder="Share your answer (only you two will see it)..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={answer}
                onChangeText={setAnswer}
                multiline
              />
              <TouchableOpacity
                style={[styles.primaryBtn, sending && styles.primaryBtnDisabled]}
                onPress={() => sendResponse({ answer })}
                disabled={sending || !answer.trim()}
              >
                {sending ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <>
                    <MessageCircle color={theme.colors.background} size={18} />
                    <Text style={styles.primaryBtnText}>Send to Partner</Text>
                  </>
                )}
              </TouchableOpacity>
              {partnerAnswer ? (
                <View style={styles.partnerBox}>
                  <Text style={styles.partnerLabel}>{partnerName}'s answer</Text>
                  <Text style={styles.partnerText}>{partnerAnswer}</Text>
                </View>
              ) : null}
            </>
          )}

          {mode === 'nhie' && (
            <View style={styles.gameActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={shufflePrompt}>
                <Shuffle color={theme.colors.primary} size={18} />
                <Text style={styles.secondaryBtnText}>Next Card</Text>
              </TouchableOpacity>
              <View style={styles.voteRow}>
                <TouchableOpacity
                  style={[styles.voteBtn, myVote === 'no' && styles.voteBtnSelected]}
                  onPress={() => sendResponse({ vote: 'no' })}
                  disabled={sending}
                >
                  <ThumbsDown color={theme.colors.primary} size={22} />
                  <Text style={styles.voteLabel}>Nope</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.voteBtn, styles.voteBtnYes, myVote === 'yes' && styles.voteBtnYesSelected]}
                  onPress={() => sendResponse({ vote: 'yes' })}
                  disabled={sending}
                >
                  <ThumbsUp color={theme.colors.background} size={22} />
                  <Text style={[styles.voteLabel, styles.voteLabelYes]}>Done it!</Text>
                </TouchableOpacity>
              </View>
              {partnerVoteLabel ? (
                <View style={styles.partnerBox}>
                  <Text style={styles.partnerLabel}>{partnerName} voted</Text>
                  <Text style={styles.partnerText}>{partnerVoteLabel}</Text>
                </View>
              ) : null}
            </View>
          )}

          {mode === 'wyr' && wyrOptions && (
            <View style={styles.gameActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={shufflePrompt}>
                <Shuffle color={theme.colors.primary} size={18} />
                <Text style={styles.secondaryBtnText}>Next Card</Text>
              </TouchableOpacity>
              <View style={styles.wyrOptions}>
                <TouchableOpacity
                  style={[styles.wyrBtn, myChoice === 'a' && styles.wyrBtnSelected]}
                  onPress={() => sendResponse({ choice: 'a' })}
                  disabled={sending}
                >
                  <Text style={styles.wyrBtnLabel}>A</Text>
                  <Text style={styles.wyrBtnText}>{wyrOptions[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.wyrBtn, myChoice === 'b' && styles.wyrBtnSelected]}
                  onPress={() => sendResponse({ choice: 'b' })}
                  disabled={sending}
                >
                  <Text style={styles.wyrBtnLabel}>B</Text>
                  <Text style={styles.wyrBtnText}>{wyrOptions[1]}</Text>
                </TouchableOpacity>
              </View>
              {partnerChoiceLabel ? (
                <View style={styles.partnerBox}>
                  <Text style={styles.partnerLabel}>{partnerName} picked</Text>
                  <Text style={styles.partnerText}>{partnerChoiceLabel}</Text>
                  {choicesMatch ? (
                    <Text style={styles.matchText}>You matched on this one!</Text>
                  ) : myChoice ? (
                    <Text style={styles.matchTextMuted}>Different picks — talk it through</Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.containerPadding,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backBtn: {
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
  scroll: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingBottom: 48,
  },
  heroCard: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.roundness.xl,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.roundness.lg,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    alignItems: 'center',
  },
  modeChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  modeChipTextSelected: {
    color: theme.colors.background,
  },
  promptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.roundness.xl,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    padding: 24,
  },
  promptLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 22,
    color: theme.colors.primary,
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 16,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.tertiary,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  answerInput: {
    minHeight: 100,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    padding: 16,
    color: theme.colors.primary,
    fontSize: 15,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.lg,
    paddingVertical: 14,
    minHeight: 48,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  partnerBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: theme.roundness.lg,
    backgroundColor: 'rgba(236, 185, 196, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(236, 185, 196, 0.2)',
  },
  partnerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.tertiary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  partnerText: {
    fontSize: 15,
    color: theme.colors.primary,
    lineHeight: 22,
  },
  gameActions: {
    gap: 16,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  secondaryBtnText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  voteRow: {
    flexDirection: 'row',
    gap: 12,
  },
  voteBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: theme.roundness.lg,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    gap: 6,
  },
  voteBtnYes: {
    backgroundColor: theme.colors.tertiary,
    borderColor: theme.colors.tertiary,
  },
  voteBtnSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(245, 245, 220, 0.12)',
  },
  voteBtnYesSelected: {
    opacity: 0.85,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  voteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  voteLabelYes: {
    color: theme.colors.background,
  },
  wyrOptions: {
    gap: 12,
  },
  wyrBtn: {
    padding: 16,
    borderRadius: theme.roundness.lg,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    gap: 6,
  },
  wyrBtnSelected: {
    borderColor: theme.colors.tertiary,
    backgroundColor: 'rgba(236, 185, 196, 0.12)',
  },
  wyrBtnLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.tertiary,
  },
  wyrBtnText: {
    fontSize: 15,
    color: theme.colors.primary,
    lineHeight: 22,
    fontWeight: '500',
  },
  matchText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#4ADE80',
  },
  matchTextMuted: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
});
