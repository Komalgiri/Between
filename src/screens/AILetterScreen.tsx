import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image as RNImage,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, Sparkles, RefreshCw, Edit2, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { generateLoveLetter } from '../services/geminiService';
import { sendLetterToPartner, subscribeToPartnerLetters } from '../services/letterService';
import { LetterDoc } from '../types/firebase';
import { formatRelativeTime } from '../utils/time';
import { isGeminiConfigured } from '../config/geminiEnv';

const { width } = Dimensions.get('window');

const MOOD_CHIPS = ['Apology', 'Romantic', 'Missing You', 'Appreciation'];

export const AILetterScreen = () => {
  const navigation = useNavigation();
  const { userName, partnerName, relationshipId } = useAppContext();
  const { firebaseEnabled, user } = useAuth();

  const [selectedChip, setSelectedChip] = useState('Apology');
  const [prompt, setPrompt] = useState('');
  const [letterText, setLetterText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [partnerLetters, setPartnerLetters] = useState<LetterDoc[]>([]);

  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((prev) => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!firebaseEnabled || !user || !relationshipId) return;
    return subscribeToPartnerLetters(relationshipId, user.uid, setPartnerLetters);
  }, [firebaseEnabled, user, relationshipId]);

  const handleGenerate = useCallback(async () => {
    if (!isGeminiConfigured()) {
      Alert.alert(
        'Gemini API key needed',
        'Add EXPO_PUBLIC_GEMINI_API_KEY to .env (free at aistudio.google.com) and restart Expo with -c.'
      );
      return;
    }
    if (!prompt.trim()) {
      Alert.alert('Add a thought', 'Describe what you want to say — even a few words helps.');
      return;
    }

    setGenerating(true);
    setIsEditing(false);
    try {
      const text = await generateLoveLetter({
        tone: selectedChip,
        prompt,
        userName,
        partnerName,
      });
      setLetterText(text);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not generate letter.';
      Alert.alert('Generation failed', message);
    } finally {
      setGenerating(false);
    }
  }, [selectedChip, prompt, userName, partnerName]);

  const handleSend = async () => {
    if (!letterText.trim()) {
      Alert.alert('Nothing to send', 'Generate a letter first.');
      return;
    }
    if (!firebaseEnabled || !user || !relationshipId) {
      Alert.alert('Saved locally', 'Sign in with Firebase to send letters to your partner.');
      return;
    }

    setSending(true);
    try {
      await sendLetterToPartner(relationshipId, user.uid, {
        fromName: userName,
        tone: selectedChip,
        body: letterText.trim(),
      });
      Alert.alert('Sent', `${partnerName} can read it in AI Letters.`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not send letter.';
      Alert.alert('Send failed', message);
    } finally {
      setSending(false);
    }
  };

  const showTypingCursor = generating && !letterText;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={theme.colors.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Letters</Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer}>
          <RNImage
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnvVnLuuxZIpQrFtv-s7fhB6O4Bu-rrZKWYN5IuL9VfnJl150GkLFUkz65A8ISod5IMH-e6x5QbemTHSpconZAQagoSVGxzk5HdFgIHcoVj4DJSexBpCNzdN4e3RWb9lEJLZXWIrCLClFY2OqcrHJ31zgQ_qwdh8y52GirnXKq5Ep0Ef7wmsLCbsS2epHPbsUWMmARvp4vzt5R6dbctYCsD9FWySPqsOuSaX_vB3DUqat_nzh6xQ5QT-wwByJCE_g4ifsGlYM7GQ',
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {partnerLetters.length > 0 && (
          <View style={styles.inboxSection}>
            <Text style={styles.inboxLabel}>FROM {partnerName.toUpperCase()}</Text>
            {partnerLetters.slice(0, 3).map((letter) => (
              <TouchableOpacity
                key={letter.id}
                style={styles.inboxCard}
                onPress={() => setLetterText(letter.body)}
              >
                <Text style={styles.inboxTone}>{letter.tone}</Text>
                <Text style={styles.inboxPreview} numberOfLines={3}>
                  {letter.body}
                </Text>
                <Text style={styles.inboxTime}>{formatRelativeTime(letter.createdAt)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.visualContainer}>
          <RNImage
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkW7b-orl7V0eoCW_rcf9iU_9zzKV3gazx8E2t6eDz05FzUY2BgKN4d8iKU2Mo0i-B763pKm7LVNr8B1UtLH2nwrNCpzNBftE8oARxff3kaYqxogzxwZ8IwhXrk8YqnZmUKg1uS3yXp6gf4NTpQxtTcnWdB7GKOuazJjRx1Z9QQirV-TdN9eWxGVz-AsUrdUfZpRi0Ew8iD_fd_Iloq3Ri97ykk6Xa-EzGxu9_cIKCKtutfTK7Hnv4aHIvTCs1Qu3zBlyXYDJ8sg',
            }}
            style={styles.visualImage}
          />
          <View style={styles.visualOverlay} />
          <View style={styles.visualTextContainer}>
            <Text style={styles.visualLabel}>SHARED SPACE</Text>
            <Text style={styles.visualTitle}>Drafting a moment for us.</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>DESCRIBE YOUR HEART</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Tell the AI what's on your mind... like 'a thank you for the coffee this morning' or 'I miss our weekend walks'."
              placeholderTextColor="rgba(197, 197, 216, 0.4)"
              value={prompt}
              onChangeText={setPrompt}
              editable={!generating}
            />
          </View>

          <View style={styles.chipContainer}>
            {MOOD_CHIPS.map((chip) => {
              const isActive = selectedChip === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  onPress={() => setSelectedChip(chip)}
                  style={[styles.chip, isActive ? styles.activeChip : styles.inactiveChip]}
                  disabled={generating}
                >
                  <Text style={[styles.chipText, isActive ? styles.activeChipText : styles.inactiveChipText]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.generateButton, generating && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#646652" />
          ) : (
            <Text style={styles.generateButtonText}>GENERATE LETTER</Text>
          )}
        </TouchableOpacity>

        <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <Sparkles color="rgba(197, 197, 216, 0.6)" size={14} />
            <Text style={styles.previewLabel}>PREVIEW DRAFT</Text>
          </View>

          <View style={styles.previewCard}>
            <View style={styles.previewGlow} />
            {isEditing ? (
              <TextInput
                style={styles.previewTextInput}
                multiline
                value={letterText}
                onChangeText={setLetterText}
                autoFocus
              />
            ) : (
              <Text style={styles.previewText}>
                {letterText ||
                  (generating
                    ? 'Writing your letter'
                    : 'Your letter will appear here after you generate.')}
                {showTypingCursor && (cursorVisible ? '|' : '')}
              </Text>
            )}

            <View style={styles.previewFooter}>
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={handleGenerate}
                  disabled={generating || !prompt.trim()}
                >
                  <RefreshCw color="rgba(197, 197, 216, 0.6)" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setIsEditing((e) => !e)}
                  disabled={!letterText}
                >
                  <Edit2 color="rgba(197, 197, 216, 0.6)" size={20} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={sending || !letterText.trim()}
              >
                {sending ? (
                  <ActivityIndicator color={theme.colors.primary} size="small" />
                ) : (
                  <>
                    <Text style={styles.sendButtonText}>SEND NOW</Text>
                    <Send color={theme.colors.primary} size={16} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(20, 19, 18, 0.5)',
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 32,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingTop: 110,
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  inboxSection: {
    marginBottom: 24,
  },
  inboxLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  inboxCard: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    padding: 16,
    marginBottom: 10,
  },
  inboxTone: {
    color: theme.colors.tertiary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inboxPreview: {
    color: theme.colors.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  inboxTime: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 8,
  },
  visualContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(228, 228, 204, 0.1)',
    marginBottom: 32,
  },
  visualImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  visualOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  visualTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  visualLabel: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  visualTitle: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  textInput: {
    color: theme.colors.primary,
    fontSize: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: 'rgba(236, 185, 196, 0.2)',
    borderColor: 'rgba(236, 185, 196, 0.4)',
  },
  inactiveChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeChipText: {
    color: theme.colors.primary,
  },
  inactiveChipText: {
    color: theme.colors.secondary,
  },
  generateButton: {
    backgroundColor: '#e4e4cc',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 56,
    justifyContent: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.8,
  },
  generateButtonText: {
    color: '#646652',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  previewLabel: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(228, 228, 204, 0.1)',
    overflow: 'hidden',
  },
  previewGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(236, 185, 196, 0.1)',
  },
  previewText: {
    color: theme.colors.primary,
    fontSize: 20,
    lineHeight: 32,
    marginBottom: 24,
    minHeight: 80,
  },
  previewTextInput: {
    color: theme.colors.primary,
    fontSize: 20,
    lineHeight: 32,
    marginBottom: 24,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 24,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 120,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
