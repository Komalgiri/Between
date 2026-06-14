import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft, BookOpen, Sparkles, Edit3, Share2, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const PROMPT_SUGGESTIONS = ['Our first date', 'The weekend getaway', 'When we met'];

export const StoryGeneratorScreen = () => {
  const navigation = useNavigation();
  const { addVaultItem } = useAppContext();
  const [prompt, setPrompt] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  
  // States: 'input' | 'generating' | 'result'
  const [screenState, setScreenState] = useState<'input' | 'generating' | 'result'>('input');
  
  // Animation for generation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // New Feature States
  const [showVaultToast, setShowVaultToast] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSaveToVault = () => {
    addVaultItem({
      id: Math.random().toString(),
      type: 'story',
      title: `Chapter: ${prompt || selectedSuggestion || 'A New Memory'}`,
      date: 'Just now',
    });
    setShowVaultToast(true);
    setTimeout(() => {
      setShowVaultToast(false);
      navigation.goBack(); // Optional: go back after saving or stay
    }, 2000);
  };

  const handleExportInsta = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  const mockGeneratedStory = `Chapter I\n\nThe light in the coffee shop was softer than usual that day, casting a warm golden hue across the small table where it all began. You were nervous, tapping your fingers against the porcelain cup, but the moment our eyes met, the noise of the world seemed to fade into a gentle hum. \n\nIt wasn't just a first date; it was the prologue to a sanctuary we would build together. Every laugh shared over that spilled latte was a foundation stone, every lingering glance a promise of the chapters yet to be written.`;

  useEffect(() => {
    if (screenState === 'generating') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();

      // Simulate network request then start typing
      setTimeout(() => {
        setScreenState('result');
        startTypewriter();
      }, 3000);
    }
  }, [screenState]);

  const startTypewriter = () => {
    setIsTyping(true);
    let i = 0;
    setDisplayedText('');
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const intervalId = setInterval(() => {
      setDisplayedText(mockGeneratedStory.substring(0, i + 1));
      i++;
      if (i >= mockGeneratedStory.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 30);
  };

  const handleGenerate = () => {
    if (!prompt && !selectedSuggestion) return;
    setScreenState('generating');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Story</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {screenState === 'input' && (
          <Animated.View style={styles.inputSection}>
            <View style={styles.heroIconWrapper}>
              <BookOpen color={theme.colors.primary} size={48} strokeWidth={1} />
            </View>
            <Text style={styles.heroTitle}>A Chapter Awaits</Text>
            <Text style={styles.heroSubtitle}>Tell the AI about a special moment, and watch it transform into a beautiful piece of literature.</Text>

            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="E.g., The time we got lost in the city..."
                placeholderTextColor="rgba(197, 197, 216, 0.4)"
                value={prompt}
                onChangeText={(text) => {
                  setPrompt(text);
                  setSelectedSuggestion('');
                }}
              />
            </View>

            <View style={styles.suggestionsContainer}>
              {PROMPT_SUGGESTIONS.map((suggestion) => {
                const isActive = selectedSuggestion === suggestion;
                return (
                  <TouchableOpacity 
                    key={suggestion}
                    onPress={() => {
                      setSelectedSuggestion(suggestion);
                      setPrompt(suggestion);
                    }}
                    style={[styles.suggestionChip, isActive && styles.activeChip]}
                  >
                    <Text style={[styles.suggestionText, isActive && styles.activeChipText]}>
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={[styles.generateButton, (!prompt && !selectedSuggestion) && styles.generateButtonDisabled]}
              onPress={handleGenerate}
              disabled={!prompt && !selectedSuggestion}
            >
              <Sparkles color={(!prompt && !selectedSuggestion) ? 'rgba(197, 197, 216, 0.4)' : theme.colors.background} size={18} />
              <Text style={[styles.generateButtonText, (!prompt && !selectedSuggestion) && styles.generateButtonTextDisabled]}>
                CRAFT CHAPTER
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {screenState === 'generating' && (
          <View style={styles.generatingSection}>
            <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Edit3 color={theme.colors.primary} size={40} />
            </Animated.View>
            <Text style={styles.generatingText}>Weaving your memories into words...</Text>
          </View>
        )}

        {screenState === 'result' && (
          <Animated.View style={[styles.resultSection, { opacity: fadeAnim }]}>
            <View style={styles.bookPage}>
              <View style={styles.pageGlow} />
              <Text style={styles.bookText}>
                {displayedText}
                {isTyping && <Text style={styles.cursor}>|</Text>}
              </Text>
              
              {!isTyping && (
                <View style={styles.pageFooter}>
                  <Text style={styles.pageNumber}>Page 1</Text>
                </View>
              )}
            </View>

            {!isTyping && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={handleExportInsta}>
                  <Share2 color={theme.colors.primary} size={24} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSaveToVault}>
                  <Text style={styles.primaryButtonText}>SAVE TO VAULT</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Toast and Overlays */}
      {showVaultToast && (
        <Animated.View style={styles.toastContainer}>
          <CheckCircle color="#4ADE80" size={20} />
          <Text style={styles.toastText}>Secured in Private Vault</Text>
        </Animated.View>
      )}

      {isExporting && (
        <View style={styles.exportOverlay}>
          <View style={styles.exportCard}>
            <Share2 color={theme.colors.primary} size={40} />
            <Text style={styles.exportText}>Preparing Story Card...</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(20, 19, 18, 0.8)',
    zIndex: 50,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '500',
    letterSpacing: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  heroIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    color: theme.colors.primary,
    fontWeight: '400',
    fontFamily: theme.typography.fontFamily,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(197, 197, 216, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  textInput: {
    color: theme.colors.primary,
    fontSize: 18,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 28,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 40,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: 'rgba(236, 185, 196, 0.1)',
    borderColor: 'rgba(236, 185, 196, 0.3)',
  },
  suggestionText: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  activeChipText: {
    color: theme.colors.primary,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
  },
  generateButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  generateButtonText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  generateButtonTextDisabled: {
    color: 'rgba(197, 197, 216, 0.4)',
  },
  generatingSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.2,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  generatingText: {
    color: 'rgba(197, 197, 216, 0.6)',
    fontSize: 16,
    letterSpacing: 1,
  },
  resultSection: {
    marginTop: 20,
  },
  bookPage: {
    backgroundColor: '#F7F3EB', // Light parchment aesthetic
    borderRadius: 8,
    padding: 32,
    minHeight: height * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 32,
  },
  pageGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  bookText: {
    color: '#2C2B29', // Dark ink color
    fontSize: 18,
    lineHeight: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cursor: {
    color: '#2C2B29',
    opacity: 0.5,
  },
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pageNumber: {
    color: '#A09D96',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  iconButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20, 19, 18, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    zIndex: 100,
  },
  toastText: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '600',
  },
  exportOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exportText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    letterSpacing: 1,
  },
});
