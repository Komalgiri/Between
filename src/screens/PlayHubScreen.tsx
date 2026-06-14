import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
  pickRandomPrompt,
} from '../data/playContent';

type PlayMode = 'daily' | 'nhie' | 'wyr';

const MODES: { id: PlayMode; label: string }[] = [
  { id: 'daily', label: 'Daily Q' },
  { id: 'nhie', label: 'Never Have I' },
  { id: 'wyr', label: 'Would You Rather' },
];

export const PlayHubScreen = () => {
  const navigation = useNavigation();
  const [mode, setMode] = useState<PlayMode>('daily');
  const [answer, setAnswer] = useState('');
  const [nhiePrompt, setNhiePrompt] = useState(() => pickRandomPrompt(NEVER_HAVE_I_EVER));
  const [wyrPrompt, setWyrPrompt] = useState(() => pickRandomPrompt(WOULD_YOU_RATHER));

  const dailyQuestion = useMemo(() => getDailyQuestionForDate(), []);

  const shufflePrompt = () => {
    if (mode === 'nhie') setNhiePrompt(pickRandomPrompt(NEVER_HAVE_I_EVER));
    if (mode === 'wyr') setWyrPrompt(pickRandomPrompt(WOULD_YOU_RATHER));
  };

  const activePrompt =
    mode === 'daily' ? dailyQuestion.text : mode === 'nhie' ? nhiePrompt.text : wyrPrompt.text;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quizzes & Games</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.heroCard}>
          <Sparkles color={theme.colors.tertiary} size={28} />
          <Text style={styles.heroTitle}>3,000+ conversation starters</Text>
          <Text style={styles.heroSubtitle}>
            {DAILY_QUESTIONS.length} daily questions in-app today — the full library
            grows with each release. New prompt every day.
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
            {mode === 'daily' ? "TODAY'S QUESTION" : mode === 'nhie' ? 'NEVER HAVE I EVER' : 'WOULD YOU RATHER'}
          </Text>
          <Text style={styles.promptText}>{activePrompt}</Text>

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
              <TouchableOpacity style={styles.primaryBtn}>
                <MessageCircle color={theme.colors.background} size={18} />
                <Text style={styles.primaryBtnText}>Send to Partner</Text>
              </TouchableOpacity>
            </>
          )}

          {mode !== 'daily' && (
            <View style={styles.gameActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={shufflePrompt}>
                <Shuffle color={theme.colors.primary} size={18} />
                <Text style={styles.secondaryBtnText}>Next Card</Text>
              </TouchableOpacity>
              <View style={styles.voteRow}>
                <TouchableOpacity style={styles.voteBtn}>
                  <ThumbsDown color={theme.colors.primary} size={22} />
                  <Text style={styles.voteLabel}>Nope</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.voteBtn, styles.voteBtnYes]}>
                  <ThumbsUp color={theme.colors.background} size={22} />
                  <Text style={[styles.voteLabel, styles.voteLabelYes]}>Done it!</Text>
                </TouchableOpacity>
              </View>
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
  },
  primaryBtnText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 14,
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
  voteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  voteLabelYes: {
    color: theme.colors.background,
  },
});
